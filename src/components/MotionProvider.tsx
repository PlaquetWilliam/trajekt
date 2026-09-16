"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Respecte le réglage « réduire les animations » du système (accessibilité). */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
