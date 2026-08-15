"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PostContent } from "@/components/PostContent";
import { RichTextEditor } from "@/components/RichTextEditor";
import { LoginCard } from "@/components/LoginCard";
import { AiAssistantPanel } from "@/components/AiAssistantPanel";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminStatus } from "@/components/AdminStatus";
import type { StoredPost } from "@/lib/posts-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  FileText,
  Sparkles,
  BarChart3,
  Activity,
} from "lucide-react";

interface PostForm {
  title: string;
  date: string;
  excerpt: string;
  tags: string;
  content: string;
}

type AdminTab = "posts" | "ai" | "dashboard" | "status";

const TABS: { id: AdminTab; label: string; icon: typeof FileText }[] = [
  { id: "posts", label: "Posts", icon: FileText },
  { id: "ai", label: "AI Assistant", icon: Sparkles },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "status", label: "Status", icon: Activity },
];

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

export function AdminApp({
  initiallyAuthenticated,
  initialPosts,
}: {
  initiallyAuthenticated: boolean;
  initialPosts: StoredPost[];
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);
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
  const [tab, setTab] = useState<AdminTab>("posts");
  const [deleteDialog, setDeleteDialog] = useState<StoredPost | null>(null);

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

  async function handleLogin(password: string) {
    setLoginLoading(true);
    setLoginError("");
    try {
      await fetchJson("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setAuthenticated(true);
      router.refresh();
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
    setTab("posts");
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

  function handleUseDraft(draft: { title: string; excerpt: string; content: string }) {
    setTab("posts");
    setIsNew(true);
    setEditing(null);
    setPreview(false);
    setForm({
      title: draft.title,
      date: new Date().toISOString().slice(0, 10),
      excerpt: draft.excerpt,
      tags: "",
      content: draft.content,
    });
  }

  async function handleDelete(slug: string) {
    setDeleteDialog(null);
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

  function closeEditor() {
    setEditing(null);
    setIsNew(false);
    setPreview(false);
  }

  if (!authenticated) {
    return (
      <LoginCard
        error={loginError}
        loading={loginLoading}
        onSubmit={handleLogin}
      />
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
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" />
              Tulis Artikel
            </Button>
          )}
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AdminTab)} className="mb-8">
        <TabsList className="h-auto w-full flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id}>
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="posts">
          {(isNew || editing) && (
            <form
              onSubmit={handleSave}
              className="mb-10 space-y-5"
            >
              <Card className="border-border bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle>
                    {isNew ? "Tulis Artikel Baru" : `Edit: ${editing?.title}`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => setPreview(!preview)}
                      variant="outline"
                      size="sm"
                    >
                      {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {preview ? "Tulis" : "Pratinjau"}
                    </Button>
                    <Button type="button" onClick={closeEditor} variant="outline" size="sm">
                      <ArrowLeft className="h-4 w-4" />
                      Batal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
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
                      <div className="space-y-1.5">
                        <Label htmlFor="title">Judul *</Label>
                        <Input
                          id="title"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="Judul artikel"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="date">Tanggal</Label>
                          <Input
                            id="date"
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tags">Tag (pisahkan dengan koma)</Label>
                          <Input
                            id="tags"
                            value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            placeholder="contoh: programming, tutorial"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="excerpt">Ringkasan</Label>
                        <Textarea
                          id="excerpt"
                          value={form.excerpt}
                          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                          rows={2}
                          placeholder="Ringkasan singkat artikel (opsional)"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="content">Isi Artikel *</Label>
                        <RichTextEditor
                          key={editing?.slug ?? (isNew ? "new" : "none")}
                          value={form.content}
                          onChange={(content) => setForm({ ...form, content })}
                          placeholder="Tulis isi artikel di sini..."
                        />
                      </div>
                    </>
                  )}

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="flex justify-end gap-2">
                    <Button type="button" onClick={closeEditor} variant="outline">
                      Batal
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isNew ? "Publish Artikel" : "Simpan Perubahan"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
              <Button onClick={startCreate} className="mt-4">
                <Plus className="h-4 w-4" />
                Tulis Artikel Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card
                  key={post.slug}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-border bg-card/50"
                >
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{post.title}</p>
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
                      <Button
                        onClick={() => startEdit(post)}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => setDeleteDialog(post)}
                        disabled={deleting === post.slug}
                        variant="outline"
                        size="sm"
                        className="text-red-400 hover:border-red-500"
                      >
                        {deleting === post.slug ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai">
          <AiAssistantPanel onUseDraft={handleUseDraft} />
        </TabsContent>
        <TabsContent value="dashboard">
          <AdminDashboard />
        </TabsContent>
        <TabsContent value="status">
          <AdminStatus />
        </TabsContent>
      </Tabs>

      <Dialog
        open={deleteDialog !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus artikel?</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus artikel &ldquo;{deleteDialog?.title}&rdquo;? Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={deleting !== null}
              onClick={() => deleteDialog && handleDelete(deleteDialog.slug)}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
