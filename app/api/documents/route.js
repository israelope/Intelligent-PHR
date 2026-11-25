import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("upload_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach a short-lived signed URL to each document so the frontend can
  // let the user open/download their own file from the private bucket.
  const withUrls = await Promise.all(
    (data || []).map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path, 60 * 10); // 10 minutes
      return { ...doc, signed_url: signed?.signedUrl || null };
    })
  );

  return NextResponse.json({ documents: withUrls });
}
