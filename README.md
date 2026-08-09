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
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Variables

- `OPENCODE_ZEN_API_KEY` — API key OpenCode Zen (dipakai `/api/admin/chat`). Ambil di https://opencode.ai/auth
- `OPENCODE_ZEN_MODEL` (opsional) — model Zen, default `big-pickle`

## Teknologi

Next.js, TypeScript, Tailwind CSS, Supabase, Vercel KV.
