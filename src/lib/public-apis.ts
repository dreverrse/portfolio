const README_URL =
  "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md";

export interface PublicApi {
  category: string;
  name: string;
  description: string;
  url: string;
  auth: string;
  https: string;
  cors: string;
}

function extractUrl(cell: string): { name: string; url: string } {
  const linkMatch = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (linkMatch) {
    return { name: linkMatch[1].trim(), url: linkMatch[2].trim() };
  }
  return { name: cell.trim(), url: "" };
}

function parseAuth(cell: string): string {
  return cell.replace(/`/g, "").trim();
}

function parseReadme(text: string): PublicApi[] {
  const lines = text.split("\n");
  const apis: PublicApi[] = [];
  let currentCategory = "";

  for (const line of lines) {
    const categoryMatch = line.match(/^### (.+)$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      continue;
    }

    if (
      !currentCategory ||
      !line.startsWith("|") ||
      line.includes(":---")
    ) {
      continue;
    }

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

    if (cells.length < 5) continue;

    const firstCell = cells[0];
    if (firstCell === "API" || firstCell === "") continue;

    const { name, url } = extractUrl(firstCell);
    if (!name) continue;

    apis.push({
      category: currentCategory,
      name,
      description: cells[1] || "",
      url,
      auth: parseAuth(cells[2]),
      https: cells[3] || "",
      cors: cells[4] || "",
    });
  }

  return apis;
}

export async function getPublicApis(): Promise<{
  apis: PublicApi[];
  categories: string[];
}> {
  try {
    const res = await fetch(README_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { apis: [], categories: [] };

    const text = await res.text();
    const apis = parseReadme(text);
    const categories = [...new Set(apis.map((a) => a.category))].sort();

    return { apis, categories };
  } catch {
    return { apis: [], categories: [] };
  }
}
