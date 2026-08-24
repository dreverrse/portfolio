"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiArrowUpBold as ArrowUp } from "react-icons/pi";
import { useI18n } from "@/lib/i18n";
import { springTransition } from "@/lib/motion";

export function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t("backtotop.aria")}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={springTransition}
          className="fixed bottom-5 left-5 z-[70] h-11 w-11 rounded-full border border-border bg-card/80 backdrop-blur-md flex items-center justify-center text-muted hover:text-highlight hover:border-accent transition-colors duration-300 glow-hover"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
