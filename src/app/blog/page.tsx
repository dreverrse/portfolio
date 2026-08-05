import type { Metadata } from "next";
import { BlogList } from "@/components/pages/BlogList";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tulisan, tutorial, dan pemikiran seputar teknologi.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return <BlogList posts={posts} />;
}
