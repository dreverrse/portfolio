"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, Loader2, Check, FileText } from "lucide-react";
import { PostContent } from "@/components/PostContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AiAction = "draft" | "excerptTags" | "rewrite" | "translate";

const ACTIONS: { id: AiAction; label: string; hint: string }[] = [
  { id: "draft", label: "Generate Draft", hint: "Topik → draft artikel lengkap" },
  { id: "excerptTags", label: "Excerpt + Tags", hint: "Konten → ringkasan + tag" },
  { id: "rewrite", label: "Rewrite", hint: "Konten → perbaikan sesuai instruksi" },
  { id: "translate", label: "Translate", hint: "Slug → terjemahan Inggris penuh" },
];

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
      <form onSubmit={handleGenerate} className="space-y-4">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-highlight" />
              AI Content Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Action</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ACTIONS.map((a) => (
                  <Button
                    key={a.id}
                    type="button"
                    onClick={() => setAction(a.id)}
                    variant={action === a.id ? "default" : "outline"}
                    className="h-auto justify-start flex-col items-start px-3 py-2 text-left"
                  >
                    <span className="font-medium block">{a.label}</span>
                    <span className="text-xs text-muted-foreground">{a.hint}</span>
                  </Button>
                ))}
              </div>
            </div>

            {action === "draft" && (
              <div className="space-y-1.5">
                <Label htmlFor="ai-topic">Topik</Label>
                <Textarea
                  id="ai-topic"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="resize-y"
                  rows={3}
                  placeholder="Contoh: Cara deploy aplikasi Next.js ke Vercel"
                  required
                />
              </div>
            )}

            {action === "excerptTags" && (
              <div className="space-y-1.5">
                <Label htmlFor="ai-content">Konten artikel</Label>
                <Textarea
                  id="ai-content"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="resize-y"
                  rows={8}
                  placeholder="Tempel isi artikel di sini..."
                  required
                />
              </div>
            )}

            {action === "rewrite" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="ai-content">Konten artikel</Label>
                  <Textarea
                    id="ai-content"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="resize-y"
                    rows={8}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ai-instruction">Instruksi (opsional)</Label>
                  <Input
                    id="ai-instruction"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Contoh: jadikan lebih ringkas dan mudah dipahami"
                  />
                </div>
              </>
            )}

            {action === "translate" && (
              <div className="space-y-1.5">
                <Label htmlFor="ai-slug">Slug artikel</Label>
                <Input
                  id="ai-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="contoh: deploy-vercel"
                  required
                />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Memproses..." : "Generate"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {result !== null && (
        <Card className="border-border bg-card/50">
          <CardContent className="pt-6">
            {isDraft ? (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{draft.title}</h3>
                    <p className="mt-1 text-sm text-muted">{draft.excerpt}</p>
                  </div>
                  <Button onClick={applyDraft} variant="outline">
                    <Check className="h-4 w-4" />
                    Pakai di Editor
                  </Button>
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
          </CardContent>
        </Card>
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
