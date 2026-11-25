import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateHealthInsights } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

// FR7: basic, non-diagnostic AI-assisted health insights.

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("health_insights")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ insights: data });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Reuse recent insights so repeated "Refresh" clicks do not create
  // duplicate rows or spend API credits on the same data.
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("health_insights")
    .select("*")
    .eq("user_id", user.id)
    .gte("generated_at", since)
    .order("generated_at", { ascending: false });
  if (recent?.length) {
    return NextResponse.json({ insights: recent, cached: true });
  }

  const limit = await checkRateLimit(supabase, user.id, "insights");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many insight requests. Please try again in about ${limit.retryAfterMinutes} minutes.` },
      { status: 429 }
    );
  }

  const [{ data: records }, { data: documents }] = await Promise.all([
    supabase.from("health_records").select("record_type, title, description"),
    supabase.from("documents").select("file_name, category, ai_summary"),
  ]);

  const recordLines = (records || []).map((r) => `- [${r.record_type}] ${r.title}`);
  const documentLines = (documents || [])
    .filter((d) => d.ai_summary)
    .map((d) => `- ${d.category}: ${d.ai_summary}`);
  const context = [...recordLines, ...documentLines].join("\n");

  let insightTexts;
  try {
    insightTexts = await generateHealthInsights({ context });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }

  const rows = insightTexts.map((text) => ({ user_id: user.id, insight_text: text }));
  const { data: inserted, error } = await supabase.from("health_insights").insert(rows).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ insights: inserted }, { status: 201 });
}
