import type { Metadata } from "next";
import { PortfolioContent } from "@/components/pages/PortfolioContent";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Proyek-proyek yang pernah saya kerjakan.",
};

export default async function PortfolioPage() {
  const projects = await getAllProjects();
  return <PortfolioContent projects={projects} />;
}
