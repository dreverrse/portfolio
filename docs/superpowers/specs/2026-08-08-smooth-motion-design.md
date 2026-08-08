# Design: Smooth Motion untuk Portfolio

Tanggal: 2026-08-08
Status: Disetujui

## Ringkasan

Menambah sensasi motion yang halus (subtle & elegant) ke seluruh website portfolio:

1. Scroll reveal (elemen muncul saat di-scroll)
2. Transisi halaman (navigasi terasa mulus)
3. Micro-interaction (hover, tap, entrance)

Pendekatan: framer-motion untuk scroll reveal & micro-interaction, React `<ViewTransition>` (native, didukung Next.js 16) untuk transisi halaman.

## 1. Fondasi Motion

- Buat `src/lib/motion.ts`: sumber kebenaran tunggal untuk easing, durasi, dan variant.
  - Easing halus: `[0.21, 0.47, 0.32, 0.98]` (cubic-bezier), durasi 0.5-0.7s.
  - Variant: `fadeUp`, `stagger` (container + item), `scaleIn`.
- Bungkus app dengan `<MotionConfig reducedMotion="user">` di `ClientProvider` agar semua animasi framer-motion hormati `prefers-reduced-motion` pengguna secara otomatis.

## 2. Scroll Reveal

- Upgrade `src/components/FadeIn.tsx`: dari animasi on-mount menjadi scroll-triggered
  menggunakan `whileInView` + `viewport={{ once: true, margin: "-80px" }}`.
  - Props: `delay`, `y`, `duration`, `className`.
- Terapkan stagger reveal (muncul berurutan halus) ke:
  - Home: kartu skills (grid 6 kartu).
  - About: kartu info kontak, chips skills, timeline edukasi, jobs, pengalaman, alamat.
  - Portfolio: kartu project.
  - Blog list: featured post + grid kartu blog.

## 3. Transisi Halaman (Page Transition)

- Gunakan React `<ViewTransition>` (import dari `react`) — pendekatan resmi Next.js 16.
- Bungkus konten tiap halaman dengan `ViewTransition` yang memetakan `transitionTypes`:
  - `nav-forward`: geser kiri (masuk lebih dalam, mis. home → portfolio/blog/about).
  - `nav-back`: geser kanan (kembali ke atas, mis. blog post → blog list, halaman → home).
  - default: none — navigasi tanpa type (back button browser, router.refresh)
    langsung ganti tanpa slide (browser default).
- Tag `next/link` dengan `transitionTypes={["nav-forward"]}` / `["nav-back"]`:
  - Navbar links: home = `nav-back`, lainnya = `nav-forward`.
  - Blog post: "kembali ke blog" = `nav-back`.
- Navbar diberi `viewTransitionName: "site-header"` + CSS agar tetap diam (anchor) selama
  transisi, tidak ikut bergeser.
- Tambah keyframes CSS di `globals.css`: `fade`, `slide` dengan offset ±60px, durasi
  exit 150ms / enter 210ms (asimetris, halus).
- `::view-transition { pointer-events: none; }` agar halaman tetap interaktif.
- Hormati `prefers-reduced-motion`: `animation-duration: 0s !important`.

## 4. Micro-interactions

- Navbar:
  - Entrance slide-down + fade saat mount (framer-motion).
  - Indikator link aktif meluncur antar item pakai `layoutId` (underline/background).
- Kartu (skills, project, blog): `whileHover` terangkat halus (`y: -4`) + glow existing.
- Tombol: `whileTap` scale 0.97.
- Chat bubble (WaifuWidget):
  - Bubble entrance pakai spring.
  - Panel chat buka/tutup dengan `AnimatePresence` + spring dari bawah (sekarang pop instan).
- BackToTop: muncul/hilang dengan spring (sekarang CSS transition).
- ThemeToggle: ikon berputar halus saat ganti tema.
- Footer social icons: hover lift (y) halus.

## 5. Performa & Aksesibilitas

- Hanya animasi `transform`/`opacity` (GPU-friendly), hindari animasi layout.
- Semua motion otomatis nonaktif untuk pengguna `prefers-reduced-motion`.

## Non-goals

- Tidak mengubah tata letak, konten, atau styling visual.
- Tidak menambah dependency baru.
- Tidak mengubah LoadingScreen (tetap seperti sekarang, hanya exit yang sudah halus).
