const README_URL =
  "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md";
const OUT = "src/data/public-apis.json";

function extractUrl(cell) {
  const m = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  return m ? { name: m[1].trim(), url: m[2].trim() } : { name: cell.trim(), url: "" };
}

function parseReadme(text) {
  const lines = text.split("\n");
  const apis = [];
  let cat = "";
  for (const line of lines) {
    const cm = line.match(/^### (.+)$/);
    if (cm) { cat = cm[1].trim(); continue; }
    if (!cat || !line.startsWith("|") || line.includes(":---")) continue;
    const c = line.split("|").slice(1, -1).map((s) => s.trim());
    if (c.length < 5 || c[0] === "API" || c[0] === "") continue;
    const { name, url } = extractUrl(c[0]);
    if (!name) continue;
    apis.push({ category: cat, name, description: c[1], url, auth: c[2].replace(/`/g, ""), https: c[3], cors: c[4] });
  }
  return apis;
}

const res = await fetch(README_URL);
if (!res.ok) { console.error("Gagal fetch README:", res.status); process.exit(1); }
const text = await res.text();
const apis = parseReadme(text);

const fs = await import("fs");
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(apis));
console.log(`✓ ${apis.length} APIs → ${OUT}`);
