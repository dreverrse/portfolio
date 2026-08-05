"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Home,
  User,
  Briefcase,
  FileText,
  Menu,
  X,
  Globe,
} from "lucide-react";

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
    <nav className="fixed top-4 left-4 right-4 z-50">
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
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
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
    </nav>
  );
}
