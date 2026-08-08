# Design: Admin Power-Up — AI Assistant, Dashboard, Public API, Status Monitor, Login Redesign

Tanggal: 2026-08-08
Status: Disetujui

## Ringkasan

Menambah 5 fitur pada situs personal, semuanya terpusat di bagian admin yang
sudah ada (login + CRUD artikel blog):

1. **AI Content Assistant** — bantuan menulis pakai OpenRouter (sudah ada di
   codebase): generate draft dari topik, auto excerpt + tags, rewrite, dan
   translate artikel.
2. **Dashboard Statistik** — panel admin berisi KPI dan top 5 artikel
   berdasarkan komentar/reaksi, plus snapshot GitHub & Last.fm.
3. **Public API + Dokumentasi** — endpoint publik read-only (`/api/v1/*`)
   dengan halaman dokumentasi interaktif di `/api-docs`.
4. **Status Monitor Situs** — panel admin yang mengecek kesehatan + latency
   semua integrasi eksternal (GitHub, Last.fm, waifu, OpenRouter, Supabase).
5. **Redesign Login Admin** — halaman login diubah dari kartu polos menjadi
   desain Mix: glassmorphism + gradient ring + animasi entry bertahap.

Semua fitur mengikuti pola yang sudah ada, **tanpa dependency baru**, dan
mendukung Supabase aktif dengan fallback memory (pola `posts-store`).

## Prinsip Bersama

- Semua endpoint admin (bukan `/api/v1/*`) wajib cek `isAuthenticated()`.
- Semua fetch eksternal wajib punya timeout (`AbortSignal.timeout`) — pola
  fix `src/app/api/github/route.ts`.
- Endpoint AI dan public API memakai `rateLimit()` dari `src/lib/ratelimit.ts`.
- Response JSON konsisten: admin `{ error }`/`{ ok }` (pola lama), public
  `{ ok: true, data }` / `{ ok: false, error, status }`.
- Fallback memory tetap berjalan saat Supabase error (pola `posts-store`).

## 1. AI Content Assistant

**File baru:**
- `src/lib/ai-assistant.ts` — logika per action, reuse `chatOpenRouter`
  dari `src/lib/openrouter.ts` dan `translatePost` dari `src/lib/translate.ts`.
- `src/app/api/admin/ai/route.ts` — `POST`, wajib auth admin.

**Actions (`action` field di body JSON):**

| action | input | output |
|--------|-------|--------|
| `draft` | `topic` (string) | `{ title, excerpt, content }` — outline + draft artikel markdown |
| `excerptTags` | `content` (string) | `{ excerpt, tags }` — ringkasan + maks 10 tag |
| `rewrite` | `content`, `instruction` | `{ content }` — konten diperbaiki sesuai instruksi |
| `translate` | `slug` | reuse `translatePost(post, "full")` → `{ title, excerpt, content }` |

- Sistem prompt + validasi output per action, mengikuti pola
  `validateTranslation` di `translate.ts` (extract JSON, cek kunci wajib).
- `rateLimit` per IP: mis. 20 request / 5 menit, prefix `rl:admin-ai`.
- Error handling: `chatOpenRouter` sudah melempar error dengan pesan
  Indonesia; route meneruskannya sebagai `{ error }` 500.

**UI:** tab "AI Assistant" di `AdminApp.tsx`. Komponen `AiAssistantPanel.tsx`
(di `src/components/`):
- Dropdown action + textarea input (topic/konten/slug).
- Tombol Generate → POST `/api/admin/ai` → tampilkan hasil.
- Hasil preview markdown (reuse `PostContent` untuk render).
- Tombol "Pakai di Editor" → isi form Posts (title/excerpt/content) lalu
  pindah ke tab Posts. Untuk action `translate`, hasilnya hanya preview
  (karena terjemahan disimpan di cache translate, bukan di post).

## 2. Dashboard Statistik

**File baru:**
- `src/lib/admin-stats.ts` — query Supabase + agregasi.
- `src/app/api/admin/stats/route.ts` — `GET`, wajib auth admin.
- `src/components/AdminDashboard.tsx` — tab "Dashboard".

**Data yang dikembalikan (`/api/admin/stats`):**
```
{
  totals: { posts, reactions, comments, translations },
  topPosts: [ { slug, title, date, comments, reactions } ] (top 5),
  github: { followers, stars } | null,      // reuse logika api/github
  lastfm: { track, artist, isPlaying } | null  // reuse lastfm.ts
}
```

- Query Supabase: count `admin_posts`, count `post_reactions`, count
  `post_comments`, count `translation_cache`; top 5 per post dari
  `post_comments`/`post_reactions` group by `post_slug` join judul.
- GitHub & Last.fm: ekstrak logika fetch menjadi fungsi bersama yang
  dipakai widget publik dan dashboard (mis. `src/lib/github-stats.ts`),
  dengan timeout dan toleransi gagal (`null`).
- Tanpa chart library: bar proporsional pakai `width%` + Tailwind.

**UI:** kartu KPI (4 angka), daftar top 5 artikel (judul + bar
komentar/reaksi), widget GitHub (followers/stars) dan Last.fm (lagu
terakhir). Tombol refresh.

## 3. Public API + Dokumentasi

**Endpoint baru (read-only, tanpa auth, pakai rate limit):**

| Endpoint | Output |
|----------|--------|
| `GET /api/v1/posts` | `{ ok, data: [{ slug, title, excerpt, tags, date, readingTime }] }` |
| `GET /api/v1/posts/[slug]` | `{ ok, data: post }` lengkap; 404 `{ ok:false, error }` |
| `GET /api/v1/stats` | `{ ok, data: { posts, reactions, comments, github } }` |
| `GET /api/v1/site/status` | `{ ok, data: { integrations: [...] } }` — health check publik, reuse `src/lib/site-status.ts` |

- `Cache-Control`: `posts` dan `posts/[slug]` → `public, s-maxage=300`;
  `stats`/`site/status` → `no-store`.
- Rate limit `rateLimit()` per IP: mis. 60 request / menit, prefix
  `rl:public-api`.
- Reuse data layer yang ada (`getAllPosts`, `getPostBySlug`,
  `admin-stats`), bukan menulis query duplikat.

**Halaman `/api-docs`** (`src/app/api-docs/page.tsx` + komponen):
- Daftar endpoint, metode, deskripsi, contoh respons JSON.
- Tombol "Coba" per endpoint → `fetch` dari browser → tampilkan JSON mentah
  (dengan `AbortController` timeout di sisi klien).
- Styling konsisten tema (dark mode ikut via CSS variable yang sudah ada).
- Halaman publik (tanpa auth), bisa di-link dari footer/navbar.

## 4. Status Monitor Situs

**File baru:**
- `src/lib/site-status.ts` — health check tiap integrasi (paralel, timeout).
- `src/app/api/admin/status/route.ts` — `GET`, wajib auth admin.
- `src/components/AdminStatus.tsx` — tab "Status".

**Integrasi yang dicek (paralel, masing-masing `AbortSignal.timeout(8000)`):**

| Integrasi | Cara cek | Status |
|-----------|----------|--------|
| GitHub | `https://api.github.com/rate_limit` | up/down + latencyMs |
| Last.fm | `user.getinfo` (key + username terpasang?) | up/down/disabled |
| Waifu | reuse logika `api/waifu` (ping endpoint) | up/down/disabled |
| OpenRouter | key terpasang? ping `/models` | up/down/disabled |
| Supabase | query ringan `count` dari `admin_posts` | up/down/disabled |

- Tiap hasil: `{ name, status: "up"|"down"|"disabled", latencyMs, error? }`.
- Integrasi tanpa konfigurasi env → `disabled`.
- Dispatcher paralel (`Promise.allSettled`), satu yang gagal tidak
  menghentikan yang lain.

**UI:** kartu per integrasi (hijau/merah/abu), latency dalam ms, tombol
refresh.

## 5. Redesign Login Admin

**Lokasi:** blok `if (!authenticated)` di `src/components/AdminApp.tsx`
(layout login saat ini kartu polos). Dirender sebagai `LoginCard.tsx`
(komponen baru di `src/components/`) agar `AdminApp.tsx` tetap ringkas.

**Desain Mix (glassmorphism + gradient ring + animasi entry bertahap):**

- **Latar:** layer blur dengan dua blob gradient (`bg-accent/10`,
  `bg-highlight/5`, `blur-3xl`, `rounded-full`) — pola yang sama dengan hero
  di `HomeContent.tsx`; `absolute` + `pointer-events-none`.
- **Kartu:** `backdrop-blur`, `bg-card/50`, `border border-border`,
  `rounded-2xl`, shadow halus.
- **Gradient ring:** border tipis dengan `background-image` gradient
  accent→highlight di salah satu sisi (mis. ring atas/top-border gradient),
  `glow-hover` pada tombol.
- **Animasi entry bertahap:** pakai framer-motion (sudah ada via `FadeIn`)
  atau `motion.div` langsung — title muncul dulu, lalu form, lalu tombol
  (stagger delay kecil: 0, 0.1, 0.2).
- **Ikon:** `Lock` dari lucide-react di samping heading, ukuran konsisten.
- **Input & tombol:** pakai `inputClass`/`btnPrimary` yang sudah ada,
  `Loader2 animate-spin` saat loading, pesan error `text-red-500`.
- **Perilaku tidak berubah:** submit tetap `POST /api/admin/login`, autoFocus
  password, required.

## Testing & Verifikasi

- Project tidak punya framework test. Verifikasi: `npx tsc --noEmit`,
  `npm run lint`, `npm run build` semuanya exit 0.
- Manual: login admin → coba tiap tab; `/api-docs` → coba tiap endpoint;
  pastikan `/api/v1/posts` bisa diakses tanpa auth dan memberikan 401 untuk
  area admin; cek login page baru (animasi, glow, error state).
- Pastikan tidak ada dependency baru (cek `package.json` tidak berubah).

## Out of Scope

- Edit/delete post dari public API (read-only).
- Otentikasi API key untuk `/api/v1/*`.
- Chart library, ORM, atau framework API baru.
- Perubahan skema Supabase (memakai tabel yang sudah ada).
