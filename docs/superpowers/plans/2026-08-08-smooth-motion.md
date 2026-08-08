# Smooth Motion Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat website portfolio terasa mulus (subtle & elegant) dengan scroll reveal, transisi halaman, dan micro-interactions.

**Architecture:** framer-motion (dependency yang sudah ada) untuk semua animasi — scroll reveal via `whileInView`, entrance transisi halaman via `app/template.tsx`, micro-interaction via motion components. Semua animasi dihormati `prefers-reduced-motion` melalui `MotionConfig reducedMotion="user"` + media query CSS.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript, Tailwind v4, framer-motion 12.43.0 (sudah terinstall).

## Deviation dari Spec

Spec menyebut React `<ViewTransition>` untuk transisi halaman arah (nav-forward/nav-back). **TIDAK bisa dipakai**: React 19.2.8 (stable, terinstall) tidak mengekspor `ViewTransition` (hanya ada di React canary yang dibundel internal oleh Next, tidak diresolusi oleh kode user). `transitionTypes` prop pada `next/link` membutuhkan komponen tersebut.

Solusi yang andal: **entrance transition via `app/template.tsx`** (template re-mount setiap navigasi di App Router → animasi masuk yang halus setiap pindah halaman). Tidak ada hack router, tidak ada upgrade canary yang berisiko. Scroll reveal + micro-interactions memberikan sensasi mulus secara keseluruhan.

## Global Constraints

- Repo: `/public/portfolio`. Selalu jalankan perintah dari direktori ini.
- **DILARANG menambah dependency baru.** Hanya pakai framer-motion (sudah ada) dan lucide-react / react-icons (sudah ada).
- Impor framer-motion dari `"framer-motion"` (konvensi project: lihat `LoadingScreen.tsx`).
- Hanya animasi properti `transform` dan `opacity` (GPU-friendly). Jangan animasi `width`, `height`, `margin`, `top`, `bottom`.
- Setiap elemen animasi harus menghormati `prefers-reduced-motion` (ditangani otomatis oleh `MotionConfig` untuk framer-motion, dan media query CSS untuk CSS transition).
- JANGAN mengubah: `LoadingScreen.tsx`, `ScrollProgress.tsx`, tata letak/halaman, konten, styling visual dasar, atau struktur layout.
- Setiap task: verifikasi dengan `npx tsc --noEmit` DAN `npm run lint` sebelum commit. Tidak ada framework test di repo ini — verifikasi visual lewat `npm run dev`.
- Commit pakai Bahasa Indonesia imperatif, mengikuti gaya history repo (mis. `Tambah ...`, `Perjelas ...`).
- `AGENTS.md` memperingatkan Next.js 16 punya breaking changes — jika ragu, baca `node_modules/next/dist/docs/`.

## File Structure

- Create `src/lib/motion.ts` — variant & easing bersama (sumber kebenaran tunggal).
- Create `src/components/Stagger.tsx` — helper container/item untuk stagger reveal.
- Create `src/app/template.tsx` — entrance transisi halaman.
- Modify `src/components/ClientProvider.tsx` — bungkus dengan `MotionConfig`.
- Modify `src/components/FadeIn.tsx` — jadi scroll-triggered reveal.
- Modify `src/components/Navbar.tsx` — entrance + indikator link aktif meluncur.
- Modify `src/components/WaifuWidget.tsx` — bubble spring + panel `AnimatePresence`.
- Modify `src/components/Footer.tsx` — hover ikon sosial.
- Modify `src/components/BackToTop.tsx` — spring entrance/exit.
- Modify `src/components/ThemeToggle.tsx` — ikon berputar saat ganti tema.
- Modify `src/components/pages/HomeContent.tsx`, `AboutContent.tsx`, `PortfolioContent.tsx`, `BlogList.tsx` — stagger reveal.
- Modify `src/app/globals.css` — media query `prefers-reduced-motion`.

---

### Task 1: Fondasi Motion (motion.ts + MotionConfig)

**Files:**
- Create: `src/lib/motion.ts`
- Modify: `src/components/ClientProvider.tsx`

**Interfaces:**
- Produces:
  - `EASE: [number, number, number, number]` — easing halus `[0.21, 0.47, 0.32, 0.98]`.
  - `DURATION: number` — `0.55`.
  - `springTransition: Transition` — spring `{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }`.
  - `fadeUp: Variants` — `hidden` = `{ opacity: 0, y: 16 }`, `visible` = `{ opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } }`.
  - `staggerContainer: Variants` — `hidden` = `{}`, `visible` = `{ transition: { staggerChildren: 0.08, delayChildren: 0.1 } }`.

- [ ] **Step 1: Commit pending perubahan chat bubble (housekeeping)**

Working tree punya perubahan lama yang belum di-commit (task sebelumnya: swap gambar chat bubble). Commit dulu agar tree bersih:

```bash
git add public/avatars/waifu-bubble.jpg src/components/WaifuWidget.tsx
git commit -m "Ganti gambar chat bubble dengan ikon baru"
```

- [ ] **Step 2: Buat `src/lib/motion.ts`**

```ts
import type { Transition, Variants } from "framer-motion";

export const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];
export const DURATION = 0.55;

export const springTransition: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.8,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
```

- [ ] **Step 3: Bungkus `ClientProvider` dengan `MotionConfig`**

Edit `src/components/ClientProvider.tsx`:

```tsx
"use client";

import { useState, useCallback, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { LoadingScreen } from "./LoadingScreen";

export function ClientProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  const handleComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <LoadingScreen onComplete={handleComplete} />}
      <MotionConfig reducedMotion="user">
        <div
          className={loading ? "opacity-0 h-screen overflow-hidden" : "opacity-100 transition-opacity duration-500"}
        >
          {children}
        </div>
      </MotionConfig>
    </>
  );
}
```

- [ ] **Step 4: Verifikasi**

```bash
npx tsc --noEmit
npm run lint
```

Expected: tidak ada error.

- [ ] **Step 5: Commit**

```bash
git add src/lib/motion.ts src/components/ClientProvider.tsx
git commit -m "Tambah fondasi motion: shared variants dan MotionConfig"
```

---

### Task 2: Primitive Reveal (FadeIn + Stagger)

**Files:**
- Modify: `src/components/FadeIn.tsx`
- Create: `src/components/Stagger.tsx`

**Interfaces:**
- Consumes: `EASE`, `DURATION`, `fadeUp`, `staggerContainer` dari `@/lib/motion`.
- Produces:
  - `FadeIn({ children, delay?, y?, className? })` — motion.div scroll-reveal (once).
  - `Stagger({ children, className? })` — container stagger.
  - `StaggerItem({ children, className? })` — item stagger (motion.div).

- [ ] **Step 1: Tulis ulang `src/components/FadeIn.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE } from "@/lib/motion";

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: DURATION, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Buat `src/components/Stagger.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Verifikasi**

```bash
npx tsc --noEmit
npm run lint
```

Expected: tidak ada error.

- [ ] **Step 4: Commit**

```bash
git add src/components/FadeIn.tsx src/components/Stagger.tsx
git commit -m "Ubah FadeIn jadi scroll reveal dan tambah helper Stagger"
```

---

### Task 3: Terapkan Scroll Reveal ke Halaman Konten

**Files:**
- Modify: `src/components/pages/HomeContent.tsx`
- Modify: `src/components/pages/AboutContent.tsx`
- Modify: `src/components/pages/PortfolioContent.tsx`
- Modify: `src/components/pages/BlogList.tsx`

**Interfaces:**
- Consumes: `Stagger`, `StaggerItem` dari `@/components/Stagger`.

- [ ] **Step 1: Edit `HomeContent.tsx` — stagger kartu skills**

Tambah import:

```tsx
import { Stagger, StaggerItem } from "@/components/Stagger";
```

Ganti blok grid skills (sekarang `<div className="grid ...">` berisi kartu) menjadi:

```tsx
<Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {skills.map((skill) => {
    const Icon = skill.icon;
    return (
      <StaggerItem
        key={skill.label}
        className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
      >
        <Icon className="h-8 w-8 text-highlight mb-3 group-hover:scale-110 transition-transform duration-300" />
        <h3 className="font-semibold text-foreground">{skill.label}</h3>
        <p className="text-sm text-muted mt-1">{t(skill.descKey)}</p>
      </StaggerItem>
    );
  })}
</Stagger>
```

Bungkus seksi CTA collab (yang sekarang pakai `<FadeIn delay={0.4}>`) dengan `<Stagger>` + item tunggal? Tidak perlu — biarkan `FadeIn` yang sudah ada.

- [ ] **Step 2: Edit `AboutContent.tsx` — stagger grid & list**

Tambah import:

```tsx
import { Stagger, StaggerItem } from "@/components/Stagger";
```

Ganti blok kontak (grid 3 kartu `mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4`) menjadi:

```tsx
<Stagger className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
  <StaggerItem className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
    <MapPin className="h-5 w-5 text-highlight" />
    <div>
      <p className="text-xs text-muted">{t("about.location")}</p>
      <p className="text-sm font-medium">Semarang, Indonesia</p>
    </div>
  </StaggerItem>
  <StaggerItem className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
    <Phone className="h-5 w-5 text-highlight" />
    <div>
      <p className="text-xs text-muted">{t("about.whatsapp")}</p>
      <p className="text-sm font-medium">+62 851-5859-9235</p>
    </div>
  </StaggerItem>
  <StaggerItem className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
    <Mail className="h-5 w-5 text-highlight" />
    <div>
      <p className="text-xs text-muted">{t("about.email")}</p>
      <p className="text-sm font-medium break-all">work.andrefirmansah@gmail.com</p>
    </div>
  </StaggerItem>
</Stagger>
```

Ganti blok chips skills (`<div className="flex flex-wrap gap-3">`) menjadi:

```tsx
<Stagger className="flex flex-wrap gap-3">
  {skills.map((item) => {
    const Icon = item.icon;
    return (
      <StaggerItem
        key={item.label}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 text-sm text-muted hover:text-highlight hover:border-accent transition-all duration-200"
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </StaggerItem>
    );
  })}
</Stagger>
```

Ganti timeline edukasi (`<div className="space-y-0">` berisi item `.relative.pl-8.pb-8.border-l`) menjadi:

```tsx
<Stagger className="space-y-0">
  {education.map((item, i) => (
    <StaggerItem key={i} className="relative pl-8 pb-8 border-l border-border last:pb-0">
      <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-highlight border-2 border-background" />
      <p className="text-xs text-highlight font-medium mb-1">{item.year}</p>
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-muted mt-1">{t(item.descKey)}</p>
    </StaggerItem>
  ))}
</Stagger>
```

Ganti timeline jobs dengan pola yang sama:

```tsx
<Stagger className="space-y-0">
  {jobs.map((item, i) => (
    <StaggerItem key={i} className="relative pl-8 pb-8 border-l border-border last:pb-0">
      <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-highlight border-2 border-background" />
      <p className="text-xs text-highlight font-medium mb-1">
        {item.yearKey.replace("{present}", t("about.present"))}
      </p>
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-muted mt-1">{t(item.descKey)}</p>
    </StaggerItem>
  ))}
</Stagger>
```

Ganti daftar pengalaman (`<div className="space-y-3">`) menjadi:

```tsx
<Stagger className="space-y-3">
  {experiences.map((item, i) => {
    const Icon = item.icon;
    return (
      <StaggerItem key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50">
        <Icon className="h-5 w-5 text-highlight mt-0.5 shrink-0" />
        <p className="text-sm text-foreground/90 leading-relaxed">{t(item.textKey)}</p>
      </StaggerItem>
    );
  })}
</Stagger>
```

Biarkan section alamat memakai `FadeIn` yang ada (item tunggal).

- [ ] **Step 3: Edit `PortfolioContent.tsx` — stagger kartu project**

Tambah import:

```tsx
import { Stagger, StaggerItem } from "@/components/Stagger";
```

Ganti grid project (`<div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">`) menjadi:

```tsx
<Stagger className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {projects.map((project, i) => (
    <StaggerItem
      key={i}
      className="group flex flex-col p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
    >
      <div className="flex-1">
        <h3 className="font-semibold text-foreground group-hover:text-highlight transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted mt-2 leading-relaxed">{t(project.descKey)}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span key={tag} className="px-2.5 py-0.5 text-xs rounded-full bg-accent/20 text-highlight border border-accent/30">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 pt-3 border-t border-border">
        <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-highlight transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />
          {t("portfolio.demo")}
        </a>
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-highlight transition-colors">
            <FaGithub className="h-3.5 w-3.5" />
            {t("portfolio.code")}
          </a>
        )}
      </div>
    </StaggerItem>
  ))}
</Stagger>
```

- [ ] **Step 4: Edit `BlogList.tsx` — stagger grid kartu blog**

Tambah import:

```tsx
import { Stagger, StaggerItem } from "@/components/Stagger";
```

Ganti wrapper grid `rest` (`<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">`) menjadi `<Stagger>`; dan tiap kartu `<Link ...>` menjadi `<StaggerItem>` dengan className yang sama persis seperti milik Link, lalu tutup `</StaggerItem>` menggantikan `</Link>`:

```tsx
<Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {rest.map((post) => {
    const { title, excerpt } = localized(post, translations, lang);
    return (
      <StaggerItem
        key={post.slug}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
      >
        {post.image && (
          <div className="relative aspect-video w-full overflow-hidden border-b border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            {post.tags[0] ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-highlight">
                <Tag className="h-3 w-3" />
                {post.tags[0]}
              </span>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted">{formatDate(post.date, lang)}</span>
          </div>
          <h3 className="mt-3 font-semibold text-lg text-foreground group-hover:text-highlight transition-colors leading-snug">
            {title}
          </h3>
          <p className="mt-2 text-sm text-muted line-clamp-2">{excerpt}</p>
          <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3 w-3" />
            {post.readingTime} {t("blog.readingTime")}
          </div>
        </div>
      </StaggerItem>
    );
  })}
</Stagger>
```

Catatan: `StaggerItem` BUKAN `<Link>` — klik kartu tidak akan berfungsi. Untuk menjaga link tetap berfungsi, bungkus isi `StaggerItem` dengan `<Link href={`/blog/${post.slug}`} className="flex h-full flex-col ...">` ATAU lebih mudah: biarkan `StaggerItem` menjadi pembungkus dan tambahkan `<Link>` di dalamnya. Gunakan versi ini (Link di dalam, tetap bisa diklik):

```tsx
<StaggerItem
  key={post.slug}
  className="overflow-hidden rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
>
  <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
    {post.image && (
      <div className="relative aspect-video w-full overflow-hidden border-b border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.image} alt={title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
    )}
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        {post.tags[0] ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-highlight">
            <Tag className="h-3 w-3" />
            {post.tags[0]}
          </span>
        ) : (
          <span />
        )}
        <span className="text-xs text-muted">{formatDate(post.date, lang)}</span>
      </div>
      <h3 className="mt-3 font-semibold text-lg text-foreground group-hover:text-highlight transition-colors leading-snug">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted line-clamp-2">{excerpt}</p>
      <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-muted">
        <Clock className="h-3 w-3" />
        {post.readingTime} {t("blog.readingTime")}
      </div>
    </div>
  </Link>
</StaggerItem>
```

Ganti juga `{featured && (...)}` yang saat ini dibungkus `<FadeIn delay={0.1}>` — biarkan, hero single item tetap pakai `FadeIn`.

- [ ] **Step 5: Verifikasi**

```bash
npx tsc --noEmit
npm run lint
```

Expected: tidak ada error (khususnya tidak ada variabel `Link`/`Icon` yang tidak terpakai — `Link` masih dipakai di BlogList dan HomeContent).

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/HomeContent.tsx src/components/pages/AboutContent.tsx src/components/pages/PortfolioContent.tsx src/components/pages/BlogList.tsx
git commit -m "Terapkan scroll reveal stagger ke halaman konten"
```

---

### Task 4: Transisi Halaman (template.tsx)

**Files:**
- Create: `src/app/template.tsx`

**Interfaces:**
- Consumes: `EASE` dari `@/lib/motion`.

- [ ] **Step 1: Buat `src/app/template.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
```

Template re-mount setiap navigasi di App Router, jadi setiap pindah halaman konten masuk dengan fade + slide halus.

- [ ] **Step 2: Verifikasi**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected: build sukses, template ter-render tanpa error.

- [ ] **Step 3: Commit**

```bash
git add src/app/template.tsx
git commit -m "Tambah entrance transition antar halaman"
```

---

### Task 5: Micro-interaction Navbar

**Files:**
- Modify: `src/components/Navbar.tsx`

**Interfaces:**
- Consumes: `EASE` dari `@/lib/motion`.

- [ ] **Step 1: Edit `Navbar.tsx`**

Tambah import framer-motion dan EASE:

```tsx
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
```

Ganti `<nav className="fixed top-4 left-4 right-4 z-50">` menjadi:

```tsx
<motion.nav
  initial={{ opacity: 0, y: -16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: EASE }}
  className="fixed top-4 left-4 right-4 z-50"
>
```

...dan penutupnya `</nav>` menjadi `</motion.nav>`.

Ganti blok link desktop (di dalam `hidden md:flex`):

```tsx
<div className="hidden md:flex items-center gap-1">
  {navItems.map((item) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
          isActive ? "text-highlight" : "text-muted hover:text-foreground hover:bg-surface"
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 rounded-lg bg-accent/30"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <Icon className="relative h-4 w-4" />
        <span className="relative">{t(item.labelKey)}</span>
      </Link>
    );
  })}
</div>
```

Perubahan penting: class `bg-accent/30` aktif pindah dari Link ke `motion.span` pill; tambah `relative` di Link agar pill terposisi di dalamnya; `layoutId="nav-pill"` membuat pill meluncur antar link saat navigasi. Link aktif tetap `text-highlight`.

- [ ] **Step 2: Verifikasi**

```bash
npx tsc --noEmit
npm run lint
```

Expected: tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "Tambah entrance dan indikator link aktif yang meluncur di navbar"
```

---

### Task 6: Micro-interaction WaifuWidget

**Files:**
- Modify: `src/components/WaifuWidget.tsx`

**Interfaces:**
- Consumes: `springTransition` dari `@/lib/motion`.

- [ ] **Step 1: Edit `WaifuWidget.tsx`**

Tambah import framer-motion dan springTransition:

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { springTransition } from "@/lib/motion";
```

Ganti tombol bubble (`<button ...>` yang berisi X / img) menjadi:

```tsx
<motion.button
  onClick={toggleOpen}
  aria-label={t("waifu.aria")}
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={springTransition}
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.94 }}
  className="fixed bottom-5 right-5 z-[90] h-14 w-14 overflow-hidden rounded-full shadow-lg shadow-accent/30"
>
  {open ? (
    <span className="flex h-full w-full items-center justify-center bg-accent text-white">
      <X className="h-6 w-6" />
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/avatars/waifu-bubble.jpg" alt="" className="h-full w-full object-cover" />
  )}
</motion.button>
```

Catatan: class `hover:scale-105 transition-transform` dihapus karena diganti `whileHover`.

Ganti panel chat (`{open && (<div className="fixed bottom-24 right-5 z-[90] ...">`) dengan `AnimatePresence` + `motion.div`:

```tsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={springTransition}
      className="fixed bottom-24 right-5 z-[90] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl shadow-accent/10 backdrop-blur-xl"
    >
      ... (isi panel: header, pesan, form — TIDAK diubah)
    </motion.div>
  )}
</AnimatePresence>
```

Isi panel (header Megumi, daftar pesan, form input) tidak berubah — hanya pembungkus `<div>` menjadi `<motion.div>` di dalam `<AnimatePresence>`. Pastikan tag penutup diubah: `</motion.div>` lalu `)}` lalu `</AnimatePresence>`.

- [ ] **Step 2: Verifikasi**

```bash
npx tsc --noEmit
npm run lint
```

Expected: tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add src/components/WaifuWidget.tsx
git commit -m "Tambah spring pada chat bubble dan animasi buka-tutup panel"
```

---

### Task 7: Micro-interaction Footer, BackToTop, ThemeToggle

**Files:**
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/BackToTop.tsx`
- Modify: `src/components/ThemeToggle.tsx`

**Interfaces:**
- Consumes: `springTransition`, `EASE` dari `@/lib/motion`.

- [ ] **Step 1: Edit `Footer.tsx` — hover ikon sosial**

Tambah import:

```tsx
import { motion } from "framer-motion";
import { springTransition } from "@/lib/motion";
```

Ganti `{s.renderIcon("h-4 w-4")}` menjadi:

```tsx
<motion.span
  whileHover={{ y: -2, scale: 1.15 }}
  transition={springTransition}
  className="inline-flex"
>
  {s.renderIcon("h-4 w-4")}
</motion.span>
```

- [ ] **Step 2: Edit `BackToTop.tsx` — spring entrance**

Tambah import:

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { springTransition } from "@/lib/motion";
```

Hapus import `cn` dari `@/lib/utils` (tidak dipakai lagi). Ganti seluruh blok return menjadi:

```tsx
return (
  <AnimatePresence>
    {visible && (
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("backtotop.aria")}
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.9 }}
        transition={springTransition}
        className="fixed bottom-5 left-5 z-[70] h-11 w-11 rounded-full border border-border bg-card/80 backdrop-blur-md flex items-center justify-center text-muted hover:text-highlight hover:border-accent transition-colors duration-300 glow-hover"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    )}
  </AnimatePresence>
);
```

- [ ] **Step 3: Edit `ThemeToggle.tsx` — ikon berputar**

Tambah import:

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
```

Ganti `{isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}` menjadi:

```tsx
<AnimatePresence mode="wait" initial={false}>
  <motion.span
    key={isLight ? "moon" : "sun"}
    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
    animate={{ rotate: 0, opacity: 1, scale: 1 }}
    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
    transition={{ duration: 0.25, ease: EASE }}
    className="inline-flex"
  >
    {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
  </motion.span>
</AnimatePresence>
```

- [ ] **Step 4: Verifikasi**

```bash
npx tsc --noEmit
npm run lint
```

Expected: tidak ada error (perhatikan tidak ada import yang tidak terpakai, mis. `cn` di BackToTop).

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.tsx src/components/BackToTop.tsx src/components/ThemeToggle.tsx
git commit -m "Tambah micro-interaction di footer, back-to-top, dan theme toggle"
```

---

### Task 8: Reduced Motion CSS + Verifikasi Final

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Tambah media query `prefers-reduced-motion`**

Append di akhir `src/app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verifikasi final**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected: semua sukses tanpa error.

- [ ] **Step 3: Uji visual cepat**

Jalankan `npm run dev`, buka `http://localhost:3000` dan periksa:
- Load pertama: LoadingScreen hilang halus, konten home muncul dengan reveal.
- Scroll: kartu skills/contact/timeline muncul berurutan (stagger).
- Navigasi Home → Portfolio → About → Blog → blog post: setiap halaman masuk dengan fade+slide halus.
- Navbar: pill biru meluncur antar link aktif.
- Chat bubble: muncul dengan spring, panel buka/tutup mulus.
- BackToTop muncul dengan spring setelah scroll > 500px.
- Ganti tema: ikon berputar.
- Footer ikon: terangkat saat hover.
- Aktifkan "Reduce motion" di OS (atau DevTools emulation) → semua animasi nonaktif.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "Hormati prefers-reduced-motion di CSS"
```

---

## Self-Review

**Spec coverage:**
- Fondasi motion (easing, MotionConfig reducedMotion) → Task 1 ✓
- Scroll reveal FadeIn upgrade + stagger → Task 2, 3 ✓
- Transisi halaman → Task 4 (deviasi: template entrance, bukan ViewTransition — terdokumentasi di atas) ✓
- Navbar entrance + indikator aktif meluncur → Task 5 ✓
- Chat bubble spring + panel → Task 6 ✓
- Footer, BackToTop, ThemeToggle → Task 7 ✓
- Reduced motion CSS → Task 8 ✓
- Performa (hanya transform/opacity) → Global Constraints ✓

**Placeholder scan:** semua langkah berisi kode konkret, tidak ada TBD/TODO.

**Type consistency:** `EASE`, `DURATION`, `springTransition`, `fadeUp`, `staggerContainer` didefinisikan di Task 1 dan dipakai dengan nama yang sama di semua task berikutnya. `Stagger`/`StaggerItem` didefinisikan Task 2, dipakai Task 3. `motion.nav`/`motion.button`/`motion.div` konsisten.
