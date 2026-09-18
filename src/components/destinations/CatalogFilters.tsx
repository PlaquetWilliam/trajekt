"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type FormEvent } from "react";
import { Select } from "@/components/ui/Select";
import { useCatalogPending } from "@/components/destinations/CatalogPending";
import {
  CONTINENTS,
  DURATIONS,
  SORTS,
  TRAVEL_STYLES,
  catalogHref,
  parseCatalogParams,
  type CatalogFilters as Filters,
} from "@/lib/catalog";

/**
 * Filtres du catalogue. Sans JavaScript, c'est un simple formulaire GET ;
 * avec JavaScript, les listes s'appliquent dès qu'on les change, sans recharger la page.
 */
export function CatalogFilters({ filters }: { filters: Filters }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { pending, start } = useCatalogPending();

  const apply = () => {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const next = parseCatalogParams(Object.fromEntries(data) as Record<string, string>);
    start(() => router.replace(catalogHref({ ...next, page: 1 }), { scroll: false }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    apply();
  };

  const hasFilters = Boolean(filters.q || filters.continent || filters.duree || filters.style);
  // La clé force la remise à zéro des champs quand l'URL change (ex. « Réinitialiser »)
  const key = catalogHref(filters);

  return (
    <form
      key={key}
      ref={formRef}
      role="search"
      aria-label="Filtrer les destinations"
      action="/destinations"
      method="get"
      onSubmit={onSubmit}
      className="flex flex-col gap-4 border-y border-line py-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:items-end">
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <label htmlFor="recherche" className="text-[13px] text-muted">
            Rechercher
          </label>
          <div className="flex h-11 items-center rounded border border-line bg-card transition-colors focus-within:border-meta hover:border-meta">
            <svg aria-hidden="true" className="ml-3.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              id="recherche"
              name="q"
              type="search"
              defaultValue={filters.q}
              maxLength={80}
              placeholder="Une ville, un pays…"
              className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[15px] placeholder:text-meta focus:outline-none"
            />
            <button type="submit" className="h-full shrink-0 rounded-r px-4 text-[15px] font-medium text-accent hover:text-accent-dark">
              Rechercher
            </button>
          </div>
        </div>
        <Select name="continent" label="Continent" placeholder="Tous" options={CONTINENTS} defaultValue={filters.continent ?? ""} onChange={apply} />
        <Select name="duree" label="Durée" placeholder="Toutes" options={DURATIONS} defaultValue={filters.duree ?? ""} onChange={apply} />
        <Select name="style" label="Style" placeholder="Tous" options={TRAVEL_STYLES} defaultValue={filters.style ?? ""} onChange={apply} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4 text-sm">
          {hasFilters && (
            <Link href="/destinations" scroll={false} className="text-accent underline-offset-4 hover:underline">
              Réinitialiser les filtres
            </Link>
          )}
          {pending && <span className="text-meta">Mise à jour…</span>}
        </div>
        <Select name="tri" label="Trier par" options={SORTS} defaultValue={filters.tri} onChange={apply} className="w-full sm:w-52" />
      </div>
      <noscript>
        <button type="submit" className="self-start rounded-full bg-ink px-5 py-2.5 text-paper">
          Appliquer les filtres
        </button>
      </noscript>
    </form>
  );
}
