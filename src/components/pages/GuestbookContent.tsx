"use client";

import { FadeIn } from "@/components/FadeIn";
import { Guestbook } from "@/components/Guestbook";
import { useI18n } from "@/lib/i18n";

export function GuestbookContent() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="text-foreground">{t("nav.guestbook")}</span>
        </h1>
        <p className="text-muted text-lg leading-relaxed">
          {t("guestbook.description")}
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
