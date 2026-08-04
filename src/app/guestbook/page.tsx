import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import { Guestbook } from "@/components/Guestbook";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Tinggalkan pesan dan kesan untuk website ini.",
};

export default function GuestbookPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="text-foreground">Guestbook</span>
        </h1>
        <p className="text-muted text-lg leading-relaxed">
          Tinggalkan jejakmu di sini — sapa, kasih kesan, atau sekadar bilang
          halo. Semua pesan tersimpan di buku tamu ini.
        </p>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="mt-12">
          <Guestbook />
        </div>
      </FadeIn>
    </div>
  );
}
