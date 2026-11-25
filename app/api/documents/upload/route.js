import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { summariseAndCategorise } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

// FR3 + FR5 + FR6: upload a medical document, store it, extract its text,
// and have the AI layer summarise and categorise it (Figure 3.6's
// sequence: Frontend -> Backend API -> Storage -> AI Layer -> Backend).

export const runtime = "nodejs"; // pdf-parse needs the Node.js runtime, not Edge.

async function extractText(file, bytes) {
  const type = file.type;

  if (type === "application/pdf") {
    // Lazy-import so the (fairly large) pdf-parse library is only loaded
    // for requests that actually need it. pdf-parse v2 needs its worker
    // registered before the parser is created (see next.config.js too).
    await import("pdf-parse/worker");
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: Buffer.from(bytes) });
    try {
      const result = await parser.getText();
      return { text: result.text, imageBase64: null, mediaType: null };
    } finally {
      await parser.destroy();
    }
  }

  if (type.startsWith("image/")) {
    // Let the AI model read the image directly (it has vision capability)
    // rather than trying to OCR it ourselves.
    const base64 = Buffer.from(bytes).toString("base64");
    return { text: null, imageBase64: base64, mediaType: type };
  }

  // Plain text / anything else: read as UTF-8 text.
  return { text: Buffer.from(bytes).toString("utf-8"), imageBase64: null, mediaType: null };
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const limit = await checkRateLimit(supabase, user.id, "upload");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many uploads. Please try again in about ${limit.retryAfterMinutes} minutes.` },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const recordId = formData.get("record_id") || null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds the 10 MB limit" }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Allowed: PDF, PNG, JPEG, WEBP, TXT.` },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();

  // 1. Store the file in the private 'documents' bucket, under the user's
  //    own folder - this is what lets the storage RLS policies in
  //    supabase/schema.sql work.
  const filePath = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, bytes, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // 2. Extract text (or prepare the image) for the AI layer.
  let extracted;
  try {
    extracted = await extractText(file, bytes);
  } catch (err) {
    return NextResponse.json(
      { error: `Could not read file contents: ${err.message}` },
      { status: 500 }
    );
  }

  // 3. Ask the AI layer to summarise and categorise it.
  let summary = null;
  let category = "Other";
  try {
    const result = await summariseAndCategorise(extracted);
    summary = result.summary;
    category = result.category;
  } catch (err) {
    // Document is still saved even if the AI step fails (e.g. missing API
    // key) - the user can retry summarisation later rather than losing
    // the upload entirely.
    console.error("AI summarisation failed:", err.message);
  }

  // 4. Record it in the database.
  const { data: document, error: dbError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      record_id: recordId,
      file_path: filePath,
      file_name: file.name,
      ai_summary: summary,
      category,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ document }, { status: 201 });
}
