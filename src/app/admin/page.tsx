import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/admin-auth";
import { getStoredPosts } from "@/lib/posts-store";
import { AdminApp } from "@/components/AdminApp";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [authenticated, posts] = await Promise.all([
    isAuthenticated(),
    getStoredPosts(),
  ]);
  return <AdminApp initiallyAuthenticated={authenticated} initialPosts={posts} />;
}
