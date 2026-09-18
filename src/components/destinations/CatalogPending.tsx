"use client";

import { createContext, useContext, useTransition, type ReactNode, type TransitionStartFunction } from "react";

const PendingContext = createContext<{ pending: boolean; start: TransitionStartFunction } | null>(null);

/** Partage l'état « chargement des résultats » entre les filtres et la grille. */
export function CatalogPendingProvider({ children }: { children: ReactNode }) {
  const [pending, start] = useTransition();
  return <PendingContext.Provider value={{ pending, start }}>{children}</PendingContext.Provider>;
}

export function useCatalogPending() {
  const ctx = useContext(PendingContext);
  if (!ctx) throw new Error("useCatalogPending doit être utilisé dans CatalogPendingProvider");
  return ctx;
}

export function CatalogResults({ children }: { children: ReactNode }) {
  const { pending } = useCatalogPending();
  return (
    <div aria-busy={pending} className={`transition-opacity duration-200 ${pending ? "opacity-50" : ""}`}>
      {children}
    </div>
  );
}
