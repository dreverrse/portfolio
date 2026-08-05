import type { Metadata } from "next";
import { PortfolioContent } from "@/components/pages/PortfolioContent";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Proyek-proyek yang pernah saya kerjakan.",
};

export default function PortfolioPage() {
  return <PortfolioContent />;
}
