import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminRequestForm } from "@/components/admin/AdminRequestForm";
import { StatusBadge } from "@/components/account/StatusBadge";
import { getAdminRequest } from "@/lib/admin-requests";
import { REQUEST_STATUS } from "@/lib/request-status";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Demande" };

export default async function AdminRequestPage({ params }: PageProps<"/admin/demandes/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/demandes/${id}`);
  const r = await getAdminRequest(id);
  if (!r) notFound();

  const rows = [
    { label: "Dates", value: r.dates },
    { label: "Voyageurs", value: r.travellers },
    { label: "Budget par personne", value: r.budget },
    { label: "Styles", value: r.styles },
    { label: "Rythme", value: r.pace },
    { label: "Envies", value: r.wishes ?? "—" },
  ];

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="text-sm">
        <ol className="flex flex-wrap gap-2 text-meta">
          <li><Link href="/admin" className="text-accent hover:underline">Demandes</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{r.contact.name} — {r.destination}</li>
        </ol>
      </nav>

      <header className="flex flex-col items-start gap-3">
        <StatusBadge status={r.status} />
        <h1 className="font-serif text-[40px] leading-none md:text-[52px]">{r.destination}</h1>
        <p className="text-muted">
          Reçue le {r.createdAt} · dernière modification le {r.updatedAt}
          {r.destinationSlug && (
            <>
              {" · "}
              <Link href={`/destinations/${r.destinationSlug}`} className="text-accent hover:underline">
                fiche destination
              </Link>
            </>
          )}
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="client-titre" className="rounded border border-line bg-card p-6">
            <h2 id="client-titre" className="mb-4 font-serif text-[28px]">Client</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div><dt className="text-[13px] text-meta">Nom</dt><dd>{r.contact.name}</dd></div>
              <div>
                <dt className="text-[13px] text-meta">E-mail</dt>
                <dd><a href={`mailto:${r.contact.email}`} className="break-all text-accent hover:underline">{r.contact.email}</a></dd>
              </div>
              <div>
                <dt className="text-[13px] text-meta">Téléphone</dt>
                <dd>{r.contact.phone ? <a href={`tel:${r.contact.phone.replace(/[^\d+]/g, "")}`} className="text-accent hover:underline">{r.contact.phone}</a> : "—"}</dd>
              </div>
              <div><dt className="text-[13px] text-meta">Compte client</dt><dd>{r.hasAccount ? "Oui" : "Non (demande envoyée sans compte)"}</dd></div>
            </dl>
          </section>

          <section aria-labelledby="demande-titre" className="rounded border border-line bg-card p-6">
            <h2 id="demande-titre" className="mb-4 font-serif text-[28px]">Demande</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {rows.map((row) => (
                <div key={row.label} className={row.label === "Envies" ? "sm:col-span-2" : ""}>
                  <dt className="text-[13px] text-meta">{row.label}</dt>
                  <dd className="whitespace-pre-line">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="historique-titre" className="rounded border border-line bg-card p-6">
            <h2 id="historique-titre" className="mb-4 font-serif text-[28px]">Historique</h2>
            <ol className="flex flex-col gap-3">
              {r.history.map((h, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-3 last:border-0 last:pb-0">
                  <span className="font-medium">{REQUEST_STATUS[h.status].label}</span>
                  <span className="text-sm text-meta">
                    {h.at}
                    {h.by ? ` · par ${h.by}` : h.status === "sent" ? " · par le client" : ""}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section aria-labelledby="traiter-titre" className="flex flex-col gap-4 rounded border border-line bg-card p-6 lg:sticky lg:top-6">
          <h2 id="traiter-titre" className="font-serif text-[28px]">Traiter la demande</h2>
          <AdminRequestForm id={r.id} status={r.status} clientMessage={r.clientMessage} internalNote={r.internalNote} />
        </section>
      </div>
    </>
  );
}
