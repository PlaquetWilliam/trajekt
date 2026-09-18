"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Masque son contenu sur certaines pages (ex. pied de page pendant le formulaire). */
export function HideOnPaths({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname();
  return paths.includes(pathname) ? null : children;
}
