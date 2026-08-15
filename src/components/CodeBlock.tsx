import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-go";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import { Card } from "@/components/ui/card";

const ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  py3: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  html: "markup",
  xml: "markup",
  json5: "json",
  dockerfile: "bash",
};

function normalizeLanguage(lang: string): string {
  const key = lang.trim().toLowerCase();
  return ALIASES[key] || key;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const lang = normalizeLanguage(language);
  const grammar = Prism.languages[lang] || Prism.languages.plaintext;

  let html: string;
  if (grammar) {
    html = Prism.highlight(code, grammar, lang);
  } else {
    html = escapeHtml(code);
  }

  return (
    <Card className="codeblock my-4 overflow-hidden border-border bg-surface/60">
      {lang && (
        <div className="border-b border-border bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wide text-highlight">
          {lang}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </Card>
  );
}
