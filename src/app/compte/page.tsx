import Link from "next/link";
import { DraftCard } from "@/components/account/DraftCard";
import { TripRequestCard } from "@/components/account/TripRequestCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { requireUser } from "@/lib/session";
import { countUserTripRequests, listUserTripRequests } from "@/lib/trip-requests";

export const metadata = { title: "Mes voyages" };

export default async function AccountPage({ searchParams }: PageProps<"/compte">) {
  const user = await requireUser("/compte");
  const past = (await searchParams).onglet === "passes";
  const [requests, counts] = await Promise.all([
    listUserTripRequests(user.id, past),
    countUserTripRequests(user.id),
  ]);

  const tab = (href: string, label: string, count: number, active: boolean) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`-mb-px border-b-2 pb-3 text-[15px] transition-colors ${
        active ? "border-accent font-semibold" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {label} <span className="font-normal text-meta">{count}</span>
    </Link>
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <p className="text-[13px] tracking-[0.14em] text-meta uppercase">Espace client</p>
          <h1 className="font-serif text-[48px] leading-none md:text-[64px]">
            Bonjour <em className="text-accent">{user.firstName}</em>
          </h1>
        </div>
        <ButtonLink href="/creer-mon-voyage">Nouveau voyage</ButtonLink>
      </div>

      <nav aria-label="Filtrer mes voyages" className="flex gap-7 border-b border-line">
        {tab("/compte", "En cours", counts.current, !past)}
        {tab("/compte?onglet=passes", "Passés", counts.past, past)}
      </nav>

      <section aria-label={past ? "Voyages passés" : "Voyages en cours"} className="flex flex-col gap-4">
        {!past && <DraftCard />}
        {requests.map((r) => (
          <TripRequestCard key={r.id} request={r} />
        ))}
        {requests.length === 0 && (
          <div className="flex flex-col items-start gap-4 rounded border border-line bg-card p-8">
            <h2 className="font-serif text-3xl">
              {past ? "Aucun voyage passé pour le moment." : "Aucune demande envoyée pour le moment."}
            </h2>
            {!past && (
              <>
                <p className="max-w-lg text-muted">
                  Décrivez-nous le voyage que vous imaginez : il apparaîtra ici, avec son avancement.
                </p>
                <ButtonLink href="/creer-mon-voyage">Créer mon voyage</ButtonLink>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}
