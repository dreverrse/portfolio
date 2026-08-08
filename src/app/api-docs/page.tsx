import type { Metadata } from "next";
import { ApiDocs } from "@/components/ApiDocs";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Dokumentasi publik API situs ini.",
};

export default function ApiDocsPage() {
  return <ApiDocs />;
}
