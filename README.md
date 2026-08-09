# Personal Website — dreverrse

Website personal Andre (Katou Megumi waifu chat AI included).

## Fitur

- Home, About, Portfolio, dan Blog
- Waifu chat AI (Katou Megumi) dengan OpenRouter
- Admin AI chat canvas (model `big-pickle` via OpenCode Zen) di `/admin/chat`
- Widget musik Last.fm
- Dark mode
- Admin panel untuk mengelola blog

## Menjalankan

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> Tanpa `.env.local` sebagian fitur (admin login, waifu, terjemahan, rate limit via Redis)
> tidak aktif dan jatuh ke fallback memori.

## Environment Variables

Semua variabel dijelaskan di `.env.example`. Yang wajib untuk produksi:

- `ADMIN_PASSWORD` + `ADMIN_SECRET` — login admin (`/admin`). Keduanya harus diset dan **berbeda**.
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — database posts, komentar, reaksi, cache terjemahan.
- `OPENCODE_ZEN_API_KEY` — API key OpenCode Zen (dipakai `/api/admin/chat`). Ambil di https://opencode.ai/auth
- `OPENCODE_ZEN_MODEL` (opsional) — model Zen, default `big-pickle`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — rate limiting (tanpa ini fallback memori).
- `OPENROUTER_API_KEY` — waifu chat AI, AI assistant, dan terjemahan blog.

## Supabase

Schema ada di `supabase/migrations/0001_init.sql`. Terapkan sekali di dashboard
Supabase (SQL Editor) atau via `supabase db push` sebelum mengaktifkan
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`.

## Teknologi

Next.js, TypeScript, Tailwind CSS, Supabase, Upstash Redis.
