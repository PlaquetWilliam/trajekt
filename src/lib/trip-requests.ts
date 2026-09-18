import "server-only";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { styleLabel } from "@/lib/catalog";
import { BUDGETS, PACES } from "@/lib/trip";
import { TripRequest } from "@/models/TripRequest";
import { REQUEST_STATUS, type RequestStatus } from "@/lib/request-status";
import "@/models/Destination"; // nécessaire pour populate("destinationRef")


export type TripRequestView = {
  id: string;
  status: RequestStatus;
  destination: string;
  destinationSlug?: string;
  dates: string;
  travellers: string;
  budget: string;
  styles: string;
  pace: string;
  wishes?: string;
  contact: { name: string; email: string; phone?: string };
  clientMessage?: string;
  createdAt: string;
};

const dayFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

export type Lean = {
  _id: { toString(): string };
  status?: string;
  destination?: string;
  undecided?: boolean;
  destinationRef?: { slug?: string } | null;
  dates?: { mode?: string; start?: Date; end?: Date; month?: string; durationDays?: number };
  travellers?: { adults?: number; children?: number };
  budget?: string;
  styles?: string[];
  pace?: string;
  wishes?: string;
  contact?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  clientMessage?: string;
  internalNote?: string;
  statusHistory?: { status: string; at: Date; by?: string }[];
  user?: { toString(): string } | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export function toView(r: Lean): TripRequestView {
  const d = r.dates ?? {};
  let dates = "Dates à définir";
  if (d.mode === "precises" && d.start && d.end) {
    dates = `Du ${dayFmt.format(d.start)} au ${dayFmt.format(d.end)}`;
  } else if (d.mode === "flexibles" && d.month) {
    const m = monthFmt.format(new Date(`${d.month}-01T00:00:00Z`));
    dates = `${m[0].toUpperCase()}${m.slice(1)}${d.durationDays ? ` · ${d.durationDays} jours` : ""}`;
  }
  const adults = r.travellers?.adults ?? 1;
  const children = r.travellers?.children ?? 0;
  const status = (r.status && r.status in REQUEST_STATUS ? r.status : "sent") as RequestStatus;

  return {
    id: r._id.toString(),
    status,
    destination: r.undecided ? "Destination à définir ensemble" : (r.destination ?? "Destination à définir"),
    destinationSlug: r.destinationRef?.slug,
    dates,
    travellers: `${adults} adulte${adults > 1 ? "s" : ""}${children ? `, ${children} enfant${children > 1 ? "s" : ""}` : ""}`,
    budget: BUDGETS.find((b) => b.value === r.budget)?.label ?? "—",
    styles: (r.styles ?? []).map((s) => styleLabel(s)).join(", ") || "—",
    pace: PACES.find((p) => p.value === r.pace)?.label ?? "—",
    wishes: r.wishes || undefined,
    contact: {
      name: [r.contact?.firstName, r.contact?.lastName].filter(Boolean).join(" "),
      email: r.contact?.email ?? "",
      phone: r.contact?.phone || undefined,
    },
    clientMessage: r.clientMessage || undefined,
    createdAt: r.createdAt ? dayFmt.format(r.createdAt) : "",
  };
}

/** Demandes d'un utilisateur. `past` = demandes archivées. */
export async function listUserTripRequests(userId: string, past = false): Promise<TripRequestView[]> {
  await connectToDatabase();
  const docs = await TripRequest.find({
    user: userId,
    status: past ? "archived" : { $ne: "archived" },
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("destinationRef", "slug")
    .lean<Lean[]>();
  return docs.map(toView);
}

export async function countUserTripRequests(userId: string) {
  await connectToDatabase();
  const [current, past] = await Promise.all([
    TripRequest.countDocuments({ user: userId, status: { $ne: "archived" } }),
    TripRequest.countDocuments({ user: userId, status: "archived" }),
  ]);
  return { current, past };
}

/** Une demande, uniquement si elle appartient bien à l'utilisateur. */
export async function getUserTripRequest(userId: string, id: string): Promise<TripRequestView | null> {
  if (!isValidObjectId(id)) return null;
  await connectToDatabase();
  const doc = await TripRequest.findOne({ _id: id, user: userId })
    .populate("destinationRef", "slug")
    .lean<Lean>();
  return doc ? toView(doc) : null;
}
