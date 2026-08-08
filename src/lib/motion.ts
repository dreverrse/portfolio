import type { Transition, Variants } from "framer-motion";

export const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];
export const DURATION = 0.55;

export const springTransition: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.8,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
