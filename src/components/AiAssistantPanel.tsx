"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, Loader2, Check, FileText } from "lucide-react";
import { PostContent } from "@/components/PostContent";

type AiAction = "draft" | "excerptTags" | "rewrite" | "translate";

const ACTIONS: { id: AiAction; label: string; hint: string }[] = [
  { id: "draft", label: "Generate Draft", hint: "Topik → draft artikel lengkap" },
  { id: "excerptTags", label: "Excerpt + Tags", hint: "Konten → ringkasan + tag" },
  { id: "rewrite", label: "Rewrite", hint: "Konten → perbaikan sesuai instruksi" },
  { id: "translate", label: "Translate", hint: "Slug → terjemahan Inggris penuh" },
];

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-foreground";

interface DraftShape {
  title?: string;
  excerpt?: string;
  content?: string;
}

export function AiAssistantPanel({
  onUseDraft,
}: {
  onUseDraft: (draft: { title: string; excerpt: string; content: string }) => void;
}) {
  const [action, setAction] = useState<AiAction>("draft");
  const [input, setInput] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [instruction, setInstruction] = useState("");

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body: Record<string, unknown> = { action };
      if (action === "draft") body.topic = input;
      if (action === "excerptTags" || action === "rewrite") body.content = input;
      if (action === "rewrite") body.instruction = instruction;
      if (action === "translate") body.slug = slug;

      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Gagal memproses");
      }
      setResult((data as { result: unknown }).result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const draft = (result ?? null) as DraftShape | null;
  const isDraft =
    action === "draft" &&
    draft !== null &&
    typeof draft.title === "string" &&
    typeof draft.content === "string";

  function applyDraft() {
    if (!isDraft || !draft || !draft.title || !draft.content) return;
    onUseDraft({
      title: draft.title,
      excerpt: draft.excerpt || "",
      content: draft.content,
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-highlight" />
          <h2 className="text-lg font-semibold">AI Content Assistant</h2>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Action</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAction(a.id)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  action === a.id
                    ? "border-accent bg-accent/10"
                    : "border-border text-muted hover:border-accent"
                }`}
              >
                <span className="font-medium text-foreground block">{a.label}</span>
                <span className="text-xs">{a.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {action === "draft" && (
          <div>
            <label htmlFor="ai-topic" className="mb-1.5 block text-sm font-medium text-muted">Topik</label>
            <textarea
              id="ai-topic"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`${inputClass} resize-y`}
              rows={3}
              placeholder="Contoh: Cara deploy aplikasi Next.js ke Vercel"
              required
            />
          </div>
        )}

        {action === "excerptTags" && (
          <div>
            <label htmlFor="ai-content" className="mb-1.5 block text-sm font-medium text-muted">Konten artikel</label>
            <textarea
              id="ai-content"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`${inputClass} resize-y`}
              rows={8}
              placeholder="Tempel isi artikel di sini..."
              required
            />
          </div>
        )}

        {action === "rewrite" && (
          <>
            <div>
              <label htmlFor="ai-content" className="mb-1.5 block text-sm font-medium text-muted">Konten artikel</label>
              <textarea
                id="ai-content"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`${inputClass} resize-y`}
                rows={8}
                required
              />
            </div>
            <div>
              <label htmlFor="ai-instruction" className="mb-1.5 block text-sm font-medium text-muted">Instruksi (opsional)</label>
              <input
                id="ai-instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className={inputClass}
                placeholder="Contoh: jadikan lebih ringkas dan mudah dipahami"
              />
            </div>
          </>
        )}

        {action === "translate" && (
          <div>
            <label htmlFor="ai-slug" className="mb-1.5 block text-sm font-medium text-muted">Slug artikel</label>
            <input
              id="ai-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
              placeholder="contoh: deploy-vercel"
              required
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Memproses..." : "Generate"}
        </button>
      </form>

      {result !== null && (
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          {isDraft ? (
            <>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{draft.title}</h3>
                  <p className="mt-1 text-sm text-muted">{draft.excerpt}</p>
                </div>
                <button onClick={applyDraft} className={btnGhost}>
                  <Check className="h-4 w-4" />
                  Pakai di Editor
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-border bg-background p-6">
                <PostContent content={draft.content || ""} />
              </div>
            </>
          ) : (
            <pre className="whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}

      {action === "translate" && (
        <p className="text-xs text-muted flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          Hasil terjemahan disimpan di cache translate dan dipakai halaman blog berbahasa Inggris.
        </p>
      )}
    </div>
  );
}
