"use client";

import { useState, useCallback, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { LoadingScreen } from "./LoadingScreen";

export function ClientProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

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
