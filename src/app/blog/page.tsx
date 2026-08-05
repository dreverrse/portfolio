import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { getAllPosts } from "@/lib/blog";
import { Calendar, Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tulisan, tutorial, dan pemikiran seputar teknologi.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="text-foreground">Blog</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl leading-relaxed">
          Tulisan seputar teknologi, programming, dan pengalaman pribadi.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-12 space-y-4">
          {posts.length === 0 && (
            <div className="text-center py-16 rounded-xl border border-border bg-card/30">
              <p className="text-muted text-lg">Belum ada artikel.</p>
              <p className="text-sm text-muted/60 mt-2">
                Buat artikel baru di folder{" "}
                <code className="px-1.5 py-0.5 rounded bg-surface text-highlight text-xs">
                  content/blog/
                </code>
              </p>
            </div>
          )}
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-semibold text-lg text-foreground group-hover:text-highlight transition-colors">
                  {post.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted mt-2 line-clamp-2">
                {post.excerpt}
              </p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-accent/20 text-highlight border border-accent/30"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
