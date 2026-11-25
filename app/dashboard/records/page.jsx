"use client";

import { useEffect, useState } from "react";

const RECORD_TYPES = ["medication", "allergy", "medical history", "lab result", "other"];

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ record_type: RECORD_TYPES[0], title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ record_type: "", title: "", description: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      try {
        const res = await fetch("/api/records");
        const data = await res.json();
        if (!active) return;
        if (res.ok) setRecords(data.records);
        else setError(data.error || "Could not load records.");
      } catch {
        if (active) setError("Could not load records. Check your connection and refresh.");
      } finally {
        if (active) setLoading(false);
      }
    }

    // React 19: keep state updates in the async callback, not the effect body.
    loadRecords();
    return () => {
      active = false;
    };
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add the record.");
      setForm({ record_type: RECORD_TYPES[0], title: "", description: "" });
      setRecords((prev) => [data.record, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not delete the record.");
      }
      setRecords((prev) => prev.filter((r) => r.record_id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteId(null);
    }
  }

  function startEdit(record) {
    setEditingId(record.record_id);
    setEditForm({
      record_type: record.record_type,
      title: record.title,
      description: record.description || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(id) {
    if (!editForm.title.trim()) return;
    setEditSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save changes.");
      setRecords((prev) => prev.map((r) => (r.record_id === id ? data.record : r)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Health Records</h1>

      {/* FR2: create, view, update and delete structured health records */}
      <form onSubmit={handleAdd} className="card p-5 space-y-4">
        <h2 className="font-semibold">Add a record</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label" htmlFor="record-type">
              Type
            </label>
            <select
              id="record-type"
              className="input"
              value={form.record_type}
              onChange={(e) => setForm({ ...form, record_type: e.target.value })}
            >
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="record-title">
              Title
            </label>
            <input
              id="record-title"
              className="input"
              placeholder="e.g. Amoxicillin 500mg"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="record-description">
            Description (optional)
          </label>
          <textarea
            id="record-description"
            className="input"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Add record"}
        </button>
      </form>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Your records</h2>
        {loading ? (
          <div className="space-y-3" aria-label="Loading records">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-500">No records yet - add your first one above.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {records.map((r) =>
              editingId === r.record_id ? (
                <li key={r.record_id} className="py-3 space-y-3 bg-brand-50 -mx-5 px-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      aria-label="Record type"
                      className="input"
                      value={editForm.record_type}
                      onChange={(e) => setEditForm({ ...editForm, record_type: e.target.value })}
                    >
                      {RECORD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      aria-label="Record title"
                      className="input sm:col-span-2"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <textarea
                    aria-label="Record description"
                    className="input"
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(r.record_id)}
                      disabled={editSaving}
                      className="btn-primary py-1! px-3! text-xs"
                    >
                      {editSaving ? "Saving..." : "Save changes"}
                    </button>
                    <button onClick={cancelEdit} className="btn-secondary py-1! px-3! text-xs">
                      Cancel
                    </button>
                  </div>
                </li>
              ) : (
                <li key={r.record_id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold">
                      {r.record_type}
                    </p>
                    <p className="font-medium">{r.title}</p>
                    {r.description && <p className="text-sm text-gray-500">{r.description}</p>}
                  </div>
                  <div className="flex shrink-0 items-end">
                    {deleteId === r.record_id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => handleDelete(r.record_id)}
                          className="font-semibold text-red-600 hover:underline"
                        >
                          Confirm delete
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(r)}
                          className="text-sm text-brand-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(r.record_id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
