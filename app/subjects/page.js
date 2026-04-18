"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const blankForm = {
  id: null,
  name: "",
  description: "",
  class_id: null,
  book_id: null,
  category_id: null,
};

function SubjectsPageContent() {
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("class_id");

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    ...blankForm,
    class_id: classIdParam ? parseInt(classIdParam) : null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resetStatus = () => {
    setError("");
    setMessage("");
  };

  const loadClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/classes", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load classes");
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load books");
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const url = classIdParam
        ? `/api/subjects?class_id=${classIdParam}`
        : "/api/subjects";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Unable to load subjects");
      }
      const data = await res.json();
      const list = data.subjects || [];
      setSubjects(list);
      if (selectedId && !list.some((item) => item.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, [selectedId, classIdParam]);

  useEffect(() => {
    loadClasses();
    loadBooks();
    loadCategories();
    loadSubjects();
  }, [loadClasses, loadBooks, loadCategories, loadSubjects]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    if (!form.name.trim()) {
      setError("Subject name is required");
      return;
    }
    if (!form.class_id) {
      setError("Please select a class");
      return;
    }
    try {
      setLoading(true);
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/subjects/${form.id}` : "/api/subjects";
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        class_id: form.class_id,
        book_id: form.book_id || null,
        category_id: form.category_id || null,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save subject");
      }
      setMessage(form.id ? "Subject updated" : "Subject created");
      setForm({
        ...blankForm,
        class_id: classIdParam ? parseInt(classIdParam) : null,
      });
      await loadSubjects();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    resetStatus();
    if (!window.confirm("Delete this subject?")) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete subject");
      }
      setMessage("Subject deleted");
      if (selectedId === id) {
        setSelectedId(null);
      }
      if (form.id === id) {
        setForm({
          ...blankForm,
          class_id: classIdParam ? parseInt(classIdParam) : null,
        });
      }
      await loadSubjects();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete subject");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setForm({
      id: subject.id,
      name: subject.name,
      description: subject.description || "",
      class_id: subject.class_id,
      book_id: subject.book_id || null,
      category_id: subject.category_id || null,
    });
    setSelectedId(subject.id);
    resetStatus();
  };

  const selectedClass = classes.find((c) => c.id === parseInt(classIdParam));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {selectedClass ? `${selectedClass.name} - Subjects` : "Subjects"}
          </h2>
          <p className="text-sm text-slate-600">
            Manage subjects and link them to books or categories.
          </p>
        </div>
        <span className="text-sm text-slate-500">{subjects.length} total</span>
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
              {form.id ? "Edit Subject" : "New Subject"}
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
                  placeholder="e.g., Mathematics"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Class
                </label>
                <select
                  value={form.class_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      class_id: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
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
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Link to Book (optional)
                </label>
                <select
                  value={form.book_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      book_id: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">None</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Link to Category (optional)
                </label>
                <select
                  value={form.category_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category_id: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">None</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                      setForm({
                        ...blankForm,
                        class_id: classIdParam ? parseInt(classIdParam) : null,
                      });
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
            {loading && subjects.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading subjects...
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No subjects yet. Create one to get started.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`p-4 transition-colors ${
                      selectedId === subject.id
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900">
                            {subject.name}
                          </h4>
                          {subject.class_name && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                              {subject.class_name}
                            </span>
                          )}
                        </div>
                        {subject.description && (
                          <p className="mt-1 text-sm text-slate-600">
                            {subject.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          {subject.book_title && (
                            <span className="flex items-center gap-1">
                              <span>📚</span> {subject.book_title}
                            </span>
                          )}
                          {subject.category_name && (
                            <span className="flex items-center gap-1">
                              <span>📂</span> {subject.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          disabled={loading}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
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

export default function SubjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubjectsPageContent />
    </Suspense>
  );
}
