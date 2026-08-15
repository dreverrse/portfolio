"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  User,
  Briefcase,
  FileText,
  Menu,
  Globe,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/about", labelKey: "nav.about", icon: User },
  { href: "/portfolio", labelKey: "nav.portfolio", icon: Briefcase },
  { href: "/blog", labelKey: "nav.blog", icon: FileText },
  { href: "/admin/chat", labelKey: "nav.chat", icon: MessageSquare },
];

function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const next: "id" | "en" = lang === "id" ? "en" : "id";
  return (
    <Button
      onClick={() => setLang(next)}
      aria-label={t("lang.switch")}
      variant="ghost"
      className="text-muted"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-semibold">{lang.toUpperCase()}</span>
    </Button>
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
                  <Button
                    key={item.href}
                    render={<Link href={item.href} />}
                    variant="ghost"
                    className={cn(
                      "relative",
                      isActive
                        ? "text-highlight"
                        : "text-muted"
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
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  render={
                    <Button variant="ghost" className="md:hidden text-muted" />
                  }
                  aria-label={t("nav.toggleMenu")}
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetHeader>
                    <SheetTitle>dreverrse</SheetTitle>
                  </SheetHeader>
                  <Separator />
                  <div className="space-y-1 px-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Button
                          key={item.href}
                          render={<Link href={item.href} onClick={() => setMobileOpen(false)} />}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            isActive && "bg-accent/30 text-highlight"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {t(item.labelKey)}
                        </Button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
