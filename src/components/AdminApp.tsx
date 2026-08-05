"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PostContent } from "@/components/PostContent";
import type { StoredPost } from "@/lib/posts-store";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface PostForm {
  title: string;
  date: string;
  excerpt: string;
  tags: string;
  content: string;
}

const EMPTY_FORM: PostForm = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  excerpt: "",
  tags: "",
  content: "",
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Terjadi kesalahan");
  }
  return data as T;
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

const labelClass = "block text-sm font-medium text-muted mb-1.5";

const btnPrimary =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50";

const btnGhost =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:border-accent transition-colors";

export function AdminApp({
  initiallyAuthenticated,
  initialPosts,
}: {
  initiallyAuthenticated: boolean;
  initialPosts: StoredPost[];
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [posts, setPosts] = useState<StoredPost[]>(initialPosts);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<StoredPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    setError("");
    try {
      const data = await fetchJson<{ posts: StoredPost[] }>("/api/admin/posts");
      setPosts(data.posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat artikel");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      await fetchJson("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setPassword("");
      setAuthenticated(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetchJson("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAuthenticated(false);
    router.refresh();
  }

  function startCreate() {
    setEditing(null);
    setIsNew(true);
    setForm(EMPTY_FORM);
    setPreview(false);
  }

  function startEdit(post: StoredPost) {
    setEditing(post);
    setIsNew(false);
    setForm({
      title: post.title,
      date: post.date.slice(0, 10),
      excerpt: post.excerpt,
      tags: post.tags.join(", "),
      content: post.content,
    });
    setPreview(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const body = JSON.stringify({ ...form, tags });

      if (isNew) {
        await fetchJson("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } else if (editing) {
        await fetchJson(`/api/admin/posts/${editing.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
        });
      }
      setEditing(null);
      setIsNew(false);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan artikel");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm("Yakin ingin menghapus artikel ini?")) return;
    setDeleting(slug);
    setError("");
    try {
      await fetchJson(`/api/admin/posts/${slug}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus artikel");
    } finally {
      setDeleting(null);
    }
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 py-24">
        <div className="rounded-2xl border border-border bg-card/50 p-8">
          <h1 className="text-2xl font-bold mb-1">Login Admin</h1>
          <p className="text-sm text-muted mb-6">
            Masukkan password untuk mengelola artikel blog.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                autoFocus
                required
              />
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <button
              type="submit"
              className={`${btnPrimary} w-full justify-center`}
              disabled={loginLoading || !password}
            >
              {loginLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Kelola Blog</h1>
          <p className="text-muted mt-1 text-sm">
            Tulis, edit, dan hapus artikel langsung dari website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button onClick={startCreate} className={btnPrimary}>
              <Plus className="h-4 w-4" />
              Tulis Artikel
            </button>
          )}
          <button onClick={handleLogout} className={btnGhost}>
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {(isNew || editing) && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-border bg-card/50 p-6 space-y-5 mb-10"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isNew ? "Tulis Artikel Baru" : `Edit: ${editing?.title}`}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className={btnGhost}
              >
                {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {preview ? "Tulis" : "Pratinjau"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsNew(false);
                }}
                className={btnGhost}
              >
                <ArrowLeft className="h-4 w-4" />
                Batal
              </button>
            </div>
          </div>

          {preview ? (
            <div className="rounded-xl border border-border bg-background p-6">
              <h1 className="text-2xl sm:text-3xl font-bold">{form.title || "Tanpa Judul"}</h1>
              <p className="text-sm text-muted mt-2">{form.date}</p>
              <div className="mt-4">
                <PostContent content={form.content || "Belum ada isi artikel."} />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="title" className={labelClass}>
                  Judul *
                </label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder="Judul artikel"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className={labelClass}>
                    Tanggal
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tags" className={labelClass}>
                    Tag (pisahkan dengan koma)
                  </label>
                  <input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className={inputClass}
                    placeholder="contoh: programming, tutorial"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="excerpt" className={labelClass}>
                  Ringkasan
                </label>
                <textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className={`${inputClass} resize-y`}
                  rows={2}
                  placeholder="Ringkasan singkat artikel (opsional)"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="content" className="text-sm font-medium text-muted">
                    Isi Artikel *
                  </label>
                  <span className="text-xs text-muted/60">
                    Dukung format: **tebal**, *miring*, `kode`, # judul, - list
                  </span>
                </div>
                <textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className={`${inputClass} resize-y font-mono text-sm leading-relaxed`}
                  rows={14}
                  placeholder="Tulis isi artikel di sini..."
                  required
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsNew(false);
              }}
              className={btnGhost}
            >
              Batal
            </button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isNew ? "Publish Artikel" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}

      {error && !isNew && !editing && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      {loadingPosts ? (
        <div className="flex items-center justify-center py-20 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : posts.length === 0 && !isNew && !editing ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card/30">
          <p className="text-muted text-lg">Belum ada artikel.</p>
          <button onClick={startCreate} className={`${btnPrimary} mt-4`}>
            <Plus className="h-4 w-4" />
            Tulis Artikel Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-xl border border-border bg-card/50"
            >
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{post.title}</h3>
                <p className="text-xs text-muted mt-1">
                  {new Date(post.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {post.tags.length > 0 &&
                    ` · ${post.tags.map((t) => `#${t}`).join(" ")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEdit(post)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted hover:text-highlight hover:border-accent transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.slug)}
                  disabled={deleting === post.slug}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-red-400 hover:border-red-500 transition-colors disabled:opacity-50"
                >
                  {deleting === post.slug ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
