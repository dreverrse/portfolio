# Design: Paket 4 Fitur Tambahan Website Personal

Tanggal: 2026-08-08
Status: Disetujui

## Ringkasan

Menambah 4 fitur untuk memperkaya website personal:

1. Proyek & case study (halaman detail per proyek berbasis MDX)
2. GitHub stats widget (stats akun `dreverrse` dari public GitHub API)
3. Foto profil / hero visual (placeholder yang mudah diganti)
4. Pencarian + filter blog (client-side, tanpa API baru)

Semua fitur mengikuti pola & konvensi yang sudah ada di codebase (blog MDX,
`FadeIn`/`Stagger`, i18n EN/ID), tanpa dependency baru.

## 1. Proyek & Case Study

**Storage:** file `.mdx` di `content/projects/`. Frontmatter:

```
title, slug, excerpt, tags[], image, demo, github, date
```

Body MDX = isi case study (masalah, solusi, hasil). Konten awal diisi file
contoh `finora.mdx` (dipindah dari array hardcoded di `PortfolioContent.tsx`)
sebagai template yang bisa di-copy untuk proyek lain.

**Data layer:** `src/lib/projects.ts`
- `getAllProjects()` — baca semua `.mdx`, parse dengan `gray-matter` +
  `reading-time`, urutkan berdasarkan `date` menurun.
- `getProjectBySlug(slug)` — baca satu proyek, return `null` jika tidak ada.
- Pola mengikuti `src/lib/blog.ts` persis.

**Halaman:**
- `/portfolio` — grid kartu. `PortfolioContent.tsx` di-ubah: daftar proyek
  dirender dari `getAllProjects()` (server) lalu dikirim ke client component
  sebagai props. Tiap kartu `Link` ke `/portfolio/[slug]`. Layout & styling
  grid dipertahankan.
- `/portfolio/[slug]` — halaman detail (server component, pola
  `blog/[slug]/page.tsx`):
  - `generateMetadata`: title, description, canonical, OG image, tags.
  - Konten: hero proyek (title, excerpt, meta tags, tanggal), link demo &
    github, konten MDX dirender via `next-mdx-remote`.
  - JSON-LD untuk SEO (mirip blog).

## 2. GitHub Stats Widget

**Route:** `src/app/api/github/route.ts`
- Fetch `https://api.github.com/users/dreverrse` + `/users/dreverrse/repos`.
- Data yang dihitung: followers, public repos, total stars (sum dari repos),
  top languages (agregasi dari repos, ambil 3 teratas).
- **Cache server-side** (in-memory, TTL ~10 menit) agar tidak kena rate-limit
  GitHub API (60/jam unauthenticated).
- Jika fetch gagal/timeout → return `{ stats: null }`.

**UI:** `src/components/GitHubStats.tsx` — client component.
- Section baru di halaman home, di bawah kartu skills.
- Card menampilkan: followers, repos, total stars, top languages.
- Loading skeleton + state kosong jika data tidak tersedia (pola MusicWidget).

## 3. Foto Profil / Hero Visual

- **Asset:** `public/avatars/profile-placeholder.png` — avatar placeholder
  (siluet/ilustrasi netral) yang dibuat saat implementasi.
- **Penempatan:**
  - Hero home: lingkaran (`rounded-full`) di samping teks sapaan.
  - Header halaman about: di atas judul.
- **Mudah diganti:** user tinggal mengganti file dengan nama yang sama.

## 4. Pencarian + Filter Blog

Semua di `src/components/BlogList.tsx`, client-side, tanpa API baru.

- **State:** `query` (string) dan `activeTag` (string | null).
- **UI:**
  - Input search dengan ikon Search di atas grid.
  - Baris tag chips (kumpulan semua tag dari posts) yang bisa diklik untuk
    toggle filter.
- **Logika filter:** posts difilter dengan `query` (cocokkan title, excerpt,
  tags — case-insensitive) DAN `activeTag`. Filter diterapkan terhadap hasil
  yang sudah di-localize (EN/ID).
- **Empty state:** pesan "tidak ada hasil pencarian" jika filter kosong.

## Konsistensi Global

- Semua komponen baru memakai `FadeIn`/`Stagger` untuk reveal.
- Kunci i18n baru ditambahkan ke `src/lib/i18n.tsx` (ID + EN).
- Tanpa dependency baru.
- Verifikasi: `npx tsc --noEmit` + `npm run lint` (+ `npm run build`).
- Commit Bahasa Indonesia imperatif.
