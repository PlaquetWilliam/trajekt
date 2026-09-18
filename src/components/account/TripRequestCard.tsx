import Link from "next/link";
import { StatusBadge } from "@/components/account/StatusBadge";
import type { TripRequestView } from "@/lib/trip-requests";

export function TripRequestCard({ request: r }: { request: TripRequestView }) {
  const primary = r.status === "proposed";
  return (
    <article className="relative grid gap-5 rounded border border-line bg-card p-5 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <div className="hatch hidden h-24 rounded-sm sm:block" aria-hidden="true" />
      <div className="flex min-w-0 flex-col items-start gap-2">
        <StatusBadge status={r.status} />
        <h3 className="font-serif text-[28px] leading-tight md:text-[30px]">{r.destination}</h3>
        <p className="text-sm text-meta">
          {r.dates} · {r.travellers}
          <br />
          Demande du {r.createdAt}
        </p>
      </div>
      <Link
        href={`/compte/demandes/${r.id}`}
        className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] transition-colors after:absolute after:inset-0 ${
          primary
            ? "bg-accent font-semibold text-card hover:bg-accent-dark"
            : "border border-ink text-ink hover:bg-ink hover:text-paper"
        }`}
      >
        {primary ? "Voir l'itinéraire" : "Voir la demande"}
        <span className="sr-only"> : {r.destination}</span>
      </Link>
    </article>
  );
}
