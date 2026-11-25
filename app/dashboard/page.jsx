import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import InsightsPanel from "@/components/InsightsPanel";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: recordCount }, { data: documents, count: documentCount }, { data: insights }] =
    await Promise.all([
      supabase.from("health_records").select("*", { count: "exact", head: true }),
      supabase
        .from("documents")
        .select("*", { count: "exact" })
        .order("upload_date", { ascending: false })
        .limit(3),
      supabase.from("health_insights").select("*").order("generated_at", { ascending: false }).limit(4),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome back</h1>

      {/* FR8: dashboard summarising records, recent activity and insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Health records</p>
          <p className="text-3xl font-bold text-brand-600">{recordCount || 0}</p>
          <Link href="/dashboard/records" className="text-sm text-brand-600 hover:underline">
            View records &rarr;
          </Link>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Documents uploaded</p>
          <p className="text-3xl font-bold text-brand-600">{documentCount || 0}</p>
          <Link href="/dashboard/upload" className="text-sm text-brand-600 hover:underline">
            Upload a document &rarr;
          </Link>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Ask about your health</p>
          <p className="text-sm text-gray-700 mt-1">Query your records in plain language.</p>
          <Link href="/dashboard/query" className="text-sm text-brand-600 hover:underline">
            Ask AI &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Recent Documents</h2>
          {!documents || documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.document_id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                  <p className="font-medium">{doc.file_name}</p>
                  <p className="text-gray-500">
                    {doc.category}
                    {doc.ai_summary ? ` — ${doc.ai_summary.slice(0, 80)}...` : " (summarising...)"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <InsightsPanel initialInsights={insights || []} />
      </div>
    </div>
  );
}
