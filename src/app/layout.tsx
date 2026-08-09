import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClientProvider } from "@/components/ClientProvider";
import { LanguageProvider } from "@/lib/i18n";
import { WaifuWidget } from "@/components/WaifuWidget";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { escapeJsonLd } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Andre Kusuma Firmansah",
    template: "%s | Andre Kusuma Firmansah",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var l=t==="light";document.documentElement.classList.toggle("light",l);var lg=localStorage.getItem("lang");if(lg==="en"||lg==="id"){document.documentElement.lang=lg;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col noise-bg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: escapeJsonLd(
              JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
                description: SITE_DESCRIPTION,
              })
            ),
          }}
        />
        <LanguageProvider>
          <ClientProvider>
            <Navbar />
            <ScrollProgress />
            <main className="flex-1 pt-24 relative z-10">{children}</main>
            <Footer />
            <BackToTop />
            <WaifuWidget />
          </ClientProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
