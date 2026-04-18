"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const blankForm = { id: null, name: "", description: "" };

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedClass = useMemo(
    () => classes.find((item) => item.id === selectedId) || null,
    [classes, selectedId]
  );

  const resetStatus = () => {
    setError("");
    setMessage("");
  };

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/classes", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Unable to load classes");
      }
      const data = await res.json();
      const list = data.classes || [];
      setClasses(list);
      if (selectedId && !list.some((item) => item.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    if (!form.name.trim()) {
      setError("Class name is required");
      return;
    }
    try {
      setLoading(true);
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/classes/${form.id}` : "/api/classes";
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save class");
      }
      setMessage(form.id ? "Class updated" : "Class created");
      setForm(blankForm);
      await loadClasses();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    resetStatus();
    if (
      !window.confirm(
        "Delete this class? All subjects in this class will also be removed."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete class");
      }
      setMessage("Class deleted");
      if (selectedId === id) {
        setSelectedId(null);
      }
      if (form.id === id) {
        setForm(blankForm);
      }
      await loadClasses();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete class");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cls) => {
    setForm({
      id: cls.id,
      name: cls.name,
      description: cls.description || "",
    });
    setSelectedId(cls.id);
    resetStatus();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Classes</h2>
          <p className="text-sm text-slate-600">
            Create and manage classes that contain subjects.
          </p>
        </div>
        <span className="text-sm text-slate-500">{classes.length} total</span>
      </div>

      {(error || message) && (
        <div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {message}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-slate-900">
              {form.id ? "Edit Class" : "New Class"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Grade 10"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional description"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : form.id ? "Update" : "Create"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(blankForm);
                      setSelectedId(null);
                      resetStatus();
                    }}
                    disabled={loading}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white">
            {loading && classes.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading classes...
              </div>
            ) : classes.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No classes yet. Create one to get started.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-4 transition-colors ${
                      selectedId === cls.id ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900">
                            {cls.name}
                          </h4>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {cls.subjectCount || 0} subjects
                          </span>
                        </div>
                        {cls.description && (
                          <p className="mt-1 text-sm text-slate-600">
                            {cls.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Link
                          href={`/subjects?class_id=${cls.id}`}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Subjects
                        </Link>
                        <button
                          onClick={() => handleEdit(cls)}
                          disabled={loading}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          disabled={loading}
                          className="rounded-md border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
