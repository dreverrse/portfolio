import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Proyek-proyek yang pernah saya kerjakan.",
};

const projects = [
  {
    title: "Finora",
    desc: "Aplikasi web pengelola keuangan untuk memantau pemasukan, pengeluaran, dan anggaran dalam satu dashboard yang rapi dan mudah digunakan.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    demo: "https://finora-dreverrse.vercel.app/",
    github: "https://github.com/dreverrse/finora",
    image: null,
  },
];

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="text-foreground">Portfolio</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl leading-relaxed">
          Kumpulan proyek yang telah saya kerjakan. Setiap proyek merupakan
          pembelajaran baru dan tantangan yang menarik.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <div
              key={i}
              className="group flex flex-col p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-highlight transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  {project.desc}
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
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-highlight transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Demo
                </a>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-highlight transition-colors"
                  >
                    <FaGithub className="h-3.5 w-3.5" />
                    Code
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
