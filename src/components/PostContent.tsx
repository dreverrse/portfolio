import type { ReactNode } from "react";

const INLINE_REGEX =
  /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyBase}-${i}`;

    if (token.startsWith("**")) {
      parts.push(
        <strong key={key} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-surface text-highlight text-sm"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const link = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (link) {
        parts.push(
          <a
            key={key}
            href={link[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-highlight hover:underline"
          >
            {link[1]}
          </a>
        );
      }
    } else if (token.startsWith("*")) {
      parts.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    i++;
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function restoreBlocks(text: string): string {
  let out = text.replace(/\\r/g, "").replace(/\\n/g, "\n");
  out = out.replace(/\s+(#{1,6}\s)/g, "\n$1");
  out = out.replace(/\s+([-*]\s+(?:\*\*)?[A-Z*])/g, "\n$1");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

export function PostContent({ content }: { content: string }) {
  const lines = restoreBlocks(content).split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (/^-{3,}$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="my-8 border-border" />);
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const Tag = (["h1", "h2", "h3"] as const)[level - 1];
      const className =
        level === 1
          ? "text-2xl sm:text-3xl font-bold mt-8 mb-4"
          : level === 2
            ? "text-xl sm:text-2xl font-bold mt-8 mb-4"
            : "text-lg font-semibold mt-6 mb-3";
      blocks.push(
        <Tag key={key++} className={className}>
          {renderInline(text, `h${key}`)}
        </Tag>
      );
      i++;
      continue;
    }

    if (line.trimStart().startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        quote.push(lines[i].trimStart().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-4 border-accent bg-surface/40 rounded-r-lg px-4 py-3 my-4 text-muted italic"
        >
          {renderInline(quote.join(" "), `q${key}`)}
        </blockquote>
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(
          <li key={items.length}>
            {renderInline(lines[i].replace(/^\s*[-*]\s+/, ""), `li${key}`)}
          </li>
        );
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-6 my-4 space-y-2">
          {items}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(
          <li key={items.length}>
            {renderInline(lines[i].replace(/^\s*\d+[.)]\s+/, ""), `ol${key}`)}
          </li>
        );
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-6 my-4 space-y-2">
          {items}
        </ol>
      );
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      paragraph.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="my-4 text-base leading-relaxed">
        {renderInline(paragraph.join(" "), `p${key}`)}
      </p>
    );
  }

  return (
    <div className="text-foreground/90 space-y-1">{blocks}</div>
  );
}
