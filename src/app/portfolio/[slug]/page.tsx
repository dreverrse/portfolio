import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/pages/ProjectDetailView";
import { getProjectBySlug } from "@/lib/projects";
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
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };

  const url = `${SITE_URL}/portfolio/${project.slug}`;
  const image = absoluteImage(project.image);

  return {
    title: project.title,
    description: project.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: project.title,
      description: project.excerpt,
      url,
      type: "website",
      siteName: SITE_NAME,
      ...(image ? { images: [{ url: image, alt: project.title }] } : {}),
      ...(project.tags.length ? { tags: project.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.excerpt,
      ...(image ? { images: [image] } : {}),
    },
    keywords: project.tags,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const url = `${SITE_URL}/portfolio/${project.slug}`;
  const image = absoluteImage(project.image);
  const author = {
    "@type": "Person" as const,
    name: SITE_NAME,
    url: SITE_URL,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.excerpt,
    ...(image ? { image: [image] } : {}),
    datePublished: project.date,
    dateModified: project.date,
    inLanguage: "id",
    ...(project.tags.length ? { keywords: project.tags.join(", ") } : {}),
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
        name: "Portofolio",
        item: `${SITE_URL}/portfolio`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
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
      <ProjectDetailView project={project} />
    </>
  );
}
