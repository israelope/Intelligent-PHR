"use client";

import { useState } from "react";

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // { role: 'user' | 'assistant', text }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ask about your health data</h1>
      <p className="text-sm text-gray-500">
        Questions are answered using only your own stored records and documents. This is not a
        substitute for professional medical advice.
      </p>

      {/* FR4: natural-language querying */}
      <div className="card p-5 min-h-[20rem] flex flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto mb-4">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400">
              Try asking: &ldquo;What medications am I currently taking?&rdquo;
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
                m.role === "user" ? "bg-brand-50 ml-auto text-right" : "bg-gray-100"
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && <div className="text-sm text-gray-400">Thinking...</div>}
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 mb-2">
            {error}
          </p>
        )}

        <form onSubmit={handleAsk} className="flex gap-2">
          <label className="sr-only" htmlFor="health-question">
            Your question
          </label>
          <input
            id="health-question"
            className="input"
            placeholder="Type a question..."
            maxLength={1000}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary shrink-0">
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
