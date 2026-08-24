import type { Metadata } from "next";
import { getPublicApis } from "@/lib/public-apis";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { escapeJsonLd } from "@/lib/utils";
import { PiArrowSquareOutBold as ExternalLink, PiGlobeBold as Globe, PiLockKeyBold as Lock, PiShieldCheckBold as Shield } from "react-icons/pi";

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

export default function ApisPage() {
  const { apis } = getPublicApis();

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
              description: "Kumpulan API gratis dari komunitas.",
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-highlight">
            APIs
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Direktori Public APIs
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
            Kumpulan API gratis dari komunitas — Animals, Anime, Crypto, Weather, dan banyak lagi.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apis.map((api) => (
            <div
              key={`${api.category}-${api.name}`}
              className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-highlight transition-colors truncate">
                    {api.name}
                  </h3>
                  <span className="text-xs text-highlight/70 font-medium">
                    {api.category}
                  </span>
                </div>
                {api.url && (
                  <a
                    href={api.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-lg text-muted hover:text-highlight hover:bg-surface transition-all"
                    aria-label={api.name}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm text-muted line-clamp-2 leading-relaxed">
                {api.description}
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                {api.auth === "No" ? (
                  <span className="inline-flex items-center gap-1 text-green-500">
                    <Shield className="h-3 w-3" />
                    Gratis
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <Lock className="h-3 w-3" />
                    Perlu API Key
                  </span>
                )}
                {api.https === "Yes" && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    HTTPS
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
