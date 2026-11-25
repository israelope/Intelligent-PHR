"use client";

import { useEffect, useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  async function loadDocuments() {
    const res = await fetch("/api/documents");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load documents.");
    setDocuments(data.documents);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        await loadDocuments();
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoadingDocs(false);
      }
    }

    // React 19: keep state updates in the async callback, not the effect body.
    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not upload the document.");
      setFile(null);
      setLoadingDocs(true);
      try {
        await loadDocuments();
      } finally {
        setLoadingDocs(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Document</h1>

      {/* FR3 + FR5 + FR6: upload, AI summarisation and categorisation */}
      <form onSubmit={handleUpload} className="card p-5 space-y-4">
        <div>
          <label className="label" htmlFor="document-file">
            Medical document (PDF, image, or text file - max 10 MB)
          </label>
          <input
            id="document-file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0
                       file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold
                       file:text-white hover:file:bg-brand-700"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={!file || uploading} className="btn-primary">
          {uploading ? "Uploading & summarising..." : "Upload"}
        </button>
        <p className="text-xs text-gray-500">
          Note: AI-generated summaries and categories are informational only and do not
          constitute medical advice or diagnosis.
        </p>
      </form>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Your documents</h2>
        {loadingDocs ? (
          <div className="space-y-3" aria-label="Loading documents">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <li key={doc.document_id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{doc.file_name}</p>
                  {doc.signed_url && (
                    <a
                      href={doc.signed_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-brand-600 hover:underline shrink-0"
                    >
                      Open
                    </a>
                  )}
                </div>
                <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold mt-1">
                  {doc.category}
                </p>
                <p className="text-sm text-gray-600">
                  {doc.ai_summary || "Summary unavailable (check your ANTHROPIC_API_KEY)."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
