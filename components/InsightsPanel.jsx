"use client";

import { useState } from "react";

export default function InsightsPanel({ initialInsights }) {
  const [insights, setInsights] = useState(initialInsights || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate insights");
      setInsights(data.insights);
      if (data.cached) {
        setNotice("Insights were generated recently, so these are the latest available.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5 bg-green-50 border-green-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-green-900">AI Health Insights</h2>
        <button onClick={handleGenerate} disabled={loading} className="btn-secondary py-1! px-3! text-xs">
          {loading ? "Thinking..." : "Refresh insights"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-2">
          {error}
        </p>
      )}
      {notice && <p className="mb-2 text-xs text-green-800">{notice}</p>}

      {insights.length === 0 ? (
        <p className="text-sm text-green-800">
          No insights yet. Add some records or documents, then click &ldquo;Refresh insights&rdquo;.
        </p>
      ) : (
        <ul className="space-y-1.5 text-sm text-green-900">
          {insights.map((i) => (
            <li key={i.insight_id || i} className="flex gap-2">
              <span>&bull;</span>
              <span>{i.insight_text || i}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-green-700 mt-3">
        These are general, non-diagnostic observations - not medical advice.
      </p>
    </div>
  );
}
