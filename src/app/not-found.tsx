"use client";

import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { useI18n } from "@/lib/i18n";
import { Home, ArrowRight } from "lucide-react";
import LottiePlayer from "@/components/LottiePlayer";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 sm:py-32">
      <div className="relative flex flex-col items-center text-center">
        <div className="hidden sm:block absolute -top-24 -left-24 h-72 w-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute -bottom-24 -right-24 h-72 w-72 bg-highlight/10 rounded-full blur-3xl pointer-events-none" />

        <FadeIn>
          <div className="relative flex flex-col items-center">
            <div className="animate-float">
              <LottiePlayer
                src="/lottie/lost.json"
                className="h-64 w-64 sm:h-72 sm:w-72"
              />
            </div>

            <h1 className="mt-8 font-mono text-7xl sm:text-9xl font-bold tracking-tighter">
              <span className="bg-gradient-to-br from-foreground via-foreground to-accent bg-clip-text text-transparent">
                404
              </span>
            </h1>

            <p className="mt-4 font-mono text-sm text-accent tracking-widest uppercase">
              {t("notfound.title")}
            </p>

            <p className="mt-6 max-w-md text-base sm:text-lg text-muted leading-relaxed">
              {t("notfound.desc")}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="relative mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-highlight/80 transition-all duration-200 glow-hover"
            >
              <Home className="h-4 w-4" />
              {t("notfound.home")}
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-surface hover:border-accent transition-all duration-200"
            >
              {t("notfound.portfolio")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
