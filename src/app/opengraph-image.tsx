import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — Desainer & Developer`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#fafafa",
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
              background: "#fafafa",
            }}
          />
          Portfolio — {SITE_NAME}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 28, color: "#a1a1a1", lineHeight: 1.4 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div style={{ fontSize: 22, color: "#737373" }}>
          dreverrse.my.id · Desainer &amp; Developer
        </div>
      </div>
    ),
    { ...size }
  );
}
