import type { Metadata } from "next";
import { BlogList } from "@/components/pages/BlogList";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { escapeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tulisan, tutorial, dan pemikiran seputar teknologi.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: "Tulisan, tutorial, dan pemikiran seputar teknologi.",
    url: `${SITE_URL}/blog`,
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${SITE_NAME}`,
    description: "Tulisan, tutorial, dan pemikiran seputar teknologi.",
  },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: `Blog | ${SITE_NAME}`,
              description: "Tulisan, tutorial, dan pemikiran seputar teknologi.",
              url: `${SITE_URL}/blog`,
              isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
              },
              about: SITE_DESCRIPTION,
              hasPart: posts.map((post) => ({
                "@type": "BlogPosting",
                headline: post.title,
                url: `${SITE_URL}/blog/${post.slug}`,
                datePublished: post.date,
                ...(post.image
                  ? { image: `${SITE_URL}${post.image}` }
                  : {}),
              })),
            })
          ),
        }}
      />
      <BlogList posts={posts} />
    </>
  );
}
