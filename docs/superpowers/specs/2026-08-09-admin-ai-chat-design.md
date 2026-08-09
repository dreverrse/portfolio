# Design: Admin AI Chat Canvas (Big Pickle via OpenCode Zen)

Tanggal: 2026-08-09
Status: Disetujui

## Ringkasan

Membuat halaman chat khusus admin di `/admin/chat` yang memakai model
`big-pickle` dari OpenCode Zen. UI chat multi-turn dengan render Markdown,
proxied lewat route API server sehingga API key Zen tidak pernah bocor ke
browser.

## Pendekatan

- **Pendekatan A** (disetujui): route khusus `/api/admin/chat` + komponen
  client `AiChat.tsx`, tanpa dependency baru.
- Tidak memakai `@opencode-ai/sdk` (butuh opencode server lokal, tidak cocok
  untuk Vercel serverless).
- Tidak meng-umumkan `chatOpenRouter` (provider berbeda endpoint; menghindari
  campur key).

## 1. Arsitektur

```
Browser (client)                 Server (Vercel)                 OpenCode Zen
┌────────────────────┐  POST    ┌──────────────────────┐  fetch  ┌─────────────────┐
│ AiChat.tsx         │ ───────► │ /api/admin/chat      │ ──────► │ zen/v1/chat/    │
│ (UI multi-turn)    │   JSON   │  cek isAuthenticated │  Bearer │ completions     │
│ render PostContent │ ◄─────── │  cek body            │ ◄────── │ model: big-pickle│
└────────────────────┘   JSON   │  panggil lib/zen.ts  │         └─────────────────┘
                                └──────────────────────┘
```

- `/admin/chat/page.tsx` (server component) → cek `isAuthenticated()`, render
  `<AiChat/>`.
- `/api/admin/chat` (route handler) → satu-satunya pintu ke Zen; key hanya di
  server.

## 2. File

| File | Peran |
|---|---|
| `src/lib/zen.ts` | Wrapper panggil Zen. Env `OPENCODE_ZEN_API_KEY`. Pesan `{role, content}[]` (max 20 terakhir). Balas teks polos. |
| `src/app/api/admin/chat/route.ts` | POST. Auth → validasi body (max 4000 char/pesan, max 20 pesan) → panggil `zen.chat()` → `{reply}`. |
| `src/app/admin/chat/page.tsx` | Server component, cek auth, metadata noindex, render `<AiChat/>`. |
| `src/components/AiChat.tsx` | Client. State: `messages[]`, `loading`. Kirim → append user msg → POST → append assistant. Render Markdown via `PostContent`. Auto-scroll. Tombol "Bersihkan". |
| `src/components/Navbar.tsx` | Tambah link "Chat" (icon MessageSquare) di navbar **publik** → `/admin/chat`. Kalau belum login, halaman redirect ke `/admin`. |

## 3. Alur data

1. User ketik → `AiChat` append `{role:"user", content}` → `POST
   /api/admin/chat` body `{messages}`.
2. Route cek auth (cookie `blog_admin`); tidak valid → 401.
3. Panggil `lib/zen.ts` → OpenCode Zen `chat/completions` model `big-pickle`.
4. Balasan diteruskan ke client → append `{role:"assistant", content}` →
   render `PostContent`.
5. Error (429/502/zen gagal) → tampilkan pesan di bubble merah, riwayat
   tetap.

## 4. Keamanan

- **Key di server saja** — `OPENCODE_ZEN_API_KEY` di env Vercel, tidak pernah
  di client.
- Auth wajib (cookie session admin) — non-admin dapat 401.
- Rate limit pakai `rateLimit()` yang ada (memory/upstash), mis. 20 req /
  5 menit per IP.
- Batas panjang pesan & jumlah pesan → cegah biaya & penyalahgunaan.

## 5. Testing

- `npx tsc --noEmit` + `npm run lint`.
- Manual: login admin → buka `/admin/chat` → kirim pesan → cek balasan
  markdown.
- Tanpa login → halaman redirect ke `/admin` / API 401.

## 6. Keputusan yang dikonfirmasi

- Link "Chat" di navbar **publik** (opsi 1). Belum login → `/admin/chat`
  redirect ke `/admin`.
- Khusus admin: halaman & route API mengecek cookie `blog_admin`.
