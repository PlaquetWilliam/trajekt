import Link from "next/link";
import { StatusBadge } from "@/components/account/StatusBadge";
import { ADMIN_STATUSES, adminHref, listAdminRequests, parseAdminParams } from "@/lib/admin-requests";
import { REQUEST_STATUS } from "@/lib/request-status";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Demandes" };

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin("/admin");
  const filters = parseAdminParams(await searchParams);
  const { rows, total, page, pageCount, counts } = await listAdminRequests(filters);

  const tabs = [
    { value: undefined, label: "Toutes", count: counts.all },
    ...ADMIN_STATUSES.map((s) => ({ value: s, label: REQUEST_STATUS[s].label, count: counts[s] })),
  ];

  return (
    <>
      <header className="flex flex-col gap-2.5">
        <h1 className="font-serif text-[44px] leading-none md:text-[56px]">Demandes de voyage</h1>
        <p className="text-muted">
          {counts.sent > 0
            ? `${counts.sent} nouvelle${counts.sent > 1 ? "s" : ""} demande${counts.sent > 1 ? "s" : ""} à traiter.`
            : "Aucune nouvelle demande à traiter."}
        </p>
      </header>

      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtrer par statut" className="-mx-1 overflow-x-auto">
          <ul className="flex gap-1.5 px-1">
            {tabs.map((t) => {
              const active = filters.statut === t.value;
              return (
                <li key={t.label} className="shrink-0">
                  <Link
                    href={adminHref({ statut: t.value, q: filters.q })}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
                      active ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-ink"
                    }`}
                  >
                    {t.label}
                    <span className={active ? "text-[#cfc6b6]" : "text-meta"}>{t.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <form role="search" action="/admin" className="flex h-11 w-full items-center rounded border border-line bg-card lg:w-80">
          {filters.statut && <input type="hidden" name="statut" value={filters.statut} />}
          <label htmlFor="recherche-admin" className="sr-only">
            Rechercher une demande
          </label>
          <input
            id="recherche-admin"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Nom, e-mail, destination…"
            className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] placeholder:text-meta focus:outline-none"
          />
          <button type="submit" className="h-full px-4 text-[15px] font-medium text-accent hover:text-accent-dark">
            Rechercher
          </button>
        </form>
      </div>

      <p role="status" className="text-sm text-meta">
        {total} demande{total > 1 ? "s" : ""}
        {filters.q && ` pour « ${filters.q} »`}
        {pageCount > 1 && ` · page ${page} sur ${pageCount}`}
      </p>

      {rows.length === 0 ? (
        <p className="rounded border border-line bg-card p-8 text-muted">Aucune demande ne correspond.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-line bg-card">
          <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
            <caption className="sr-only">Liste des demandes de voyage, de la plus récente à la plus ancienne</caption>
            <thead>
              <tr className="border-b border-line text-[13px] text-meta">
                <th scope="col" className="px-5 py-3 font-medium">Reçue le</th>
                <th scope="col" className="px-5 py-3 font-medium">Client</th>
                <th scope="col" className="px-5 py-3 font-medium">Destination</th>
                <th scope="col" className="px-5 py-3 font-medium">Dates</th>
                <th scope="col" className="px-5 py-3 font-medium">Statut</th>
                <th scope="col" className="px-5 py-3 font-medium"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line align-top last:border-0 hover:bg-paper">
                  <td className="px-5 py-4 whitespace-nowrap text-muted">{r.createdAt}</td>
                  <td className="px-5 py-4">
                    <span className="font-medium">{r.contact.name}</span>
                    <br />
                    <span className="text-sm text-meta">{r.contact.email}</span>
                    {!r.hasAccount && <span className="ml-1.5 text-[12px] text-meta">(sans compte)</span>}
                  </td>
                  <td className="px-5 py-4">
                    {r.destination}
                    <br />
                    <span className="text-sm text-meta">{r.travellers} · {r.budget}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">{r.dates}</td>
                  <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/demandes/${r.id}`} className="whitespace-nowrap text-accent hover:underline">
                      Traiter<span className="sr-only"> la demande de {r.contact.name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4 text-[15px]">
          {page > 1 ? (
            <Link href={adminHref({ ...filters, page: page - 1 })} className="text-accent hover:underline">
              ← Plus récentes
            </Link>
          ) : <span />}
          {page < pageCount ? (
            <Link href={adminHref({ ...filters, page: page + 1 })} className="text-accent hover:underline">
              Plus anciennes →
            </Link>
          ) : <span />}
        </nav>
      )}
    </>
  );
}
