import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { answerHealthQuery } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

// FR4: natural-language querying. Mirrors the sequence diagram in Figure
// (NL Query): Frontend -> Backend API -> Database (RLS-filtered) -> AI
// Layer -> Backend -> Frontend.

function buildContext(records, documents) {
  const recordLines = (records || []).map(
    (r) => `- [${r.record_type}] ${r.title}: ${r.description || "(no description)"}`
  );
  const documentLines = (documents || [])
    .filter((d) => d.ai_summary)
    .map((d) => `- Document "${d.file_name}" (${d.category}): ${d.ai_summary}`);

  return [...recordLines, ...documentLines].join("\n");
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { question } = await request.json();
  if (!question || !question.trim()) {
    return NextResponse.json({ error: "A question is required" }, { status: 400 });
  }
  if (question.length > 1000) {
    return NextResponse.json({ error: "Please keep your question under 1000 characters" }, { status: 400 });
  }

  const limit = await checkRateLimit(supabase, user.id, "query");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many questions. Please try again in about ${limit.retryAfterMinutes} minutes.` },
      { status: 429 }
    );
  }

  // These two queries are automatically scoped to the caller's own rows
  // by the RLS policies defined in supabase/schema.sql.
  const [{ data: records }, { data: documents }] = await Promise.all([
    supabase.from("health_records").select("record_type, title, description"),
    supabase.from("documents").select("file_name, category, ai_summary"),
  ]);

  const context = buildContext(records, documents).slice(0, 20000);

  let answer;
  try {
    answer = await answerHealthQuery({ question, context });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }

  await supabase.from("ai_queries").insert({
    user_id: user.id,
    query_text: question,
    ai_response: answer,
  });

  return NextResponse.json({ answer });
}
