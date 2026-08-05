import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/pages/BlogPostView";
import { getPostBySlug } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

function absoluteImage(image?: string): string | undefined {
  if (!image) return undefined;
  return image.startsWith("http") ? image : `${SITE_URL}${image}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = absoluteImage(post.image);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      siteName: SITE_NAME,
      locale: "id_ID",
      publishedTime: post.date,
      ...(image ? { images: [{ url: image, alt: post.title }] } : {}),
      ...(post.tags.length ? { tags: post.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(image ? { images: [image] } : {}),
    },
    keywords: post.tags,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = absoluteImage(post.image);
  const author = {
    "@type": "Person" as const,
    name: SITE_NAME,
    url: SITE_URL,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    ...(image ? { image: [image] } : {}),
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "id",
    ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
    author,
    publisher: author,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <BlogPostView post={post} />
    </>
  );
}
