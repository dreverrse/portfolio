# Admin Power-Up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan 5 fitur terpusat di area admin: AI Content Assistant, Dashboard Statistik, Public API + dokumentasi `/api-docs`, Status Monitor integrasi, dan redesign halaman login admin.

**Architecture:** Semua fitur dibangun di atas pola yang sudah ada. AdminApp.tsx menjadi shell dengan tab (Posts | AI Assistant | Dashboard | Status). Logika AI di `src/lib/ai-assistant.ts` memakai `chatOpenRouter`/`translatePost` yang sudah ada. Statistik & status memakai Supabase (aktif) dengan fallback memory. Public API live di `/api/v1/*` read-only dengan rate limit dan response shape `{ ok, data }`/`{ ok:false, error }`. Login di-extract ke `LoginCard.tsx` dengan glassmorphism + animasi framer-motion.

**Tech Stack:** Next.js 16.3 (App Router, server + client components), TypeScript, Tailwind CSS v4, framer-motion (`FadeIn`/`motion`), lucide-react, Supabase, Upstash ratelimit (dengan fallback memory), OpenRouter.

## Global Constraints

- Repo root: `/public/portfolio` (branch `main`). Semua perintah jalan dari sini.
- **DILARANG menambah dependency baru** — `package.json` tidak boleh berubah.
- Imports: `@/lib/...`, `@/components/...`, lucide-react, framer-motion (pola yang sudah ada).
- Admin & api-docs memakai teks Bahasa Indonesia hardcoded (bukan `useI18n`) — konsisten dengan `AdminApp.tsx` saat ini.
- Hanya file yang tercantum di `**Files:**` tiap task yang boleh dibuat/diubah.
- Semua endpoint admin (bukan `/api/v1/*`) wajib cek `isAuthenticated()` dari `@/lib/admin-auth` di awal handler; kalau gagal return `NextResponse.json({ error: "Unauthorized" }, { status: 401 })`.
- Semua `fetch` eksternal wajib `signal: AbortSignal.timeout(8000)`.
- Verifikasi tiap task: `npx tsc --noEmit` DAN `npm run lint` harus exit 0. Tidak ada framework test — kedua command ini adalah verifikasinya.
- Commit Bahasa Indonesia imperatif, satu commit per task.
- `RouteContext<"/api/v1/posts/[slug]">` dipakai tanpa import (type global Next 16, sama seperti `src/app/api/admin/posts/[slug]/route.ts`).
- Deviasi tercatat: waifu API di `src/app/api/waifu/route.ts` memanggil `chatOpenRouter` — tidak ada endpoint waifu independen, sehingga status monitor memeriksa OpenRouter yang mencakup waifu.

---

### Task 1: Login Card Redesign

**Files:**
- Create: `src/components/LoginCard.tsx`
- Modify: `src/components/AdminApp.tsx` (blok `if (!authenticated)` + handler login)

**Interfaces:**
- Consumes: `@/lib/motion` (`DURATION`, `EASE`), lucide-react (`Lock`, `Loader2`), framer-motion.
- Produces: `LoginCard({ error, loading, onSubmit }: { error: string; loading: boolean; onSubmit: (password: string) => Promise<void> })` — komponen controlled penuh (tidak memegang state password sendiri). AdminApp mengubah `handleLogin` menjadi `(password: string) => Promise<void>`.

- [ ] **Step 1: Buat `src/components/LoginCard.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { DURATION, EASE } from "@/lib/motion";

export function LoginCard({
  error,
  loading,
  onSubmit,
}: {
  error: string;
  loading: boolean;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    await onSubmit(password);
    setPassword("");
  }

  return (
    <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 sm:px-6 py-24">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-highlight/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION, ease: EASE }}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md"
      >
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-accent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION, ease: EASE, delay: 0.1 }}
        >
          <div className="mb-1 flex items-center gap-2">
            <Lock className="h-5 w-5 text-highlight" />
            <h1 className="text-2xl font-bold">Login Admin</h1>
          </div>
          <p className="mb-6 text-sm text-muted">
            Masukkan password untuk mengelola artikel blog.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION, ease: EASE, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Masuk
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Refactor `handleLogin` di `AdminApp.tsx`**

Ganti handler login (saat ini `async function handleLogin(e: FormEvent)`) menjadi:

```tsx
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
```

Hapus state `const [password, setPassword] = useState("");` (baris 64-65) — tidak dipakai lagi. Imports `type FormEvent` tetap dipakai `handleSave`/`handleDelete` lain? `handleLogin` tidak memakai `FormEvent` lagi; pastikan `FormEvent` masih dipakai oleh handler lain sebelum menghapus import — jika tidak, jangan hapus import.

- [ ] **Step 3: Ganti blok `if (!authenticated)` di `AdminApp.tsx`**

Blok saat ini (baris 185-222, kartu login polos) diganti menjadi:

```tsx
  if (!authenticated) {
    return (
      <LoginCard
        error={loginError}
        loading={loginLoading}
        onSubmit={handleLogin}
      />
    );
  }
```

Tambahkan import di atas: `import { LoginCard } from "@/components/LoginCard";`

- [ ] **Step 4: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/LoginCard.tsx src/components/AdminApp.tsx
git commit -m "Redesign halaman login admin"
```

---

### Task 2: Admin Shell dengan Tab Navigation

**Files:**
- Modify: `src/components/AdminApp.tsx`

**Interfaces:**
- Produces: state `tab: AdminTab` dengan `type AdminTab = "posts" | "ai" | "dashboard" | "status"` di `AdminApp.tsx`. Tab bar dirender setelah header (baris ~245), hanya saat `authenticated`. Konten posts (form + daftar) dibungkus `{tab === "posts" && (...)}`. Tab `ai`/`dashboard`/`status` menampilkan placeholder sementara sampai task terkait.

- [ ] **Step 1: Tambah state tab + konstanta**

Tambahkan `type AdminTab = "posts" | "ai" | "dashboard" | "status";` di luar komponen (sebelum `export function AdminApp`). Tambahkan konstanta TABS di luar komponen:

```tsx
const TABS: { id: AdminTab; label: string; icon: typeof FileText }[] = [
  { id: "posts", label: "Posts", icon: FileText },
  { id: "ai", label: "AI Assistant", icon: Sparkles },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "status", label: "Status", icon: Activity },
];
```

Import ikon dari lucide-react (tambahkan ke import yang sudah ada): `Sparkles`, `BarChart3`, `Activity` (pastikan `FileText` sudah di-import; jika belum, tambahkan).

Tambahkan state di dalam komponen (dekat state lain):

```tsx
  const [tab, setTab] = useState<AdminTab>("posts");
```

- [ ] **Step 2: Render tab bar setelah header**

Di dalam `return (...)` utama, tepat setelah `</div>` penutup header (yang berisi tombol "Tulis Artikel"/"Logout", sekitar baris 245), sisipkan:

```tsx
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "border-accent bg-accent/10 text-highlight"
                : "border-border text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
```

- [ ] **Step 3: Bungkus konten posts dengan `{tab === "posts" && (...)}`**

Ambil seluruh konten posts: blok `{(isNew || editing) && (<form ...>)}` (baris ~247-378), blok `{error && !isNew && !editing && (...)}` (baris ~380-382), dan blok daftar posts (`{loadingPosts ? ... : posts.length === 0 ... : <div className="space-y-3">...}`) (baris ~384-438). Bungkus ketiganya menjadi:

```tsx
      {tab === "posts" && (
        <>
          {(isNew || editing) && (
            <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card/50 p-6 space-y-5 mb-10">
              {/* isi form yang sudah ada — jangan diubah */}
            </form>
          )}

          {error && !isNew && !editing && (
            <p className="text-sm text-red-500 mb-4">{error}</p>
          )}

          {loadingPosts ? (
            /* spinner yang sudah ada */
          ) : posts.length === 0 && !isNew && !editing ? (
            /* empty state yang sudah ada */
          ) : (
            /* daftar posts yang sudah ada */
          )}
        </>
      )}

      {tab === "ai" && (
        <div className="rounded-2xl border border-border bg-card/30 p-10 text-center text-muted">
          AI Assistant segera hadir.
        </div>
      )}
      {tab === "dashboard" && (
        <div className="rounded-2xl border border-border bg-card/30 p-10 text-center text-muted">
          Dashboard segera hadir.
        </div>
      )}
      {tab === "status" && (
        <div className="rounded-2xl border border-border bg-card/30 p-10 text-center text-muted">
          Status segera hadir.
        </div>
      )}
```

Jangan mengubah isi form/spinner/daftar — hanya menambah pembungkus. Perhatikan indentasi agar konsisten.

- [ ] **Step 4: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0. (Perhatian: `FormEvent` masih dipakai `handleSave` — jika lint melaporkan unused, cek pemakaian; jangan hapus tanpa yakin.)

- [ ] **Step 5: Commit**

```bash
git add src/components/AdminApp.tsx
git commit -m "Tambahkan navigasi tab di panel admin"
```

---

### Task 3: AI Assistant — Library + API Route

**Files:**
- Create: `src/lib/ai-assistant.ts`
- Create: `src/app/api/admin/ai/route.ts`

**Interfaces:**
- Consumes: `chatOpenRouter` dari `@/lib/openrouter` (signature: `chatOpenRouter(systemPrompt: string, messages: OpenRouterMessage[], options?: { temperature?: number; maxTokens?: number; validate?: (reply: string) => boolean }): Promise<string>`), `translatePost(post: Post, mode: "list" | "full")` dari `@/lib/translate`, `getPostBySlug(slug)` dari `@/lib/blog`.
- Produces:
  - `generateDraft(topic: string): Promise<{ title: string; excerpt: string; content: string }>`
  - `generateExcerptTags(content: string): Promise<{ excerpt: string; tags: string[] }>`
  - `rewriteContent(content: string, instruction: string): Promise<{ content: string }>`
  - `translateStoredPost(slug: string): Promise<{ title: string; excerpt: string; content: string } | null>` (wrapper `translatePost` dengan mode `"full"`)
- Route `POST /api/admin/ai` menerima body `{ action, topic?, content?, instruction?, slug? }` dan merespons `{ result: ... }`; validasi per action dengan pesan error Bahasa Indonesia.

- [ ] **Step 1: Buat `src/lib/ai-assistant.ts`**

```ts
import { chatOpenRouter } from "@/lib/openrouter";
import { translatePost } from "@/lib/translate";
import { getPostBySlug } from "@/lib/blog";

export interface AiDraftResult {
  title: string;
  excerpt: string;
  content: string;
}

export interface AiExcerptTagsResult {
  excerpt: string;
  tags: string[];
}

function extractJson(raw: string): Record<string, unknown> | null {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function requireKeys(
  reply: string,
  keys: string[]
): Record<string, unknown> | null {
  const parsed = extractJson(reply);
  if (!parsed) return null;
  for (const key of keys) {
    const value = parsed[key];
    if (typeof value !== "string" || !(value as string).trim()) return null;
  }
  return parsed;
}

const DRAFT_SYSTEM = `Kamu adalah penulis artikel blog teknis berbahasa Indonesia. Buat draft artikel dari topik yang diberikan.
Balas HANYA dengan JSON valid, tanpa teks lain, dengan kunci:
- "title": judul yang menarik dan jelas (maks 100 karakter)
- "excerpt": ringkasan 1-2 kalimat
- "content": isi artikel lengkap dalam Markdown (minimal 3 heading, paragraf padat dan informatif)`;

export async function generateDraft(topic: string): Promise<AiDraftResult> {
  const reply = await chatOpenRouter(DRAFT_SYSTEM, [
    { role: "user", content: topic },
  ], {
    temperature: 0.8,
    maxTokens: 2500,
    validate: (raw) => requireKeys(raw, ["title", "excerpt", "content"]) !== null,
  });
  const parsed = requireKeys(reply, ["title", "excerpt", "content"])!;
  return {
    title: parsed.title as string,
    excerpt: parsed.excerpt as string,
    content: parsed.content as string,
  };
}

const EXCERPT_TAGS_SYSTEM = `Kamu adalah editor blog. Dari isi artikel yang diberikan, buat ringkasan dan tag.
Balas HANYA dengan JSON valid, tanpa teks lain, dengan kunci:
- "excerpt": ringkasan 1-2 kalimat dalam bahasa yang sama dengan artikel
- "tags": array string, maksimal 10 tag, tanpa spasi (boleh tanda # di awal)`;

export async function generateExcerptTags(
  content: string
): Promise<AiExcerptTagsResult> {
  const reply = await chatOpenRouter(EXCERPT_TAGS_SYSTEM, [
    { role: "user", content: content.slice(0, 12000) },
  ], {
    temperature: 0.3,
    maxTokens: 600,
    validate: (raw) => {
      const parsed = extractJson(raw);
      if (!parsed) return false;
      if (typeof parsed.excerpt !== "string" || !(parsed.excerpt as string).trim()) return false;
      return Array.isArray(parsed.tags);
    },
  });
  const parsed = extractJson(reply)!;
  return {
    excerpt: parsed.excerpt as string,
    tags: (parsed.tags as unknown[]).slice(0, 10).map((t) => String(t).trim()).filter(Boolean),
  };
}

const REWRITE_SYSTEM = `Kamu adalah editor blog berpengalaman. Perbaiki konten artikel sesuai instruksi pengguna: rapikan struktur, perbaiki tata bahasa, pertahankan makna dan gaya penulisan.
Balas HANYA dengan konten Markdown yang sudah diperbaiki, tanpa teks lain dan tanpa pembungkus kode.`;

export async function rewriteContent(
  content: string,
  instruction: string
): Promise<{ content: string }> {
  const prompt = `Instruksi perbaikan: ${instruction || "Perbaiki struktur, tata bahasa, dan kerapian konten."}

Konten:
${content.slice(0, 12000)}`;
  const reply = await chatOpenRouter(REWRITE_SYSTEM, [
    { role: "user", content: prompt },
  ], {
    temperature: 0.4,
    maxTokens: 4000,
  });
  return { content: reply };
}

export async function translateStoredPost(
  slug: string
): Promise<{ title: string; excerpt: string; content: string } | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;
  const result = await translatePost(post, "full");
  return {
    title: result.title,
    excerpt: result.excerpt,
    content: result.content || post.content,
  };
}
```

- [ ] **Step 2: Buat `src/app/api/admin/ai/route.ts`**

```ts
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/ratelimit";
import {
  generateDraft,
  generateExcerptTags,
  rewriteContent,
  translateStoredPost,
} from "@/lib/ai-assistant";

const AI_WINDOW_MS = 5 * 60 * 1000;
const AI_MAX = 20;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = await rateLimit(getClientIp(request), {
    limit: AI_MAX,
    windowMs: AI_WINDOW_MS,
    prefix: "rl:admin-ai",
  });
  if (!blocked.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan AI. Coba lagi nanti." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const instruction =
    typeof body.instruction === "string" ? body.instruction.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";

  try {
    if (action === "draft") {
      if (!topic) {
        return NextResponse.json({ error: "Topik tidak boleh kosong" }, { status: 400 });
      }
      return NextResponse.json({ result: await generateDraft(topic) });
    }

    if (action === "excerptTags") {
      if (!content.trim()) {
        return NextResponse.json({ error: "Konten tidak boleh kosong" }, { status: 400 });
      }
      return NextResponse.json({ result: await generateExcerptTags(content) });
    }

    if (action === "rewrite") {
      if (!content.trim()) {
        return NextResponse.json({ error: "Konten tidak boleh kosong" }, { status: 400 });
      }
      return NextResponse.json({ result: await rewriteContent(content, instruction) });
    }

    if (action === "translate") {
      if (!slug) {
        return NextResponse.json({ error: "Slug tidak boleh kosong" }, { status: 400 });
      }
      const result = await translateStoredPost(slug);
      if (!result) {
        return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses permintaan" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai-assistant.ts src/app/api/admin/ai/route.ts
git commit -m "Tambah endpoint AI assistant untuk admin"
```

---

### Task 4: Panel AI Assistant (UI)

**Files:**
- Create: `src/components/AiAssistantPanel.tsx`
- Modify: `src/components/AdminApp.tsx`

**Interfaces:**
- Consumes: `POST /api/admin/ai` (Task 3), `PostContent` dari `@/components/PostContent`.
- Produces: `AiAssistantPanel({ onUseDraft }: { onUseDraft: (draft: { title: string; excerpt: string; content: string }) => void })`. AdminApp menyediakan `handleUseDraft` yang mengisi form Posts dan pindah ke tab `posts`.
- Memakai ikon lucide-react: `Sparkles`, `Loader2`, `Check`, `FileText`.

- [ ] **Step 1: Buat `src/components/AiAssistantPanel.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, Loader2, Check, FileText } from "lucide-react";
import { PostContent } from "@/components/PostContent";

type AiAction = "draft" | "excerptTags" | "rewrite" | "translate";

const ACTIONS: { id: AiAction; label: string; hint: string }[] = [
  { id: "draft", label: "Generate Draft", hint: "Topik → draft artikel lengkap" },
  { id: "excerptTags", label: "Excerpt + Tags", hint: "Konten → ringkasan + tag" },
  { id: "rewrite", label: "Rewrite", hint: "Konten → perbaikan sesuai instruksi" },
  { id: "translate", label: "Translate", hint: "Slug → terjemahan Inggris penuh" },
];

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-foreground";

interface DraftShape {
  title?: string;
  excerpt?: string;
  content?: string;
}

export function AiAssistantPanel({
  onUseDraft,
}: {
  onUseDraft: (draft: { title: string; excerpt: string; content: string }) => void;
}) {
  const [action, setAction] = useState<AiAction>("draft");
  const [input, setInput] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<unknown>(null);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body: Record<string, unknown> = { action };
      if (action === "draft") body.topic = input;
      if (action === "excerptTags" || action === "rewrite") body.content = input;
      if (action === "rewrite") body.instruction = instructionRef;
      if (action === "translate") body.slug = slug;

      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Gagal memproses");
      }
      setResult((data as { result: unknown }).result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const draft = (result ?? null) as DraftShape | null;
  const isDraft =
    action === "draft" &&
    draft !== null &&
    typeof draft.title === "string" &&
    typeof draft.content === "string";

  const instructionRef = "";

  function applyDraft() {
    if (!isDraft || !draft || !draft.title || !draft.content) return;
    onUseDraft({
      title: draft.title,
      excerpt: draft.excerpt || "",
      content: draft.content,
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-highlight" />
          <h2 className="text-lg font-semibold">AI Content Assistant</h2>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Action</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAction(a.id)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  action === a.id
                    ? "border-accent bg-accent/10"
                    : "border-border text-muted hover:border-accent"
                }`}
              >
                <span className="font-medium text-foreground block">{a.label}</span>
                <span className="text-xs">{a.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {action === "draft" && (
          <div>
            <label htmlFor="ai-topic" className="mb-1.5 block text-sm font-medium text-muted">Topik</label>
            <textarea
              id="ai-topic"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`${inputClass} resize-y`}
              rows={3}
              placeholder="Contoh: Cara deploy aplikasi Next.js ke Vercel"
              required
            />
          </div>
        )}

        {action === "excerptTags" && (
          <div>
            <label htmlFor="ai-content" className="mb-1.5 block text-sm font-medium text-muted">Konten artikel</label>
            <textarea
              id="ai-content"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`${inputClass} resize-y`}
              rows={8}
              placeholder="Tempel isi artikel di sini..."
              required
            />
          </div>
        )}

        {action === "rewrite" && (
          <>
            <div>
              <label htmlFor="ai-content" className="mb-1.5 block text-sm font-medium text-muted">Konten artikel</label>
              <textarea
                id="ai-content"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`${inputClass} resize-y`}
                rows={8}
                required
              />
            </div>
            <div>
              <label htmlFor="ai-instruction" className="mb-1.5 block text-sm font-medium text-muted">Instruksi (opsional)</label>
              <input
                id="ai-instruction"
                value={instructionRef}
                onChange={() => {}}
                className={inputClass}
                placeholder="Contoh: jadikan lebih ringkas dan mudah dipahami"
              />
            </div>
          </>
        )}

        {action === "translate" && (
          <div>
            <label htmlFor="ai-slug" className="mb-1.5 block text-sm font-medium text-muted">Slug artikel</label>
            <input
              id="ai-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
              placeholder="contoh: deploy-vercel"
              required
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Memproses..." : "Generate"}
        </button>
      </form>

      {result && (
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          {isDraft ? (
            <>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{draft.title}</h3>
                  <p className="mt-1 text-sm text-muted">{draft.excerpt}</p>
                </div>
                <button onClick={applyDraft} className={btnGhost}>
                  <Check className="h-4 w-4" />
                  Pakai di Editor
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-border bg-background p-6">
                <PostContent content={draft.content || ""} />
              </div>
            </>
          ) : (
            <pre className="whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}

      {action === "translate" && (
        <p className="text-xs text-muted flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          Hasil terjemahan disimpan di cache translate dan dipakai halaman blog berbahasa Inggris.
        </p>
      )}
    </div>
  );
}
```

**Catatan penting implementer:** variable `instructionRef` di atas adalah konstanta `""` — itu BUG yang sengaja dipertahankan agar file langsung lolos tsc/lint, tapi WAJIB diganti menjadi state nyata. Ganti deklarasi `const instructionRef = "";` dengan `const [instruction, setInstruction] = useState("");`, pindahkan pemakaian `instructionRef` di body ke `body.instruction = instruction;`, dan di input rewrite `value={instruction} onChange={(e) => setInstruction(e.target.value)}`. Jangan ada `instructionRef` tersisa.

- [ ] **Step 2: Wire ke AdminApp**

Di `AdminApp.tsx`:
1. Import `AiAssistantPanel`.
2. Tambahkan handler (di dalam komponen, dekat handler lain):

```tsx
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
```

3. Ganti placeholder tab `ai` (dari Task 2) menjadi:

```tsx
      {tab === "ai" && <AiAssistantPanel onUseDraft={handleUseDraft} />}
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/AiAssistantPanel.tsx src/components/AdminApp.tsx
git commit -m "Tambah panel AI content assistant di admin"
```

---

### Task 5: Dashboard Statistik — Shared GitHub Lib + Admin Stats + Route

**Files:**
- Create: `src/lib/github-stats.ts`
- Modify: `src/app/api/github/route.ts` (gunakan lib bersama)
- Create: `src/lib/admin-stats.ts`
- Create: `src/app/api/admin/stats/route.ts`

**Interfaces:**
- Consumes: `getSupabase`/`SUPABASE_ENABLED` dari `@/lib/supabase`, `getLastTrack` dari `@/lib/lastfm`.
- Produces:
  - `getCachedGitHubStats(): Promise<GitHubStats | null>` dengan `GitHubStats = { followers: number; publicRepos: number; totalStars: number; topLanguages: string[] }` — cache module-level 10 menit (sama dengan route lama).
  - `getAdminStats(): Promise<AdminStats>` dengan `AdminStats = { totals: { posts: number; reactions: number; comments: number; translations: number }; topPosts: TopPost[]; github: GitHubStats | null; lastfm: { name: string; artist: string; isPlaying: boolean } | null }` dan `TopPost = { slug: string; title: string; date: string; comments: number; reactions: number }`.
- Route `GET /api/admin/stats` → `{ stats: AdminStats }`, wajib auth admin.

- [ ] **Step 1: Buat `src/lib/github-stats.ts`** (pindahkan logika dari route)

```ts
const USERNAME = "dreverrse";
const CACHE_TTL_MS = 10 * 60 * 1000;

export interface GitHubStats {
  followers: number;
  publicRepos: number;
  totalStars: number;
  topLanguages: string[];
}

let cache: { stats: GitHubStats; fetchedAt: number } | null = null;

async function fetchGitHubStats(): Promise<GitHubStats | null> {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
    ]);
    if (!userRes.ok || !reposRes.ok) return null;

    const user = await userRes.json();
    const repos = await reposRes.json();
    if (!Array.isArray(repos)) return null;

    const langCount: Record<string, number> = {};
    let totalStars = 0;
    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      if (typeof repo.language === "string" && repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    }

    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    return {
      followers: user.followers || 0,
      publicRepos: user.public_repos || 0,
      totalStars,
      topLanguages,
    };
  } catch {
    return null;
  }
}

export async function getCachedGitHubStats(): Promise<GitHubStats | null> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt <= CACHE_TTL_MS) return cache.stats;
  const stats = await fetchGitHubStats();
  if (!stats) return null;
  cache = { stats, fetchedAt: now };
  return stats;
}
```

- [ ] **Step 2: Sederhanakan `src/app/api/github/route.ts`**

Ganti seluruh isi file dengan:

```ts
import { NextResponse } from "next/server";
import { getCachedGitHubStats } from "@/lib/github-stats";

export async function GET() {
  return NextResponse.json({ stats: await getCachedGitHubStats() });
}
```

Hapus `USERNAME`, `CACHE_TTL_MS`, `GitHubStats`, `cache`, `fetchStats` lama — semuanya sudah pindah ke lib.

- [ ] **Step 3: Buat `src/lib/admin-stats.ts`**

```ts
import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase";
import { getCachedGitHubStats, type GitHubStats } from "@/lib/github-stats";
import { getLastTrack } from "@/lib/lastfm";

export interface TopPost {
  slug: string;
  title: string;
  date: string;
  comments: number;
  reactions: number;
}

export interface AdminStats {
  totals: {
    posts: number;
    reactions: number;
    comments: number;
    translations: number;
  };
  topPosts: TopPost[];
  github: GitHubStats | null;
  lastfm: { name: string; artist: string; isPlaying: boolean } | null;
}

async function countFrom(table: string): Promise<number> {
  if (!SUPABASE_ENABLED) return 0;
  try {
    const { count, error } = await getSupabase()
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function topPosts(): Promise<TopPost[]> {
  if (!SUPABASE_ENABLED) return [];
  try {
    const db = getSupabase();
    const [comments, reactions, posts] = await Promise.all([
      db.from("post_comments").select("post_slug"),
      db.from("post_reactions").select("post_slug"),
      db.from("admin_posts").select("slug, title, date"),
    ]);
    if (comments.error || reactions.error || posts.error) return [];

    const commentCount: Record<string, number> = {};
    for (const row of comments.data || []) {
      commentCount[row.post_slug] = (commentCount[row.post_slug] || 0) + 1;
    }
    const reactionCount: Record<string, number> = {};
    for (const row of reactions.data || []) {
      reactionCount[row.post_slug] = (reactionCount[row.post_slug] || 0) + 1;
    }

    return (posts.data || [])
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        comments: commentCount[p.slug] || 0,
        reactions: reactionCount[p.slug] || 0,
      }))
      .sort((a, b) => b.comments + b.reactions - (a.comments + a.reactions))
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  const [posts, reactions, comments, translations, top, github, lastfm] =
    await Promise.all([
      countFrom("admin_posts"),
      countFrom("post_reactions"),
      countFrom("post_comments"),
      countFrom("translation_cache"),
      topPosts(),
      getCachedGitHubStats(),
      getLastTrack().then((track) =>
        track
          ? { name: track.name, artist: track.artist, isPlaying: track.is_playing }
          : null
      ),
    ]);

  return {
    totals: { posts, reactions, comments, translations },
    topPosts: top,
    github,
    lastfm,
  };
}
```

**Catatan:** tipe row hasil query Supabase akan di-infer; karena struktur table sudah dikenal, `row.post_slug` dan `p.slug` dll. harusnya aman untuk `tsc`. Jika tsc mengeluh tentang `row` implicit any, tambahkan anotasi minimal: `const commentCount: Record<string, number> = {};` sudah ada — cek bahwa `comments.data` bertipe row dengan `post_slug`; jika tidak, cast `(comments.data || []) as Array<{ post_slug: string }>` pada loop.

- [ ] **Step 4: Buat `src/app/api/admin/stats/route.ts`**

```ts
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/admin-stats";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ stats: await getAdminStats() });
}
```

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/github-stats.ts src/app/api/github/route.ts src/lib/admin-stats.ts src/app/api/admin/stats/route.ts
git commit -m "Tambah endpoint statistik dashboard admin"
```

---

### Task 6: Dashboard Statistik — UI Panel

**Files:**
- Create: `src/components/AdminDashboard.tsx`
- Modify: `src/components/AdminApp.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/stats` (Task 5), ikon lucide-react (`BarChart3`, `FolderOpen`, `Heart`, `MessageSquare`, `Languages`, `Users`, `Star`, `Music`, `Loader2`, `RefreshCw`).
- Produces: `AdminDashboard()` — client component tanpa props, fetch sendiri di `useEffect`.

- [ ] **Step 1: Buat `src/components/AdminDashboard.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  FolderOpen,
  Heart,
  MessageSquare,
  Languages,
  Users,
  Star,
  Music,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface TopPost {
  slug: string;
  title: string;
  date: string;
  comments: number;
  reactions: number;
}

interface AdminStats {
  totals: {
    posts: number;
    reactions: number;
    comments: number;
    translations: number;
  };
  topPosts: TopPost[];
  github: { followers: number; publicRepos: number; totalStars: number; topLanguages: string[] } | null;
  lastfm: { name: string; artist: string; isPlaying: boolean } | null;
}

const kpiClass =
  "flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Gagal memuat statistik");
      }
      setStats((data as { stats: AdminStats }).stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-red-500">{error || "Tidak ada data."}</p>;
  }

  const maxScore = Math.max(
    1,
    ...stats.topPosts.map((p) => p.comments + p.reactions)
  );

  const kpis = [
    { icon: FolderOpen, label: "Artikel", value: stats.totals.posts },
    { icon: Heart, label: "Reaksi", value: stats.totals.reactions },
    { icon: MessageSquare, label: "Komentar", value: stats.totals.comments },
    { icon: Languages, label: "Terjemahan", value: stats.totals.translations },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-highlight" />
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ icon: Icon, label, value }) => (
          <div key={label} className={kpiClass}>
            <Icon className="h-5 w-5 text-highlight shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-6">
        <h3 className="mb-4 font-semibold">Artikel Teratas</h3>
        {stats.topPosts.length === 0 ? (
          <p className="text-sm text-muted">Belum ada data komentar/reaksi.</p>
        ) : (
          <div className="space-y-3">
            {stats.topPosts.map((post) => {
              const score = post.comments + post.reactions;
              return (
                <div key={post.slug}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{post.title}</span>
                    <span className="shrink-0 text-xs text-muted">
                      💬 {post.comments} · ❤️ {post.reactions}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round((score / maxScore) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.github && (
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4 text-highlight" />
              GitHub
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{stats.github.followers}</p>
                <p className="text-xs text-muted">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.github.publicRepos}</p>
                <p className="text-xs text-muted">Repos</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.github.totalStars}</p>
                <p className="text-xs text-muted">Stars</p>
              </div>
            </div>
            {stats.github.topLanguages.length > 0 && (
              <p className="mt-3 text-xs text-muted">
                Bahasa: {stats.github.topLanguages.join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Music className="h-4 w-4 text-highlight" />
            Last.fm
          </h3>
          {stats.lastfm ? (
            <p className="text-sm">
              {stats.lastfm.name} — {stats.lastfm.artist}
              {stats.lastfm.isPlaying && <span className="ml-2 text-xs text-highlight">▶ Sedang diputar</span>}
            </p>
          ) : (
            <p className="text-sm text-muted">Tidak ada data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire ke AdminApp**

Di `AdminApp.tsx`:
1. Import `AdminDashboard`.
2. Ganti placeholder tab `dashboard` menjadi:

```tsx
      {tab === "dashboard" && <AdminDashboard />}
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/AdminDashboard.tsx src/components/AdminApp.tsx
git commit -m "Tambah panel dashboard statistik admin"
```

---

### Task 7: Status Monitor — Library + Route

**Files:**
- Create: `src/lib/site-status.ts`
- Create: `src/app/api/admin/status/route.ts`

**Interfaces:**
- Consumes: env vars `OPENROUTER_API_KEY`, `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, `LASTFM_API_KEY`/`LASTFM_USERNAME` (via `SUPABASE_ENABLED`), `getSupabase` dari `@/lib/supabase`.
- Produces:
  - `checkSiteStatus(): Promise<IntegrationStatus[]>` dengan `IntegrationStatus = { name: string; status: "up" | "down" | "disabled"; latencyMs: number; error?: string }`.
  - Integrasi: `GitHub`, `Last.fm`, `OpenRouter`, `Supabase`. (Waifu dicakup oleh OpenRouter — waifu memakai `chatOpenRouter`.)
- Route `GET /api/admin/status` → `{ integrations: IntegrationStatus[] }`, wajib auth admin.

- [ ] **Step 1: Buat `src/lib/site-status.ts`**

```ts
import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase";

const TIMEOUT_MS = 8000;

export interface IntegrationStatus {
  name: string;
  status: "up" | "down" | "disabled";
  latencyMs: number;
  error?: string;
}

async function ping(
  url: string,
  headers?: Record<string, string>
): Promise<number> {
  const start = Date.now();
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Date.now() - start;
}

async function githubCheck(): Promise<IntegrationStatus> {
  try {
    const latency = await ping("https://api.github.com/rate_limit");
    return { name: "GitHub", status: "up", latencyMs: latency };
  } catch (err) {
    return {
      name: "GitHub",
      status: "down",
      latencyMs: 0,
      error: err instanceof Error ? err.message : "Gagal",
    };
  }
}

async function lastfmCheck(): Promise<IntegrationStatus> {
  if (!process.env.LASTFM_API_KEY || !process.env.LASTFM_USERNAME) {
    return { name: "Last.fm", status: "disabled", latencyMs: 0 };
  }
  try {
    const params = new URLSearchParams({
      method: "user.getinfo",
      user: process.env.LASTFM_USERNAME,
      api_key: process.env.LASTFM_API_KEY,
      format: "json",
    });
    const latency = await ping(`https://ws.audioscrobbler.com/2.0/?${params}`);
    return { name: "Last.fm", status: "up", latencyMs: latency };
  } catch (err) {
    return {
      name: "Last.fm",
      status: "down",
      latencyMs: 0,
      error: err instanceof Error ? err.message : "Gagal",
    };
  }
}

async function openRouterCheck(): Promise<IntegrationStatus> {
  if (!process.env.OPENROUTER_API_KEY) {
    return { name: "OpenRouter", status: "disabled", latencyMs: 0 };
  }
  try {
    const latency = await ping("https://openrouter.ai/api/v1/models", {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    });
    return { name: "OpenRouter", status: "up", latencyMs: latency };
  } catch (err) {
    return {
      name: "OpenRouter",
      status: "down",
      latencyMs: 0,
      error: err instanceof Error ? err.message : "Gagal",
    };
  }
}

async function supabaseCheck(): Promise<IntegrationStatus> {
  if (!SUPABASE_ENABLED) {
    return { name: "Supabase", status: "disabled", latencyMs: 0 };
  }
  const start = Date.now();
  try {
    const { error } = await getSupabase()
      .from("admin_posts")
      .select("slug", { count: "exact", head: true });
    if (error) throw error;
    return { name: "Supabase", status: "up", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name: "Supabase",
      status: "down",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Gagal",
    };
  }
}

export async function checkSiteStatus(): Promise<IntegrationStatus[]> {
  const results = await Promise.allSettled([
    githubCheck(),
    lastfmCheck(),
    openRouterCheck(),
    supabaseCheck(),
  ]);
  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          name: "Unknown",
          status: "down" as const,
          latencyMs: 0,
          error: r.reason instanceof Error ? r.reason.message : "Gagal",
        }
  );
}
```

- [ ] **Step 2: Buat `src/app/api/admin/status/route.ts`**

```ts
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { checkSiteStatus } from "@/lib/site-status";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ integrations: await checkSiteStatus() });
}
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/site-status.ts src/app/api/admin/status/route.ts
git commit -m "Tambah status monitor integrasi untuk admin"
```

---

### Task 8: Status Monitor — UI Panel

**Files:**
- Create: `src/components/AdminStatus.tsx`
- Modify: `src/components/AdminApp.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/status` (Task 7), ikon lucide-react (`Activity`, `Loader2`, `RefreshCw`, `CheckCircle2`, `XCircle`, `MinusCircle`).
- Produces: `AdminStatus()` — client component tanpa props.

- [ ] **Step 1: Buat `src/components/AdminStatus.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";

interface IntegrationStatus {
  name: string;
  status: "up" | "down" | "disabled";
  latencyMs: number;
  error?: string;
}

const statusStyles: Record<
  IntegrationStatus["status"],
  { icon: typeof CheckCircle2; ring: string; label: string }
> = {
  up: { icon: CheckCircle2, ring: "border-emerald-500/40 text-emerald-500", label: "Up" },
  down: { icon: XCircle, ring: "border-red-500/40 text-red-500", label: "Down" },
  disabled: { icon: MinusCircle, ring: "border-border text-muted", label: "Disabled" },
};

export function AdminStatus() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/status");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Gagal memuat status");
      }
      setIntegrations((data as { integrations: IntegrationStatus[] }).integrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-highlight" />
          <h2 className="text-lg font-semibold">Status Integrasi</h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(integrations || []).map((item) => {
            const style = statusStyles[item.status];
            const Icon = style.icon;
            return (
              <div
                key={item.name}
                className={`flex items-center justify-between gap-3 rounded-xl border bg-card/50 p-4 ${style.ring}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.error && (
                      <p className="text-xs text-muted">{item.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{style.label}</p>
                  <p className="text-xs text-muted">
                    {item.status === "up" ? `${item.latencyMs} ms` : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire ke AdminApp**

Di `AdminApp.tsx`:
1. Import `AdminStatus`.
2. Ganti placeholder tab `status` menjadi:

```tsx
      {tab === "status" && <AdminStatus />}
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/AdminStatus.tsx src/components/AdminApp.tsx
git commit -m "Tambah panel status monitor di admin"
```

---

### Task 9: Public API Routes

**Files:**
- Create: `src/lib/public-api.ts`
- Create: `src/app/api/v1/posts/route.ts`
- Create: `src/app/api/v1/posts/[slug]/route.ts`
- Create: `src/app/api/v1/stats/route.ts`
- Create: `src/app/api/v1/site/status/route.ts`

**Interfaces:**
- Consumes: `getAllPosts`/`getPostBySlug` dari `@/lib/blog`, `getAdminStats` dari `@/lib/admin-stats`, `checkSiteStatus` dari `@/lib/site-status`, `getClientIp`/`rateLimit` dari `@/lib/ratelimit`.
- Produces:
  - `publicRateLimit(request: Request): Promise<NextResponse | null>` — helper shared, rate limit 60/menit per IP, prefix `rl:public-api`. Return `NextResponse` 429 saat limit tercapai, `null` jika boleh lanjut.
  - Response shape: `{ ok: true, data: ... }` atau `{ ok: false, error: string, status: number }`.

- [ ] **Step 1: Buat `src/lib/public-api.ts`**

```ts
import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/ratelimit";

const WINDOW_MS = 60 * 1000;
const MAX = 60;

export async function publicRateLimit(
  request: Request
): Promise<NextResponse | null> {
  const result = await rateLimit(getClientIp(request), {
    limit: MAX,
    windowMs: WINDOW_MS,
    prefix: "rl:public-api",
  });
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Terlalu banyak permintaan. Coba lagi nanti.",
        status: 429,
      },
      {
        status: 429,
        headers: {
          "Retry-After": `${Math.ceil((result.reset - Date.now()) / 1000)}`,
        },
      }
    );
  }
  return null;
}
```

- [ ] **Step 2: Buat `src/app/api/v1/posts/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { publicRateLimit } from "@/lib/public-api";

export async function GET(request: Request) {
  const limited = await publicRateLimit(request);
  if (limited) return limited;

  const posts = await getAllPosts();
  const data = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    tags: p.tags,
    date: p.date,
    readingTime: p.readingTime,
  }));

  return NextResponse.json({ ok: true, data }, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
```

- [ ] **Step 3: Buat `src/app/api/v1/posts/[slug]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/blog";
import { publicRateLimit } from "@/lib/public-api";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/v1/posts/[slug]">
) {
  const limited = await publicRateLimit(request);
  if (limited) return limited;

  const { slug } = await ctx.params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return NextResponse.json(
      { ok: false, error: "Artikel tidak ditemukan", status: 404 },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data: post }, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
```

- [ ] **Step 4: Buat `src/app/api/v1/stats/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin-stats";
import { publicRateLimit } from "@/lib/public-api";

export async function GET(request: Request) {
  const limited = await publicRateLimit(request);
  if (limited) return limited;

  const stats = await getAdminStats();
  const data = {
    posts: stats.totals.posts,
    reactions: stats.totals.reactions,
    comments: stats.totals.comments,
    github: stats.github,
  };

  return NextResponse.json({ ok: true, data }, {
    headers: { "Cache-Control": "no-store" },
  });
}
```

- [ ] **Step 5: Buat `src/app/api/v1/site/status/route.ts`**

```ts
import { NextResponse } from "next/server";
import { checkSiteStatus } from "@/lib/site-status";
import { publicRateLimit } from "@/lib/public-api";

export async function GET(request: Request) {
  const limited = await publicRateLimit(request);
  if (limited) return limited;

  return NextResponse.json(
    { ok: true, data: { integrations: await checkSiteStatus() } },
    { headers: { "Cache-Control": "no-store" } }
  );
}
```

- [ ] **Step 6: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0. (Pastikan `RouteContext<"/api/v1/posts/[slug]">` valid — pola sama dengan `src/app/api/admin/posts/[slug]/route.ts`.)

- [ ] **Step 7: Commit**

```bash
git add src/lib/public-api.ts src/app/api/v1/
git commit -m "Tambah public API read-only di /api/v1"
```

---

### Task 10: Halaman Dokumentasi API (`/api-docs`)

**Files:**
- Create: `src/app/api-docs/page.tsx`
- Create: `src/components/ApiDocs.tsx`
- Modify: `src/components/Footer.tsx` (tambah link API docs)

**Interfaces:**
- Consumes: `useI18n` (untuk key footer baru), lucide-react (`Code2`, `Play`, `Loader2`, `Check`, `Copy`).
- Produces: halaman publik `GET /api-docs` (server component wrapper + client `ApiDocs`).

- [ ] **Step 1: Tambah kunci i18n di `src/lib/i18n.tsx`**

Tambahkan `"footer.apiDocs": "API"` di blok `id` (setelah key `footer.admin`) dan `"footer.apiDocs": "API"` di blok `en` (setelah key `footer.admin`). Sama persis kedua blok.

- [ ] **Step 2: Buat `src/app/api-docs/page.tsx`**

```tsx
import type { Metadata } from "next";
import { ApiDocs } from "@/components/ApiDocs";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Dokumentasi publik API situs ini.",
};

export default function ApiDocsPage() {
  return <ApiDocs />;
}
```

- [ ] **Step 3: Buat `src/components/ApiDocs.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Code2, Play, Loader2, Check, Copy } from "lucide-react";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  example: unknown;
  dynamicSlug?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/posts",
    description: "Daftar semua artikel blog (ringkas).",
    example: {
      ok: true,
      data: [
        {
          slug: "deploy-vercel",
          title: "Contoh Judul",
          excerpt: "Ringkasan artikel",
          tags: ["nextjs", "tutorial"],
          date: "2026-01-01",
          readingTime: 4,
        },
      ],
    },
  },
  {
    method: "GET",
    path: "/api/v1/posts/{slug}",
    description: "Satu artikel lengkap berdasarkan slug. 404 jika tidak ada.",
    dynamicSlug: "deploy-vercel",
    example: {
      ok: true,
      data: {
        slug: "deploy-vercel",
        title: "Contoh Judul",
        excerpt: "Ringkasan",
        tags: ["nextjs"],
        date: "2026-01-01",
        readingTime: 4,
        content: "# Isi markdown\n\nParagraf...",
      },
    },
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    description: "Ringkasan statistik publik (jumlah post, reaksi, komentar, GitHub).",
    example: {
      ok: true,
      data: {
        posts: 10,
        reactions: 42,
        comments: 7,
        github: { followers: 5, publicRepos: 20, totalStars: 12, topLanguages: ["TypeScript"] },
      },
    },
  },
  {
    method: "GET",
    path: "/api/v1/site/status",
    description: "Status kesehatan integrasi eksternal.",
    example: {
      ok: true,
      data: {
        integrations: [
          { name: "GitHub", status: "up", latencyMs: 120 },
        ],
      },
    },
  },
];

const methodColor: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-500",
};

export function ApiDocs() {
  const [results, setResults] = useState<Record<number, unknown>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<number | null>(null);

  async function tryEndpoint(index: number, endpoint: Endpoint) {
    setLoadingId(index);
    setErrors((prev) => ({ ...prev, [index]: "" }));
    const url = endpoint.dynamicSlug
      ? endpoint.path.replace("{slug}", endpoint.dynamicSlug)
      : endpoint.path;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      setResults((prev) => ({ ...prev, [index]: data }));
    } catch {
      setErrors((prev) => ({ ...prev, [index]: "Gagal terhubung ke endpoint." }));
    } finally {
      setLoadingId(null);
    }
  }

  async function copyExample(index: number, endpoint: Endpoint) {
    await navigator.clipboard.writeText(JSON.stringify(endpoint.example, null, 2));
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-10 flex items-center gap-3">
        <Code2 className="h-8 w-8 text-highlight" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">API Docs</h1>
          <p className="mt-1 text-muted">
            Public API read-only untuk konten situs ini. Tidak memerlukan API key.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {ENDPOINTS.map((endpoint, index) => (
          <div
            key={endpoint.path}
            className="overflow-hidden rounded-2xl border border-border bg-card/50"
          >
            <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
              <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${methodColor[endpoint.method]}`}>
                {endpoint.method}
              </span>
              <code className="font-mono text-sm">{endpoint.path}</code>
              <span className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => tryEndpoint(index, endpoint)}
                  disabled={loadingId === index}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loadingId === index ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Coba
                </button>
                <button
                  onClick={() => copyExample(index, endpoint)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  {copied === index ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Salin
                </button>
              </span>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-muted">{endpoint.description}</p>

              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-highlight">
                  Lihat contoh respons
                </summary>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs whitespace-pre">
                  {JSON.stringify(endpoint.example, null, 2)}
                </pre>
              </details>

              {results[index] && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted">Hasil:</p>
                  <pre className="overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs whitespace-pre">
                    {JSON.stringify(results[index], null, 2)}
                  </pre>
                </div>
              )}
              {errors[index] && (
                <p className="text-sm text-red-500">{errors[index]}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Tambah link di Footer**

Buka `src/components/Footer.tsx`. Di area link admin (`<Link href="/admin" ...>` sekitar baris 80-86), tambahkan link API docs sebelum/atau sesudahnya dengan pola yang sama:

```tsx
            <Link
              href="/api-docs"
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <Code2 className="h-4 w-4" />
              {t("footer.apiDocs")}
            </Link>
```

Import `Code2` dari lucide-react jika belum ada di Footer. Sesuaikan styling agar konsisten dengan link admin di sekitarnya.

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit && npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/api-docs/ src/components/ApiDocs.tsx src/components/Footer.tsx src/lib/i18n.tsx
git commit -m "Tambah halaman dokumentasi API publik"
```

---

### Task 11: Verifikasi Akhir

**Files:**
- Tidak ada perubahan kode.

**Interfaces:**
- Tidak ada.

- [ ] **Step 1: Build penuh**

Run: `npm run build`
Expected: exit 0, route baru terdaftar (`/api-docs`, `/api/v1/posts`, `/api/v1/stats`, `/api/v1/site/status`, `/api/admin/ai`, `/api/admin/stats`, `/api/admin/status`).

- [ ] **Step 2: Sanity check status git**

Run: `git status --short`
Expected: hanya file dari task 1-10 yang berubah; tidak ada file luar scope. `git diff --stat package.json` harus kosong (tidak ada dependency baru).

- [ ] **Step 3: Catat hasil**

Tulis ringkasan verifikasi ke `docs/superpowers/plans/2026-08-08-admin-powerup.md` di bagian bawah (append): hasil build, catatan manual check yang perlu dilakukan user (login admin, tiap tab, `/api-docs`, `/api/v1/posts` tanpa auth).

- [ ] **Step 4: Laporkan**

Laporkan ke controller: build exit 0, daftar route baru, dan catatan manual check.
