# Admin AI Chat Canvas (Big Pickle via OpenCode Zen) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat halaman chat khusus admin di `/admin/chat` memakai model `big-pickle` OpenCode Zen, proxied lewat route API server sehingga API key tidak pernah bocor ke browser.

**Architecture:** Server component `/admin/chat/page.tsx` cek `isAuthenticated()` lalu render komponen client `AiChat.tsx`. Komponen ini POST ke `/api/admin/chat` (route handler) yang memvalidasi body, lalu memanggil `lib/zen.ts` → OpenCode Zen `chat/completions` (model `big-pickle`). Balasan Markdown dirender ulang via `PostContent` yang sudah ada. Link "Chat" ditambahkan di Navbar publik; belum login → redirect ke `/admin`.

**Tech Stack:** Next.js 16.3 (App Router), React 19, Tailwind v4, OpenCode Zen API (`@ai-sdk/openai-compatible` protocol — dipanggil langsung via `fetch`, tanpa dependency baru).

## Global Constraints

- Tanpa dependency npm baru. Semua memakai `fetch` bawaan.
- API key Zen (`OPENCODE_ZEN_API_KEY`) hanya dibaca di server (`lib/zen.ts` / route handler), tidak pernah di client.
- Semua route/halaman chat mengecek `isAuthenticated()` (cookie `blog_admin`). Non-admin → 401 (API) / redirect ke `/admin` (halaman).
- Pesan max 4000 karakter, maks 20 pesan per request (ambil 20 terakhir). Rate limit 20 req / 5 menit per IP via `rateLimit()` yang ada.
- Verifikasi tiap task: `npx tsc --noEmit` exit 0 dan `npm run lint` exit 0 (tidak ada test framework di repo ini — pola yang sudah dipakai).
- Balasan dirender dengan `PostContent` (bukan dependency markdown baru).
- Endpoint Zen: `https://opencode.ai/zen/v1/chat/completions`, model `big-pickle`, header `Authorization: Bearer <key>`.

---

### Task 1: Wrapper `lib/zen.ts`

**Files:**
- Create: `src/lib/zen.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `export interface ZenMessage { role: "user" | "assistant"; content: string }`
  - `export async function zenChat(messages: ZenMessage[]): Promise<string>` — mengembalikan teks balasan model. Melempar `Error` jika key belum diset atau semua model gagal.

- [ ] **Step 1: Tulis `src/lib/zen.ts`**

```ts
const ZEN_URL = "https://opencode.ai/zen/v1/chat/completions";
const ZEN_MODEL = process.env.OPENCODE_ZEN_MODEL || "big-pickle";

export interface ZenMessage {
  role: "user" | "assistant";
  content: string;
}

export async function zenChat(messages: ZenMessage[]): Promise<string> {
  const apiKey = process.env.OPENCODE_ZEN_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Server belum dikonfigurasi. Tambahkan OPENCODE_ZEN_API_KEY di environment."
    );
  }

  const res = await fetch(ZEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
    body: JSON.stringify({
      model: ZEN_MODEL,
      messages,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(
      data?.error?.message || `Zen API error (${res.status})`
    );
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Tidak ada balasan dari model");
  }
  return reply;
}
```

Catatan: endpoint Zen memakai format OpenAI `chat/completions` (lihat docs Zen — model `big-pickle` di `https://opencode.ai/zen/v1/chat/completions`).

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/zen.ts
git commit -m "Tambah wrapper OpenCode Zen (model big-pickle)"
```

---

### Task 2: Route `/api/admin/chat`

**Files:**
- Create: `src/app/api/admin/chat/route.ts`

**Interfaces:**
- Consumes:
  - `isAuthenticated` dari `@/lib/admin-auth`
  - `getClientIp`, `rateLimit` dari `@/lib/ratelimit`
  - `zenChat` dari `@/lib/zen` (signature: `(messages: ZenMessage[]) => Promise<string>`)
- Produces: `POST` menerima `{ messages: { role: "user"|"assistant"; content: string }[] }`, mengembalikan `{ reply: string }` (200) atau `{ error: string }` (400/401/429/500).

- [ ] **Step 1: Tulis `src/app/api/admin/chat/route.ts`**

```ts
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/ratelimit";
import { zenChat, type ZenMessage } from "@/lib/zen";

export const maxDuration = 60;

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 20;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = await rateLimit(getClientIp(request), {
    limit: MAX_REQUESTS,
    windowMs: WINDOW_MS,
    prefix: "rl:admin-chat",
  });
  if (!blocked.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 }
    );
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: ZenMessage[] = raw
    .filter(
      (m): m is { role: string; content: string } =>
        typeof m === "object" &&
        m !== null &&
        (m as { role?: unknown }).role === "user" ||
        (typeof m === "object" &&
          m !== null &&
          (m as { role?: unknown }).role === "assistant")
    )
    .map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: String(m.content ?? ""),
    }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_MESSAGES);

  if (messages.length === 0) {
    return NextResponse.json({ error: "Tidak ada pesan" }, { status: 400 });
  }

  if (messages.some((m) => m.content.length > MAX_MESSAGE_LENGTH)) {
    return NextResponse.json(
      { error: `Pesan terlalu panjang (maks ${MAX_MESSAGE_LENGTH} karakter)` },
      { status: 400 }
    );
  }

  try {
    const reply = await zenChat(messages);
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses" },
      { status: 502 }
    );
  }
}
```

Perhatikan: filter role ditulis verbose agar type guard benar — jangan disederhanakan dengan cara yang membuat `m` bertipe `unknown` lolos ke `m.role`.

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: exit 0 (route ter-type-check).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/chat/route.ts
git commit -m "Tambah route /api/admin/chat (auth, rate limit, proxy Zen)"
```

---

### Task 3: Halaman `/admin/chat` + Komponen `AiChat.tsx`

**Files:**
- Create: `src/app/admin/chat/page.tsx`
- Create: `src/components/AiChat.tsx`

**Interfaces:**
- Consumes:
  - `isAuthenticated` dari `@/lib/admin-auth`
  - `redirect` dari `next/navigation`
  - `PostContent` dari `@/components/PostContent` (prop `{ content: string }`)
  - `zenChat` tidak dipakai langsung di client — hanya via fetch ke `/api/admin/chat`.
- Produces:
  - `AiChat` — React client component tanpa props, me-render seluruh UI chat.
  - `AdminChatPage` — server component default export.

- [ ] **Step 1: Tulis `src/app/admin/chat/page.tsx`**

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";
import { AiChat } from "@/components/AiChat";

export const metadata: Metadata = {
  title: "AI Chat",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/admin");
  }
  return <AiChat />;
}
```

- [ ] **Step 2: Tulis `src/components/AiChat.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Loader2, MessageSquare } from "lucide-react";
import { PostContent } from "@/components/PostContent";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-foreground";

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const history = messages.slice(-20);
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content }],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || "Gagal memproses"
        );
      }
      const reply = (data as { reply?: string }).reply || "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Chat</h1>
            <p className="text-sm text-muted">
              Canvas admin — model <code className="text-highlight">big-pickle</code> (OpenCode Zen)
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className={btnGhost}>
            <Trash2 className="h-4 w-4" />
            Bersihkan
          </button>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-4 max-h-[60vh] overflow-y-auto">
        {messages.length === 0 && !loading && (
          <p className="py-12 text-center text-sm text-muted">
            Mulai percakapan dengan Big Pickle.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-accent px-4 py-2.5 text-sm text-white whitespace-pre-wrap"
                  : "max-w-[85%] rounded-2xl border border-border bg-background px-4 py-3"
              }
            >
              {m.role === "user" ? m.content : <PostContent content={m.content} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Big Pickle sedang mengetik…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`${inputClass} resize-none flex-1`}
          rows={2}
          placeholder="Tulis pesan untuk Big Pickle..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className={btnPrimary}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/chat/page.tsx src/components/AiChat.tsx
git commit -m "Tambah halaman /admin/chat dan komponen AiChat"
```

---

### Task 4: Link "Chat" di Navbar (publik, admin-only)

**Files:**
- Modify: `src/components/Navbar.tsx:11-19` (import icon + `navItems` array)
- Modify: `src/lib/i18n.tsx:22` dan `src/lib/i18n.tsx:129` (kunci `nav.chat`)

**Interfaces:**
- Consumes: `MessageSquare` dari `lucide-react`, kunci i18n `nav.chat` (id: "Chat", en: "Chat").
- Produces: link `/chat` di desktop & mobile menu.

- [ ] **Step 1: Tambah kunci i18n `nav.chat`**

Di `src/lib/i18n.tsx`:
- Blok `id` (setelah `"nav.blog": "Blog",` baris 21): tambah `"nav.chat": "Chat",`
- Blok `en` (setelah `"nav.blog": "Blog",` baris 128): tambah `"nav.chat": "Chat",`

Catatan: target halaman tetap `/admin/chat`, hanya label yang pakai i18n.

- [ ] **Step 2: Tambah item navbar**

Di `src/components/Navbar.tsx`:
- Tambah `MessageSquare` ke import `lucide-react` (baris 11-19).
- Tambah item ke array `navItems` (baris 21-26):

```tsx
{ href: "/admin/chat", labelKey: "nav.chat", icon: MessageSquare },
```

Halaman `/admin/chat` sudah redirect ke `/admin` jika belum login, jadi aman ditautkan dari navbar publik. Desktop (`navItems.map`) dan mobile menu (`navItems.map`) otomatis ikut — tidak perlu perubahan lain.

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit` lalu `npm run lint`
Expected: keduanya exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.tsx src/lib/i18n.tsx
git commit -m "Tambah link Chat di navbar publik (menuju /admin/chat)"
```

---

### Task 5: Verifikasi Akhir + Setup Env

**Files:**
- Modify: `README.md` (opsional, catatan env)

**Interfaces:**
- Consumes: semua task sebelumnya.
- Produces: —

- [ ] **Step 1: Build penuh**

Run: `npm run build`
Expected: build sukses, `src/app/admin/chat/page.tsx` ter-detect sebagai route.

- [ ] **Step 2: (Opsional) Catat env di README**

Di `README.md` tambah baris:

```
- `OPENCODE_ZEN_API_KEY` — API key OpenCode Zen (dipakai /api/admin/chat). Ambil di https://opencode.ai/auth
- `OPENCODE_ZEN_MODEL` (opsional) — model Zen, default `big-pickle`
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Catat env OPENCODE_ZEN_API_KEY di README"
```

- [ ] **Step 4: Set env di Vercel**

Di Vercel dashboard → project → Settings → Environment Variables: tambah `OPENCODE_ZEN_API_KEY` dengan nilai dari https://opencode.ai/auth. Redeploy.

- [ ] **Step 5: Uji manual**

1. Buka `/admin/chat` tanpa login → diarahkan ke `/admin`.
2. Login admin → buka `/admin/chat`.
3. Ketik pesan → balasan Big Pickle muncul ter-render sebagai Markdown.
4. Klik "Bersihkan" → riwayat hilang.
5. `curl -s -o /dev/null -w "%{http_code}" -X POST https://dreverrse.my.id/api/admin/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hi"}]}'` → 401 (tanpa cookie).
