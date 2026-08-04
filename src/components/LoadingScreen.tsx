"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const greetings = ["Halo", "안녕하세요", "Hello", "こんにちは"];

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%&@";

function useScrambleText(target: string, onDone: () => void) {
  const [display, setDisplay] = useState(target);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    const interval = setInterval(() => {
      const i = indexRef.current;
      if (i >= target.length) {
        setDisplay(target);
        clearInterval(interval);
        onDone();
        return;
      }
      indexRef.current = i + 1;

      let output = "";
      for (let j = 0; j < target.length; j++) {
        if (j < i) {
          output += target[j];
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(output);
    }, 45);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

function ScrambleGreeting({ target, onDone }: { target: string; onDone: () => void }) {
  const display = useScrambleText(target, onDone);

  return (
    <h1 className="text-5xl sm:text-7xl font-bold text-foreground font-mono whitespace-nowrap">
      {display}
    </h1>
  );
}

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [scrambleDone, setScrambleDone] = useState(false);

  useEffect(() => {
    if (!scrambleDone) return;
    if (index < greetings.length - 1) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
        setScrambleDone(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setDone(true), 700);
      return () => clearTimeout(timer);
    }
  }, [scrambleDone, index]);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [done, onComplete]);

  const current = greetings[index];

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 bg-highlight/5 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <ScrambleGreeting
                target={current}
                onDone={() => setScrambleDone(true)}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
