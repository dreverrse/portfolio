import type { Metadata } from "next";
import { AboutContent } from "@/components/pages/AboutContent";

export const metadata: Metadata = {
  title: "About",
  description: "Tentang saya — keahlian, pendidikan, dan pengalaman.",
};

export default function AboutPage() {
  return <AboutContent />;
}
