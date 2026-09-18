"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { ADMIN_STATUSES } from "@/lib/admin-requests";
import { formString, toFieldErrors, type FormState } from "@/lib/auth-schema";
import { TripRequest } from "@/models/TripRequest";

const schema = z.object({
  status: z.enum(ADMIN_STATUSES, { error: "Choisissez un statut." }),
  clientMessage: z.string().trim().max(1000, "1 000 caractères maximum."),
  internalNote: z.string().trim().max(2000, "2 000 caractères maximum."),
});

export async function updateRequestAction(id: string, _prev: FormState, data: FormData): Promise<FormState> {
  // Vérification systématique : une Server Action peut être appelée directement
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?redirect=/admin/demandes/${id}`);
  if (!user.isAdmin) return { status: "error", message: "Action réservée aux administrateurs." };
  if (!isValidObjectId(id)) return { status: "error", message: "Demande introuvable." };

  const values = {
    status: formString(data, "status"),
    clientMessage: formString(data, "clientMessage"),
    internalNote: formString(data, "internalNote"),
  };
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", values, fieldErrors: toFieldErrors(parsed.error), message: "Vérifiez les champs indiqués." };
  }

  try {
    await connectToDatabase();
    const current = await TripRequest.findById(id, { status: 1 }).lean<{ status?: string }>();
    if (!current) return { status: "error", message: "Demande introuvable." };

    const { status, clientMessage, internalNote } = parsed.data;
    const set: Record<string, unknown> = { status };
    const unset: Record<string, 1> = {};
    if (clientMessage) set.clientMessage = clientMessage;
    else unset.clientMessage = 1;
    if (internalNote) set.internalNote = internalNote;
    else unset.internalNote = 1;

    const update: Record<string, unknown> = { $set: set };
    if (Object.keys(unset).length) update.$unset = unset;
    if (current.status !== status) {
      update.$push = { statusHistory: { status, at: new Date(), by: user.name } };
    }

    await TripRequest.updateOne({ _id: id }, update);
  } catch (error) {
    console.error("[admin] mise à jour impossible :", error);
    return { status: "error", values, message: "Enregistrement impossible pour le moment." };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/compte", "layout");
  return { status: "success", values: parsed.data, message: "Demande mise à jour." };
}
