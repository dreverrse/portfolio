# Paket 4 Fitur Tambahan — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan 4 fitur ke website personal: case study proyek berbasis MDX, widget stats GitHub, foto profil placeholder, dan pencarian+filter blog.

**Architecture:** Proyek disimpan sebagai file `.mdx` di `content/projects/` dengan data layer `src/lib/projects.ts` (pola persis `src/lib/blog.ts`), dirender di grid `/portfolio` dan halaman detail `/portfolio/[slug]`. GitHub stats di-fetch server-side di route `/api/github` dengan cache TTL, ditampilkan client-side. Foto profil berupa PNG statis di `public/avatars/`. Search/filter blog murni client-side di `BlogList.tsx`.

**Tech Stack:** Next.js 16.3 (App Router, server components), TypeScript, gray-matter, reading-time, framer-motion (`FadeIn`/`Stagger`), lucide-react, react-icons, Tailwind CSS v4. GitHub REST API.

## Global Constraints

- Repo root: `/public/portfolio` (branch `main`). Semua perintah jalan dari sini.
- **DILARANG menambah dependency baru** — semua paket yang dibutuhkan sudah ada.
- Imports: `@/lib/...`, `@/components/...`, lucide-react, react-icons (pola yang sudah ada).
- Pola MDX mengikuti `content/blog/` + `src/lib/blog.ts` persis (gray-matter, reading-time).
- Hanya file yang tercantum di `**Files:**` tiap task yang boleh dibuat/diubah.
- Kunci i18n baru ditambahkan ke `src/lib/i18n.tsx` — WAJIB di kedua blok (`id` dan `en`).
- Komponen yang memakai `useI18n`, `useState`, `useEffect` = client component (`"use client"`).
- Verifikasi tiap task: `npx tsc --noEmit` DAN `npm run lint` harus exit 0. Tidak ada framework test — kedua command ini adalah verifikasinya.
- Commit Bahasa Indonesia imperatif, satu commit per task.
- Daftar `content/projects/` hanya berisi `finora.mdx` (contoh). Proyek lain diisi user belakangan.
- `next.config.ts` sudah mengizinkan gambar `'self'`; MDX case study memakai `PostContent` yang sudah ada (bukan next-mdx-remote — tidak dipakai di codebase ini).

---

### Task 1: Data Layer Proyek + File MDX Contoh

**Files:**
- Create: `src/lib/projects.ts`
- Create: `content/projects/finora.mdx`

**Interfaces:**
- Consumes: `gray-matter`, `reading-time` (sudah di package.json).
- Produces: `interface Project { slug: string; title: string; excerpt: string; tags: string[]; image?: string; demo: string; github?: string; date: string; content: string; readingTime: number }`, `getAllProjects(): Project[]`, `getProjectBySlug(slug: string): Project | null` — dipakai Task 2, 3.

- [ ] **Step 1: Buat `src/lib/projects.ts`**

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

export interface Project {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  image?: string;
  demo: string;
  github?: string;
  date: string;
  content: string;
  readingTime: number;
}

interface ProjectFileData {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  image?: string;
  demo: string;
  github?: string;
  date: string;
  content: string;
}

function toProject(data: ProjectFileData): Project {
  return {
    ...data,
    readingTime: Math.max(1, Math.ceil(readingTime(data.content).minutes)),
  };
}

function readProjectFile(filePath: string, slug: string): Project {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  return toProject({
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    excerpt: data.excerpt || "",
    tags: data.tags || [],
    content,
    image: typeof data.image === "string" ? data.image : undefined,
    demo: typeof data.demo === "string" ? data.demo : "",
    github: typeof data.github === "string" ? data.github : undefined,
  });
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    return [];
  }

  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      return readProjectFile(path.join(PROJECTS_DIR, filename), slug);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getProjectBySlug(slug: string): Project | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return readProjectFile(filePath, slug);
}
```

- [ ] **Step 2: Buat `content/projects/finora.mdx`** (konten template yang bisa di-copy untuk proyek lain)

```mdx
---
title: "Finora"
date: "2025-01-15"
excerpt: "Aplikasi web pengelola keuangan untuk memantau pemasukan, pengeluaran, dan anggaran dalam satu dashboard yang rapi dan mudah digunakan."
tags: ["Next.js", "TypeScript", "Tailwind CSS"]
demo: "https://finora-dreverrse.vercel.app/"
github: "https://github.com/dreverrse/finora"
---

## Latar Belakang

Finora lahir dari kebiasaan mencatat keuangan yang masih manual dan tersebar di banyak tempat. Saya ingin satu dashboard yang merangkum pemasukan, pengeluaran, dan anggaran dalam satu tampilan.

## Masalah

Pencatatan manual rawan salah hitung dan sulit untuk melihat pola pengeluaran bulanan.

## Solusi

Aplikasi web yang menampilkan ringkasan keuangan dalam satu dashboard rapi, mudah digunakan, dan bisa diakses dari mana saja.

## Hasil

Dashboard pengelolaan keuangan yang bisa memantau pemasukan, pengeluaran, dan anggaran secara sekilas.
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/projects.ts content/projects/finora.mdx
git commit -m "Tambah data layer proyek dan contoh MDX Finora"
```

---

### Task 2: Grid Portfolio dari Data Layer

**Files:**
- Modify: `src/components/pages/PortfolioContent.tsx`
- Modify: `src/app/portfolio/page.tsx`
- Modify: `src/lib/i18n.tsx` (hapus key `project.finora`)

**Interfaces:**
- Consumes: `getAllProjects(): Project[]` (Task 1), `import type { Project } from "@/lib/projects"`.
- Produces: `PortfolioContent` sekarang menerima prop `projects: Project[]` — dipakai `src/app/portfolio/page.tsx`.

- [ ] **Step 1: Ubah `PortfolioContent.tsx`** — hapus array hardcoded, terima props

Ganti seluruh isi file dengan kode ini. Tiap kartu: judul jadi `Link` ke `/portfolio/${slug}`, data dari prop `projects`, demo/github tetap anchor eksternal (tidak boleh nested link).

```tsx
"use client";

import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/lib/projects";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

export function PortfolioContent({ projects }: { projects: Project[] }) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="text-foreground">{t("nav.portfolio")}</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl leading-relaxed">
          {t("portfolio.description")}
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Stagger className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <StaggerItem
              key={project.slug}
              className="group flex flex-col p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
            >
              <div className="flex-1">
                <Link href={`/portfolio/${project.slug}`} className="block">
                  <h3 className="font-semibold text-foreground group-hover:text-highlight transition-colors">
                    {project.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  {project.excerpt}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 text-xs rounded-full bg-accent/20 text-highlight border border-accent/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 pt-3 border-t border-border">
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-highlight transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("portfolio.demo")}
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-highlight transition-colors"
                  >
                    <FaGithub className="h-3.5 w-3.5" />
                    {t("portfolio.code")}
                  </a>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </FadeIn>
    </div>
  );
}
```

- [ ] **Step 2: Ubah `src/app/portfolio/page.tsx`** — fetch data server-side dan kirim ke client component

```tsx
import type { Metadata } from "next";
import { PortfolioContent } from "@/components/pages/PortfolioContent";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Proyek-proyek yang pernah saya kerjakan.",
};

export default async function PortfolioPage() {
  const projects = await getAllProjects();
  return <PortfolioContent projects={projects} />;
}
```

- [ ] **Step 3: Hapus key `project.finora` dari `src/lib/i18n.tsx`** (tidak dipakai lagi)

Hapus baris persis ini dari blok `id`:
```
    "project.finora":
      "Aplikasi web pengelola keuangan untuk memantau pemasukan, pengeluaran, dan anggaran dalam satu dashboard yang rapi dan mudah digunakan.",
```
Dan dari blok `en`:
```
    "project.finora":
      "A web app for managing finances to track income, expenses, and budgets in one clean and easy-to-use dashboard.",
```

- [ ] **Step 4: Verifikasi**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npm run lint` — Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/PortfolioContent.tsx src/app/portfolio/page.tsx src/lib/i18n.tsx
git commit -m "Tampilkan grid portfolio dari data layer MDX"
```

---

### Task 3: Halaman Detail Proyek `/portfolio/[slug]`

**Files:**
- Create: `src/app/portfolio/[slug]/page.tsx`
- Create: `src/components/pages/ProjectDetailView.tsx`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getProjectBySlug(slug: string): Project | null` (Task 1), `PostContent` (sudah ada, `@/components/PostContent`), `FadeIn`.
- Produces: halaman `/portfolio/[slug]` dengan `generateMetadata`; `ProjectDetailView({ project }: { project: Project })`.

- [ ] **Step 1: Buat `src/app/portfolio/[slug]/page.tsx`**

Pola `src/app/blog/[slug]/page.tsx` persis:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/pages/ProjectDetailView";
import { getProjectBySlug } from "@/lib/projects";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

function absoluteImage(image?: string): string | undefined {
  if (!image) return undefined;
  return image.startsWith("http") ? image : `${SITE_URL}${image}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };

  const url = `${SITE_URL}/portfolio/${project.slug}`;
  const image = absoluteImage(project.image);

  return {
    title: project.title,
    description: project.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: project.title,
      description: project.excerpt,
      url,
      type: "website",
      siteName: SITE_NAME,
      ...(image ? { images: [{ url: image, alt: project.title }] } : {}),
      ...(project.tags.length ? { tags: project.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.excerpt,
      ...(image ? { images: [image] } : {}),
    },
    keywords: project.tags,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const url = `${SITE_URL}/portfolio/${project.slug}`;
  const image = absoluteImage(project.image);
  const author = {
    "@type": "Person" as const,
    name: SITE_NAME,
    url: SITE_URL,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.excerpt,
    ...(image ? { image: [image] } : {}),
    datePublished: project.date,
    dateModified: project.date,
    inLanguage: "id",
    ...(project.tags.length ? { keywords: project.tags.join(", ") } : {}),
    author,
    publisher: author,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Portofolio",
        item: `${SITE_URL}/portfolio`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProjectDetailView project={project} />
    </>
  );
}
```

- [ ] **Step 2: Buat `src/components/pages/ProjectDetailView.tsx`**

Pola `BlogPostView.tsx`, konten MDX dirender dengan `PostContent` yang sudah ada:

```tsx
"use client";

import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { PostContent } from "@/components/PostContent";
import { useI18n, formatDate } from "@/lib/i18n";
import type { Project } from "@/lib/projects";
import { Calendar, Clock, ArrowLeft, Tag, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

export function ProjectDetailView({ project }: { project: Project }) {
  const { lang, t } = useI18n();

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-highlight transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("portfolio.back")}
        </Link>

        {project.image && (
          <div className="relative h-56 sm:h-72 w-full overflow-hidden rounded-xl border border-border mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <header>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            {project.title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(project.date, lang)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {project.readingTime} {t("blog.readingTime")}
            </span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-accent/20 text-highlight border border-accent/30"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-highlight/80 transition-all duration-200 glow-hover"
              >
                <ExternalLink className="h-4 w-4" />
                {t("portfolio.demo")}
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-surface hover:border-accent transition-all duration-200"
              >
                <FaGithub className="h-4 w-4" />
                {t("portfolio.code")}
              </a>
            )}
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-10">
          <PostContent content={project.content} />
        </div>
      </FadeIn>
    </article>
  );
}
```

- [ ] **Step 3: Tambah key i18n** ke `src/lib/i18n.tsx` — blok `id` dan `en`

Blok `id` (tambahkan setelah `"portfolio.code"`):
```
    "portfolio.back": "Kembali ke Portofolio",
```
Blok `en` (tambahkan setelah `"portfolio.code"`):
```
    "portfolio.back": "Back to Portfolio",
```

- [ ] **Step 4: Tambahkan proyek ke sitemap** — `src/app/sitemap.ts`

Tambahkan import:
```ts
import { getAllProjects } from "@/lib/projects";
```
Tambahkan blok berikut setelah blok `posts`:
```ts
  const projects: MetadataRoute.Sitemap = (await getAllProjects()).map(
    (project) => ({
      url: `${SITE_URL}/portfolio/${project.slug}`,
      lastModified: new Date(project.date),
      changeFrequency: "yearly",
      priority: 0.7,
    })
  );
```
Ubah `return [...staticPages, ...posts];` menjadi `return [...staticPages, ...posts, ...projects];`

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npm run lint` — Expected: exit 0.
Run: `npm run build` — Expected: exit 0 (halaman dinamis baru).

- [ ] **Step 6: Commit**

```bash
git add src/app/portfolio/[slug]/page.tsx src/components/pages/ProjectDetailView.tsx src/app/sitemap.ts src/lib/i18n.tsx
git commit -m "Tambah halaman detail case study per proyek"
```

---

### Task 4: GitHub Stats Widget

**Files:**
- Create: `src/app/api/github/route.ts`
- Create: `src/components/GitHubStats.tsx`
- Modify: `src/components/pages/HomeContent.tsx`
- Modify: `src/lib/i18n.tsx`

**Interfaces:**
- Consumes: GitHub REST API (public, tanpa token), `FadeIn`/`Stagger`.
- Produces: `GET /api/github` → `{ stats: GitHubStats | null }`; `GitHubStats` (client component, tanpa props).

- [ ] **Step 1: Buat `src/app/api/github/route.ts`** — fetch user + repos, cache in-memory TTL 10 menit

```ts
import { NextResponse } from "next/server";

const USERNAME = "dreverrse";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface GitHubStats {
  followers: number;
  publicRepos: number;
  totalStars: number;
  topLanguages: string[];
}

let cache: { stats: GitHubStats; fetchedAt: number } | null = null;

async function fetchStats(): Promise<GitHubStats | null> {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, { cache: "no-store" }),
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, {
        cache: "no-store",
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

export async function GET() {
  const now = Date.now();
  if (!cache || now - cache.fetchedAt > CACHE_TTL_MS) {
    const stats = await fetchStats();
    if (!stats) return NextResponse.json({ stats: null });
    cache = { stats, fetchedAt: now };
  }
  return NextResponse.json({ stats: cache.stats });
}
```

- [ ] **Step 2: Buat `src/components/GitHubStats.tsx`** — client component, pola MusicWidget

```tsx
"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { useI18n } from "@/lib/i18n";
import { FaGithub } from "react-icons/fa6";
import { Star, Users, FolderGit2, Code2 } from "lucide-react";

interface GitHubStatsData {
  followers: number;
  publicRepos: number;
  totalStars: number;
  topLanguages: string[];
}

export function GitHubStats() {
  const { t } = useI18n();
  const [stats, setStats] = useState<GitHubStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card/50 animate-pulse">
        <div className="h-4 w-40 rounded bg-surface mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    { icon: FolderGit2, label: t("github.repos"), value: String(stats.publicRepos) },
    { icon: Star, label: t("github.stars"), value: String(stats.totalStars) },
    { icon: Users, label: t("github.followers"), value: String(stats.followers) },
    { icon: Code2, label: t("github.languages"), value: stats.topLanguages.length ? stats.topLanguages.join(", ") : "-" },
  ];

  return (
    <FadeIn>
      <section>
        <h2 className="text-2xl font-bold mb-8">
          <span className="text-foreground">{t("github.title")}</span>
        </h2>
        <div className="p-6 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-2 text-sm text-muted mb-6">
            <FaGithub className="h-5 w-5 text-highlight" />
            <span className="font-medium">github.com/dreverrse</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 rounded-xl bg-surface/40 border border-border/60">
                  <Icon className="h-5 w-5 text-highlight mb-2" />
                  <p className="text-2xl font-bold text-foreground truncate">{item.value}</p>
                  <p className="text-xs text-muted mt-1">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
```

- [ ] **Step 3: Tambahkan `GitHubStats` ke `HomeContent.tsx`** di bawah section skills

Tambahkan import:
```tsx
import { GitHubStats } from "@/components/GitHubStats";
```
Tambahkan blok ini di antara section skills (yang berakhir `</section>` di `</FadeIn>`) dan section collab (`<FadeIn delay={0.4}>`):

```tsx
      <div className="mt-24">
        <GitHubStats />
      </div>
```

- [ ] **Step 4: Tambah key i18n** ke `src/lib/i18n.tsx` — blok `id` dan `en`

Blok `id` (tambahkan setelah `"blog.description"`):
```
    "github.title": "GitHub Stats",
    "github.repos": "Repositori",
    "github.stars": "Total Stars",
    "github.followers": "Followers",
    "github.languages": "Bahasa",
```
Blok `en` (tambahkan setelah `"blog.description"`):
```
    "github.title": "GitHub Stats",
    "github.repos": "Repositories",
    "github.stars": "Total Stars",
    "github.followers": "Followers",
    "github.languages": "Languages",
```

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npm run lint` — Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/github/route.ts src/components/GitHubStats.tsx src/components/pages/HomeContent.tsx src/lib/i18n.tsx
git commit -m "Tambah widget statistik GitHub"
```

---

### Task 5: Foto Profil Placeholder (Hero Home + About)

**Files:**
- Create: `public/avatars/profile-placeholder.png`
- Modify: `src/components/pages/HomeContent.tsx`
- Modify: `src/components/pages/AboutContent.tsx`

**Interfaces:**
- Consumes: file PNG statis di `public/avatars/` (dilayani Next dari `/avatars/profile-placeholder.png`).
- Produces: foto placeholder di hero home (lingkaran) dan header about (lingkaran).

- [ ] **Step 1: Generate `public/avatars/profile-placeholder.png`**

Salin script ini ke `/tmp/gen-profile.js`, jalankan, lalu verifikasi hasilnya adalah PNG valid:

```bash
mkdir -p /public/portfolio/public/avatars
cat > /tmp/gen-profile.js << 'EOF'
const zlib = require("zlib");
const fs = require("fs");

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

const W = 400, H = 400;
const raw = Buffer.alloc(H * (W * 4 + 1));
for (let y = 0; y < H; y++) {
  const rowStart = y * (W * 4 + 1);
  raw[rowStart] = 0;
  for (let x = 0; x < W; x++) {
    const o = rowStart + 1 + x * 4;
    const dx = x - W / 2, dy = y - H / 2;
    const d = Math.sqrt(dx * dx + dy * dy) / (W / 2);
    const c = Math.round(30 + 90 * (1 - Math.min(1, d)));
    raw[o] = c; raw[o + 1] = Math.round(c * 0.6); raw[o + 2] = Math.round(c * 1.2); raw[o + 3] = 255;
  }
}
for (let y = 0; y < H; y++) {
  const rowStart = y * (W * 4 + 1);
  for (let x = 0; x < W; x++) {
    const o = rowStart + 1 + x * 4;
    const cx = x - W / 2, cy = y - H / 2;
    const head = Math.hypot(cx, cy + H * 0.06) < H * 0.17;
    const sdx = cx / (W * 0.28), sdy = (cy - H * 0.18) / (H * 0.38);
    const shoulders = sdy < 1 && sdy > -1 && sdx * sdx + sdy * sdy < 1;
    if (head || shoulders) {
      raw[o] = 20; raw[o + 1] = 20; raw[o + 2] = 26; raw[o + 3] = 255;
    }
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);
fs.writeFileSync("/public/portfolio/public/avatars/profile-placeholder.png", png);
console.log("ok", png.length);
EOF
node /tmp/gen-profile.js
file /public/portfolio/public/avatars/profile-placeholder.png
```

Expected: `PNG image data, 400 x 400, 8-bit/color RGBA`.

- [ ] **Step 2: Tambah foto ke hero `HomeContent.tsx`**

Ubah blok hero (di dalam `<FadeIn>` pertama, setelah div pembuka `<div className="relative">`) menjadi dua kolom (teks + foto). Ganti bagian ini:

```tsx
        <FadeIn>
          <div className="relative">
            <p className="text-sm font-medium text-highlight mb-4 tracking-wider uppercase">
              {t("home.welcome")}
            </p>
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="text-foreground">{t("home.hello")}</span>
              <br />
              <span className="text-foreground">Andre Kusuma Firmansah</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted leading-relaxed">
              {t("home.tagline")}
            </p>
          </div>
        </FadeIn>
```

menjadi:

```tsx
        <FadeIn>
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-medium text-highlight mb-4 tracking-wider uppercase">
                {t("home.welcome")}
              </p>
              <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-foreground">{t("home.hello")}</span>
                <br />
                <span className="text-foreground">Andre Kusuma Firmansah</span>
              </h1>
              <p className="mt-6 max-w-xl text-base sm:text-lg text-muted leading-relaxed">
                {t("home.tagline")}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatars/profile-placeholder.png"
                alt={t("home.profileAlt")}
                className="h-40 w-40 sm:h-52 sm:w-52 lg:h-64 lg:w-64 rounded-full object-cover border-2 border-accent/30 shadow-lg glow-hover"
              />
            </div>
          </div>
        </FadeIn>
```

- [ ] **Step 3: Tambah foto ke header `AboutContent.tsx`**

Di dalam `<FadeIn>` pertama (yang berisi `<h1>` dan `<p>`), ubah menjadi flex dengan foto di tengah:

```tsx
      <FadeIn>
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatars/profile-placeholder.png"
            alt={t("home.profileAlt")}
            className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-accent/30 shadow-lg mb-6"
          />
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("about.title")}
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            {t("about.intro")}
          </p>
        </div>
      </FadeIn>
```

- [ ] **Step 4: Tambah key i18n** ke `src/lib/i18n.tsx` — blok `id` dan `en`

Blok `id` (tambahkan setelah `"home.contact"`):
```
    "home.profileAlt": "Foto profil Andre",
```
Blok `en` (tambahkan setelah `"home.contact"`):
```
    "home.profileAlt": "Andre's profile photo",
```

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npm run lint` — Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add public/avatars/profile-placeholder.png src/components/pages/HomeContent.tsx src/components/pages/AboutContent.tsx src/lib/i18n.tsx
git commit -m "Tambah foto profil placeholder di hero dan about"
```

---

### Task 6: Pencarian + Filter Blog (Client-Side)

**Files:**
- Modify: `src/components/pages/BlogList.tsx`
- Modify: `src/lib/i18n.tsx`

**Interfaces:**
- Consumes: `Post` (sudah ada), `useI18n`, `FadeIn`/`Stagger` (sudah ada).
- Produces: input search + tag chips yang memfilter grid blog (featured + rest) secara live.

- [ ] **Step 1: Ubah `BlogList.tsx`** — tambah state search, tag filter, dan UI-nya

Ganti baris import lucide:
```tsx
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
```
menjadi:
```tsx
import { ArrowRight, Calendar, Clock, Search, Tag } from "lucide-react";
```

Ganti blok `const [featured, ...rest] = posts;` (baris 58) menjadi blok filter lengkap:

```tsx
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags))
  ).sort();

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = posts.filter((post) => {
    const { title, excerpt } = localized(post, translations, lang);
    const haystack = `${title} ${excerpt} ${post.tags.join(" ")}`.toLowerCase();
    const q = query.trim().toLowerCase();
    const matchesQuery = q === "" || haystack.includes(q);
    const matchesTag = activeTag === null || post.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  });

  const [featured, ...rest] = filtered;
```

Tambahkan UI search + tags setelah blok `<FadeIn>` pertama (yang berisi judul & deskripsi, berakhir di `</FadeIn>` sebelum `{posts.length === 0 &&`), sebelum kondisi `posts.length === 0`:

```tsx
      {posts.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("blog.searchPlaceholder")}
                className="w-full rounded-xl border border-border bg-card/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    activeTag === null
                      ? "bg-accent text-white border-accent"
                      : "bg-card/50 border-border text-muted hover:text-highlight hover:border-accent"
                  }`}
                >
                  {t("blog.allTags")}
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      activeTag === tag
                        ? "bg-accent text-white border-accent"
                        : "bg-card/50 border-border text-muted hover:text-highlight hover:border-accent"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {posts.length > 0 && filtered.length === 0 && (
        <FadeIn delay={0.15}>
          <div className="text-center py-16 rounded-xl border border-border bg-card/30">
            <p className="text-muted text-lg">{t("blog.searchEmpty")}</p>
          </div>
        </FadeIn>
      )}
```

- [ ] **Step 2: Tambah key i18n** ke `src/lib/i18n.tsx` — blok `id` dan `en`

Blok `id` (tambahkan setelah `"blog.emptySub"`):
```
    "blog.searchPlaceholder": "Cari artikel…",
    "blog.searchEmpty": "Tidak ada artikel yang cocok dengan pencarian.",
    "blog.allTags": "Semua",
```
Blok `en` (tambahkan setelah `"blog.emptySub"`):
```
    "blog.searchPlaceholder": "Search articles…",
    "blog.searchEmpty": "No articles match your search.",
    "blog.allTags": "All",
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npm run lint` — Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/BlogList.tsx src/lib/i18n.tsx
git commit -m "Tambah pencarian dan filter tag di halaman blog"
```

---

## Final Verification (setelah Task 6)

- [ ] Run `npx tsc --noEmit` — exit 0
- [ ] Run `npm run lint` — exit 0
- [ ] Run `npm run build` — exit 0, semua halaman ter-generate
- [ ] Cek `/portfolio` menampilkan grid Finora dari MDX
- [ ] Cek `/portfolio/finora` menampilkan halaman detail
- [ ] Cek `/api/github` mengembalikan `{ stats: {...} }`
- [ ] Cek hero home & about menampilkan foto placeholder
- [ ] Cek search blog & tag filter bekerja (cek manual di browser)
- [ ] Review akhir seluruh branch (mengikuti subagent-driven-development)
