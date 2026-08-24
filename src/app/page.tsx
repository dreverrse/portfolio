import { HomeContent } from "@/components/pages/HomeContent";
import { getAllPosts } from "@/lib/blog";

export default async function Home() {
  const posts = await getAllPosts();
  const latestPosts = posts.slice(0, 3).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    readingTime: post.readingTime,
  }));
  return <HomeContent latestPosts={latestPosts} />;
}
