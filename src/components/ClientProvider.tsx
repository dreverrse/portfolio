"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { LoadingScreen } from "./LoadingScreen";

const LOADING_SEEN_KEY = "loading-screen-seen";

export function ClientProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      let shown = true;
      try {
        shown = localStorage.getItem(LOADING_SEEN_KEY) !== "1";
        if (shown) localStorage.setItem(LOADING_SEEN_KEY, "1");
      } catch {
        // localStorage tidak tersedia (mis. mode privat) — tampilkan sekali
      }
      if (!shown) setLoading(false);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const handleComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <LoadingScreen onComplete={handleComplete} />}
      <MotionConfig reducedMotion="user">
        <div
          className={loading ? "opacity-0 h-screen overflow-hidden" : "opacity-100 transition-opacity duration-500"}
        >
          {children}
        </div>
      </MotionConfig>
    </>
  );
}
