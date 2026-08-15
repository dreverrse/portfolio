"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { Button } from "@/components/ui/button";

const THEME_KEY = "theme";
const THEME_EVENT = "themechange";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getSnapshot() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("light")
  );
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { t } = useI18n();
  const isLight = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !isLight;
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem(THEME_KEY, next ? "light" : "dark");
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <Button
      onClick={toggle}
      aria-label={isLight ? t("theme.dark") : t("theme.light")}
      variant="ghost"
      className="p-2 text-muted"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isLight ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="inline-flex"
        >
          {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
