import type { Metadata } from "next";
import { ApiDirectory } from "@/components/pages/ApiDirectory";
import { getPublicApis } from "@/lib/public-apis";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { escapeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "APIs",
  description:
    "Kumpulan API gratis dari komunitas — Animals, Anime, Crypto, Weather, dan banyak lagi.",
  alternates: {
    canonical: `${SITE_URL}/apis`,
  },
  openGraph: {
    title: `APIs | ${SITE_NAME}`,
    description:
      "Kumpulan API gratis dari komunitas — Animals, Anime, Crypto, Weather, dan banyak lagi.",
    url: `${SITE_URL}/apis`,
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `APIs | ${SITE_NAME}`,
    description:
      "Kumpulan API gratis dari komunitas — Animals, Anime, Crypto, Weather, dan banyak lagi.",
  },
};

export const dynamic = "force-dynamic";

export default async function ApisPage() {
  const { apis, categories } = await getPublicApis();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: `APIs | ${SITE_NAME}`,
              description:
                "Kumpulan API gratis dari komunitas.",
              url: `${SITE_URL}/apis`,
              isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
              },
            })
          ),
        }}
      />
      <ApiDirectory apis={apis} categories={categories} />
    </>
  );
}
