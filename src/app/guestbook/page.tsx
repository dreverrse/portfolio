import type { Metadata } from "next";
import { GuestbookContent } from "@/components/pages/GuestbookContent";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Tinggalkan pesan dan kesan untuk website ini.",
};

export default function GuestbookPage() {
  return <GuestbookContent />;
}
