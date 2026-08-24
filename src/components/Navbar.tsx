"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PiBriefcaseBold as Briefcase, PiFileTextBold as FileText, PiGlobeBold as Globe, PiHouseBold as Home, PiListBold as Menu, PiUserBold as User, PiXBold as X } from "react-icons/pi";

const navItems = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/about", labelKey: "nav.about", icon: User },
  { href: "/portfolio", labelKey: "nav.portfolio", icon: Briefcase },
  { href: "/blog", labelKey: "nav.blog", icon: FileText },
];

function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const next: "id" | "en" = lang === "id" ? "en" : "id";
  return (
    <button
      onClick={() => setLang(next)}
      aria-label={t("lang.switch")}
      className="flex items-center gap-1 p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-semibold">{lang.toUpperCase()}</span>
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-border bg-background/60 shadow-lg shadow-accent/10 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              <span className="text-foreground">dreverrse</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                      isActive ? "text-highlight" : "text-muted hover:text-foreground hover:bg-surface"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-accent/30"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className="relative h-4 w-4" />
                    <span className="relative">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
              <button
                className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={t("nav.toggleMenu")}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-border px-3 pb-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-accent/30 text-highlight"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
