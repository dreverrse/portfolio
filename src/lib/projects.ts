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
