"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { springTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";

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
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={springTransition}
          className="fixed bottom-5 left-5 z-[70]"
        >
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={t("backtotop.aria")}
            variant="outline"
            className="h-11 w-11 rounded-full text-muted hover:text-highlight hover:border-accent"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
