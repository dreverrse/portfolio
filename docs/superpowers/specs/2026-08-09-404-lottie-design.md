# Design: Animasi Lottie di Halaman 404

Tanggal: 2026-08-09
Status: Disetujui

## Ringkasan

Mengganti ikon `Compass` (kotak glassmorphism 64px) di halaman 404
(`src/app/not-found.tsx`) dengan animasi compass Lottie yang lebih besar dan
hidup. Animasi diambil dari LottieFiles: `nz0kth9pvY.lottie`.

## Pendekatan

- Dependency baru: `@lottiefiles/dotlottie-web` (lightweight, framework-agnostic).
- File animasi disimpan self-host di `/public/lottie/404-compass.lottie`
  (120 KB, format DotLottie).
- Komponen kecil `src/components/LottiePlayer.tsx` ("use client") yang
  me-render DotLottie via `useEffect` + `useRef` (autoplay + loop).

## 1. Dependency & File

- `npm install @lottiefiles/dotlottie-web` — menambah dependency baru
  (satu-satunya perubahan `package.json`).
- Salin file `.lottie` ke `/public/lottie/404-compass.lottie`.

## 2. Komponen LottiePlayer

- `src/components/LottiePlayer.tsx`, "use client".
- Props: `src` (URL string), `className`.
- `useEffect` (mount, sekali): instansiasi `DotLottie` pada elemen
  `<div ref>`:
  - `src` = prop
  - `autoplay: true`, `loop: true`
  - `renderConfig`: default (canvas)
- Cleanup: `dotLottie.destroy()` pada unmount.
- Saat file gagal dimuat, DotLottie diam (tidak crash) — tidak ada
  fallback khusus.

## 3. Halaman 404

- Ganti blok kotak ikon (baris 19-23) dengan:
  - `<LottiePlayer src="/lottie/404-compass.lottie" className="h-52 w-52 sm:h-56 sm:w-56" />`
  - Bungkus tetap dalam `animate-float`.
- Hapus import `Compass` dari lucide-react (tidak dipakai lagi);
  `Home` dan `ArrowRight` tetap.
- Elemen lain (judul 404, teks, tombol) tidak berubah.

## Data Flow

Statis — file di `/public`, dirender client-side tanpa state/data.

## Error Handling

Gagal muat file = animasi tidak muncul, halaman tetap tampil normal.

## Verifikasi

- `npm run build` sukses.
- `npx tsc --noEmit` exit 0.
- `npm run lint` exit 0.
