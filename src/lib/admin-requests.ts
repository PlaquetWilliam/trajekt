import "server-only";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { REQUEST_STATUS, type RequestStatus } from "@/lib/request-status";
import { toView, type Lean, type TripRequestView } from "@/lib/trip-requests";
import { TripRequest } from "@/models/TripRequest";
import "@/models/Destination";

export const ADMIN_PAGE_SIZE = 20;
export const ADMIN_STATUSES = ["sent", "preparing", "proposed", "archived"] as const satisfies RequestStatus[];

export type AdminFilters = { statut?: RequestStatus; q?: string; page: number };

type Raw = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseAdminParams(params: Raw): AdminFilters {
  const statut = first(params.statut);
  const page = Number.parseInt(first(params.page) ?? "1", 10);
  return {
    statut: statut && (ADMIN_STATUSES as readonly string[]).includes(statut) ? (statut as RequestStatus) : undefined,
    q: first(params.q)?.trim().slice(0, 80) || undefined,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1,
  };
}

export function adminHref(f: Partial<AdminFilters>) {
  const sp = new URLSearchParams();
  if (f.statut) sp.set("statut", f.statut);
  if (f.q) sp.set("q", f.q);
  if (f.page && f.page > 1) sp.set("page", String(f.page));
  const qs = sp.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export type AdminRow = TripRequestView & { hasAccount: boolean };

export async function listAdminRequests(filters: AdminFilters) {
  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (filters.statut) query.status = filters.statut;
  if (filters.q) {
    const re = new RegExp(escapeRegex(filters.q), "i");
    query.$or = [
      { destination: re },
      { "contact.firstName": re },
      { "contact.lastName": re },
      { "contact.email": re },
    ];
  }

  const [total, counts] = await Promise.all([
    TripRequest.countDocuments(query),
    TripRequest.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const docs = await TripRequest.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * ADMIN_PAGE_SIZE)
    .limit(ADMIN_PAGE_SIZE)
    .lean<Lean[]>();

  const byStatus = Object.fromEntries(ADMIN_STATUSES.map((s) => [s, 0])) as Record<RequestStatus, number>;
  let all = 0;
  for (const c of counts) {
    if (c._id in REQUEST_STATUS) byStatus[c._id as RequestStatus] = c.n;
    all += c.n;
  }

  const rows: AdminRow[] = docs.map((d) => ({ ...toView(d), hasAccount: Boolean(d.user) }));
  return { rows, total, page, pageCount, counts: { ...byStatus, all } };
}

export type AdminRequestDetail = TripRequestView & {
  hasAccount: boolean;
  internalNote?: string;
  history: { status: RequestStatus; at: string; by?: string }[];
  updatedAt: string;
};

const dateTime = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

export async function getAdminRequest(id: string): Promise<AdminRequestDetail | null> {
  if (!isValidObjectId(id)) return null;
  await connectToDatabase();
  const doc = await TripRequest.findById(id).populate("destinationRef", "slug").lean<Lean>();
  if (!doc) return null;
  const history = [
    ...(doc.createdAt ? [{ status: "sent" as RequestStatus, at: doc.createdAt, by: undefined as string | undefined }] : []),
    ...(doc.statusHistory ?? []).map((h) => ({ status: h.status as RequestStatus, at: h.at, by: h.by })),
  ]
    .filter((h) => h.status in REQUEST_STATUS)
    .sort((a, b) => +b.at - +a.at)
    .map((h) => ({ ...h, at: dateTime.format(h.at) }));

  return {
    ...toView(doc),
    hasAccount: Boolean(doc.user),
    internalNote: doc.internalNote || undefined,
    history,
    updatedAt: doc.updatedAt ? dateTime.format(doc.updatedAt) : "",
  };
}
