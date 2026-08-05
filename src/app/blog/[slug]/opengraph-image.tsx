import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";

export const alt = "Artikel Blog Andre Kusuma Firmansah";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.title || "Artikel tidak ditemukan";
  const excerpt = post?.excerpt || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#0099ff",
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#0099ff",
            }}
          />
          Blog — {SITE_NAME}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15 }}>
            {title.length > 80 ? `${title.slice(0, 80)}…` : title}
          </div>
          {excerpt && (
            <div
              style={{
                fontSize: 26,
                color: "#999999",
                lineHeight: 1.4,
              }}
            >
              {excerpt.length > 140 ? `${excerpt.slice(0, 140)}…` : excerpt}
            </div>
          )}
        </div>

        <div style={{ fontSize: 22, color: "#555555" }}>
          dreverrse.dev · Desainer & Developer
        </div>
      </div>
    ),
    { ...size }
  );
}
