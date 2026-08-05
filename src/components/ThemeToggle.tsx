"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
    <button
      onClick={toggle}
      aria-label={isLight ? t("theme.dark") : t("theme.light")}
      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
