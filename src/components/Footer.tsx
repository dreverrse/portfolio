"use client";

import { FaGithub, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { Heart, Mail, Lock, Code2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MusicWidget } from "./MusicWidget";
import { useI18n } from "@/lib/i18n";
import { springTransition } from "@/lib/motion";
import { SOCIAL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type SocialItem = {
  href: string;
  label: string;
  renderIcon: (className: string) => ReactNode;
};

const socials: SocialItem[] = [
  {
    href: SOCIAL.github,
    label: "GitHub",
    renderIcon: (cls) => <FaGithub className={cls} />,
  },
  {
    href: SOCIAL.twitter,
    label: "Twitter",
    renderIcon: (cls) => <FaXTwitter className={cls} />,
  },
  {
    href: SOCIAL.instagram,
    label: "Instagram",
    renderIcon: (cls) => <FaInstagram className={cls} />,
  },
  {
    href: SOCIAL.whatsapp,
    label: "WhatsApp",
    renderIcon: (cls) => <FaWhatsapp className={cls} />,
  },
  {
    href: `mailto:${SOCIAL.email}`,
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
              <Button
                key={s.label}
                render={<Link href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} />}
                variant="ghost"
                className="text-muted hover:text-highlight"
              >
                <motion.span
                  whileHover={{ y: -2, scale: 1.15 }}
                  transition={springTransition}
                  className="inline-flex"
                >
                  {s.renderIcon("h-4 w-4")}
                </motion.span>
              </Button>
            ))}
            <Button
              render={<Link href="/admin" aria-label={t("footer.admin")} />}
              variant="ghost"
              className="text-muted/50 hover:text-highlight"
            >
              <Lock className="h-4 w-4" />
            </Button>
            <Button
              render={<Link href="/api-docs" aria-label={t("footer.apiDocs")} />}
              variant="ghost"
              className="text-muted/50 hover:text-highlight"
            >
              <Code2 className="h-4 w-4" />
              {t("footer.apiDocs")}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
