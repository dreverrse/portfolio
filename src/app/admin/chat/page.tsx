import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";
import { AiChat } from "@/components/AiChat";

export const metadata: Metadata = {
  title: "AI Chat",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/admin");
  }
  return <AiChat />;
}
