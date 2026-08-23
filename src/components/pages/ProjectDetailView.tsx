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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 glow-hover"
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
