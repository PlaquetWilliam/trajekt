import type { Metadata } from "next";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { CatalogFilters } from "@/components/destinations/CatalogFilters";
import { CatalogPendingProvider, CatalogResults } from "@/components/destinations/CatalogPending";
import { Pagination } from "@/components/destinations/Pagination";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { isDatabaseConfigured } from "@/lib/mongodb";
import { listDestinations } from "@/lib/destinations";
import { catalogHref, parseCatalogParams } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Parcourez nos idées de voyages sur mesure par continent, durée et style, puis adaptez-les à vos envies.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage({ searchParams }: PageProps<"/destinations">) {
  const filters = parseCatalogParams(await searchParams);

  return (
    <div className="container-page flex flex-col gap-10 pt-10 pb-18 md:pt-14">
      <header className="flex max-w-3xl flex-col gap-4">
        <p className="text-[13px] tracking-[0.14em] text-meta uppercase">Catalogue</p>
        <h1 className="font-serif text-[52px] leading-none tracking-[-0.02em] md:text-[72px]">Destinations</h1>
        <p className="text-lg leading-relaxed text-muted">
          Des idées pour vous inspirer. Chaque voyage reste entièrement personnalisable.
        </p>
      </header>

      {isDatabaseConfigured() ? (
        <CatalogPendingProvider>
          <CatalogFilters filters={filters} />
          <Results filters={filters} />
        </CatalogPendingProvider>
      ) : (
        <p role="alert" className="rounded border border-line bg-card p-6 text-muted">
          Le catalogue n&apos;est pas encore relié à la base de données (variable <code>MONGODB_URI</code> manquante).
        </p>
      )}
    </div>
  );
}

async function Results({ filters }: { filters: ReturnType<typeof parseCatalogParams> }) {
  const { items, total, page, pageCount } = await listDestinations(filters);

  return (
    <CatalogResults>
      <div className="flex flex-col gap-8">
        <p role="status" className="text-sm text-meta">
          {total === 0 ? "Aucune destination" : `${total} destination${total > 1 ? "s" : ""}`}
          {pageCount > 1 && ` · page ${page} sur ${pageCount}`}
        </p>

        {items.length > 0 ? (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d, i) => (
              <li key={d.slug}>
                <DestinationCard destination={d} priority={page === 1 && i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-5 rounded border border-line bg-card p-8 md:p-10">
            <h2 className="font-serif text-3xl md:text-4xl">
              Pas encore d&apos;idée toute faite <em className="text-accent">pour ces critères</em>.
            </h2>
            <p className="max-w-xl text-muted">
              Modifiez vos filtres, ou décrivez-nous directement le voyage que vous imaginez : nous le composons pour vous.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/creer-mon-voyage">Créer mon voyage</ButtonLink>
              <ButtonLink href={catalogHref({})} variant="outline">
                Voir toutes les destinations
              </ButtonLink>
            </div>
          </div>
        )}

        <Pagination filters={filters} page={page} pageCount={pageCount} />
      </div>
    </CatalogResults>
  );
}
