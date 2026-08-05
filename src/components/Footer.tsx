"use client";

import { FaGithub, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { Heart, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { MusicWidget } from "./MusicWidget";
import { useI18n } from "@/lib/i18n";

type SocialItem = {
  href: string;
  label: string;
  renderIcon: (className: string) => React.ReactNode;
};

const socials: SocialItem[] = [
  {
    href: "https://github.com/dreverrse",
    label: "GitHub",
    renderIcon: (cls) => <FaGithub className={cls} />,
  },
  {
    href: "https://twitter.com/dreverrse",
    label: "Twitter",
    renderIcon: (cls) => <FaXTwitter className={cls} />,
  },
  {
    href: "https://instagram.com/dreverrse",
    label: "Instagram",
    renderIcon: (cls) => <FaInstagram className={cls} />,
  },
  {
    href: "mailto:work.andrefirmansah@gmail.com",
    label: "Email",
    renderIcon: (cls) => <Mail className={cls} />,
  },
];

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-6 max-w-sm">
          <MusicWidget />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 text-sm text-muted">
            {t("footer.madeWith")}
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            {t("footer.by")} <span className="font-medium text-foreground">dreverrse</span>
          </p>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="p-2 rounded-lg text-muted hover:text-highlight hover:bg-surface transition-all duration-200"
              >
                {s.renderIcon("h-4 w-4")}
              </Link>
            ))}
            <Link
              href="/admin"
              aria-label={t("footer.admin")}
              className="p-2 rounded-lg text-muted/50 hover:text-highlight hover:bg-surface transition-all duration-200"
            >
              <Lock className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
