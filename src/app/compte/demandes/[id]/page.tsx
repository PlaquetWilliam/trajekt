import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/account/StatusBadge";
import { requireUser } from "@/lib/session";
import { getUserTripRequest } from "@/lib/trip-requests";

export async function generateMetadata({ params }: PageProps<"/compte/demandes/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/compte/demandes/${id}`);
  const request = await getUserTripRequest(user.id, id);
  return { title: request ? `Demande — ${request.destination}` : "Demande introuvable" };
}

const STATUS_HELP = {
  draft: "Cette demande n'a pas encore été envoyée.",
  sent: "Nous avons bien reçu votre demande. Nous l'étudions et revenons vers vous rapidement.",
  preparing: "Nous préparons votre itinéraire sur mesure.",
  proposed: "Votre proposition d'itinéraire est prête : nous vous l'avons envoyée par e-mail.",
  archived: "Cette demande est archivée.",
} as const;

export default async function TripRequestPage({ params }: PageProps<"/compte/demandes/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/compte/demandes/${id}`);
  const r = await getUserTripRequest(user.id, id);
  if (!r) notFound();

  const rows = [
    { label: "Dates", value: r.dates },
    { label: "Voyageurs", value: r.travellers },
    { label: "Budget par personne", value: r.budget },
    { label: "Styles", value: r.styles },
    { label: "Rythme", value: r.pace },
    { label: "Vos envies", value: r.wishes ?? "—" },
    { label: "Contact", value: [r.contact.name, r.contact.email, r.contact.phone].filter(Boolean).join(" · ") },
    { label: "Envoyée le", value: r.createdAt },
  ];

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="text-sm">
        <ol className="flex flex-wrap gap-2 text-meta">
          <li>
            <Link href="/compte" className="text-accent hover:underline">Mes voyages</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{r.destination}</li>
        </ol>
      </nav>

      <header className="flex flex-col items-start gap-3">
        <StatusBadge status={r.status} />
        <h1 className="font-serif text-[44px] leading-none md:text-[60px]">{r.destination}</h1>
        <p className="max-w-2xl text-lg text-muted">{STATUS_HELP[r.status]}</p>
        {r.destinationSlug && (
          <Link href={`/destinations/${r.destinationSlug}`} className="text-[15px] text-accent hover:underline">
            Revoir la fiche destination <span aria-hidden="true">→</span>
          </Link>
        )}
      </header>

      {r.clientMessage && (
        <section aria-labelledby="message-titre" className="flex flex-col gap-2 rounded border border-accent bg-card p-6 md:p-8">
          <h2 id="message-titre" className="font-serif text-[28px] leading-none">
            Message de <em className="text-accent">Trajekt</em>
          </h2>
          <p className="text-[17px] leading-relaxed whitespace-pre-line">{r.clientMessage}</p>
        </section>
      )}

      <section aria-labelledby="detail-titre" className="rounded border border-line bg-card p-6 md:p-8">
        <h2 id="detail-titre" className="mb-5 font-serif text-3xl">Votre demande</h2>
        <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1">
              <dt className="text-[13px] text-meta">{row.label}</dt>
              <dd className="text-base whitespace-pre-line">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
