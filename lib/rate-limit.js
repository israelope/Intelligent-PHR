// Lightweight per-user rate limits using the tables we already have.
// No extra table or external service is needed: RLS means the count query
// only ever sees rows belonging to the signed-in user.

const RULES = {
  query: {
    table: "ai_queries",
    timestampColumn: "created_at",
    windowMs: 10 * 60 * 1000,
    limit: 15,
  },
  insights: {
    table: "health_insights",
    timestampColumn: "generated_at",
    windowMs: 60 * 60 * 1000,
    limit: 6,
  },
  upload: {
    table: "documents",
    timestampColumn: "upload_date",
    windowMs: 60 * 60 * 1000,
    limit: 20,
  },
};

export async function checkRateLimit(supabase, userId, action) {
  const rule = RULES[action];
  if (!rule) return { allowed: true };

  const since = new Date(Date.now() - rule.windowMs).toISOString();
  const { count, error } = await supabase
    .from(rule.table)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte(rule.timestampColumn, since);

  if (error) {
    // Never lock a user out because of a transient database error.
    console.error("Rate-limit check failed:", error.message);
    return { allowed: true };
  }

  const used = count || 0;
  return {
    allowed: used < rule.limit,
    remaining: Math.max(0, rule.limit - used),
    retryAfterMinutes: Math.ceil(rule.windowMs / 60000),
  };
}
