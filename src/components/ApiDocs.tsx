"use client";

import { useState } from "react";
import { Code2, Play, Loader2, Check, Copy } from "lucide-react";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  example: unknown;
  dynamicSlug?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/posts",
    description: "Daftar semua artikel blog (ringkas).",
    example: {
      ok: true,
      data: [
        {
          slug: "deploy-vercel",
          title: "Contoh Judul",
          excerpt: "Ringkasan artikel",
          tags: ["nextjs", "tutorial"],
          date: "2026-01-01",
          readingTime: 4,
        },
      ],
    },
  },
  {
    method: "GET",
    path: "/api/v1/posts/{slug}",
    description: "Satu artikel lengkap berdasarkan slug. 404 jika tidak ada.",
    dynamicSlug: "deploy-vercel",
    example: {
      ok: true,
      data: {
        slug: "deploy-vercel",
        title: "Contoh Judul",
        excerpt: "Ringkasan",
        tags: ["nextjs"],
        date: "2026-01-01",
        readingTime: 4,
        content: "# Isi markdown\n\nParagraf...",
      },
    },
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    description: "Ringkasan statistik publik (jumlah post, reaksi, komentar, GitHub).",
    example: {
      ok: true,
      data: {
        posts: 10,
        reactions: 42,
        comments: 7,
        github: { followers: 5, publicRepos: 20, totalStars: 12, topLanguages: ["TypeScript"] },
      },
    },
  },
  {
    method: "GET",
    path: "/api/v1/site/status",
    description: "Status kesehatan integrasi eksternal.",
    example: {
      ok: true,
      data: {
        integrations: [
          { name: "GitHub", status: "up", latencyMs: 120 },
        ],
      },
    },
  },
];

const methodColor: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-500",
};

export function ApiDocs() {
  const [results, setResults] = useState<Record<number, unknown>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<number | null>(null);

  async function tryEndpoint(index: number, endpoint: Endpoint) {
    setLoadingId(index);
    setErrors((prev) => ({ ...prev, [index]: "" }));
    const url = endpoint.dynamicSlug
      ? endpoint.path.replace("{slug}", endpoint.dynamicSlug)
      : endpoint.path;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      setResults((prev) => ({ ...prev, [index]: data }));
    } catch {
      setErrors((prev) => ({ ...prev, [index]: "Gagal terhubung ke endpoint." }));
    } finally {
      setLoadingId(null);
    }
  }

  async function copyExample(index: number, endpoint: Endpoint) {
    await navigator.clipboard.writeText(JSON.stringify(endpoint.example, null, 2));
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-10 flex items-center gap-3">
        <Code2 className="h-8 w-8 text-highlight" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">API Docs</h1>
          <p className="mt-1 text-muted">
            Public API read-only untuk konten situs ini. Tidak memerlukan API key.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {ENDPOINTS.map((endpoint, index) => (
          <div
            key={endpoint.path}
            className="overflow-hidden rounded-2xl border border-border bg-card/50"
          >
            <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
              <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${methodColor[endpoint.method]}`}>
                {endpoint.method}
              </span>
              <code className="font-mono text-sm">{endpoint.path}</code>
              <span className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => tryEndpoint(index, endpoint)}
                  disabled={loadingId === index}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loadingId === index ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Coba
                </button>
                <button
                  onClick={() => copyExample(index, endpoint)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  {copied === index ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Salin
                </button>
              </span>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-muted">{endpoint.description}</p>

              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-highlight">
                  Lihat contoh respons
                </summary>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs whitespace-pre">
                  {JSON.stringify(endpoint.example, null, 2)}
                </pre>
              </details>

              {results[index] ? (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted">Hasil:</p>
                  <pre className="overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs whitespace-pre">
                    {JSON.stringify(results[index], null, 2)}
                  </pre>
                </div>
              ) : null}
              {errors[index] && (
                <p className="text-sm text-red-500">{errors[index]}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
