"use server";

import type { StyleValue } from "@/lib/catalog";
import { connectToDatabase } from "@/lib/mongodb";
import { rememberPendingRequest } from "@/lib/pending-requests";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { FIELD_ORDER, TRIP_STEPS, sanitizeDraft, validateStep, type FieldErrors } from "@/lib/trip";
import { Destination } from "@/models/Destination";
import { TripRequest } from "@/models/TripRequest";

export type SubmitResult =
  | { ok: true }
  | { ok: false; message: string; step?: number; fieldErrors?: FieldErrors };

export async function submitTripRequest(input: unknown, website: string): Promise<SubmitResult> {
  // Champ piège invisible : seuls les robots le remplissent. On fait comme si tout allait bien.
  if (website) return { ok: true };

  // 5 demandes maximum par adresse IP toutes les 10 minutes
  if (isRateLimited(`trip:${await clientIp()}`, 5, 10 * 60 * 1000)) {
    return { ok: false, message: "Trop de demandes envoyées en peu de temps. Réessayez dans quelques minutes." };
  }

  // Nouvelle validation côté serveur : on ne fait jamais confiance au navigateur.
  const draft = sanitizeDraft(input);
  for (let step = 0; step < TRIP_STEPS.length; step++) {
    const fieldErrors = validateStep(step, draft);
    if (Object.keys(fieldErrors).length > 0) {
      const first = FIELD_ORDER.find((f) => fieldErrors[f]);
      return {
        ok: false,
        step,
        fieldErrors,
        message: first ? fieldErrors[first]! : "Certaines informations sont incomplètes.",
      };
    }
  }

  try {
    await connectToDatabase();

    const destinationRef = draft.destinationSlug
      ? (await Destination.findOne({ slug: draft.destinationSlug, published: true }, { _id: 1 }).lean())?._id
      : undefined;

    const user = await getCurrentUser();
    const precise = draft.dateMode === "precises";
    const created = await TripRequest.create({
      status: "sent",
      user: user?.id,
      destination: draft.undecided ? undefined : draft.destination.trim(),
      destinationRef,
      undecided: draft.undecided,
      dates: precise
        ? { mode: "precises", start: new Date(`${draft.startDate}T00:00:00Z`), end: new Date(`${draft.endDate}T00:00:00Z`) }
        : { mode: "flexibles", month: draft.month, durationDays: Number(draft.durationDays) },
      travellers: { adults: draft.adults, children: draft.children },
      budget: draft.budget,
      styles: draft.styles as StyleValue[], // déjà validé ci-dessus
      pace: draft.pace,
      wishes: draft.wishes.trim() || undefined,
      contact: {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim() || undefined,
      },
      consentAt: new Date(),
    });

    // Sans compte : on garde la trace de la demande pour la rattacher à un futur compte
    if (!user) await rememberPendingRequest(created._id.toString());

    return { ok: true };
  } catch (error) {
    console.error("[creer-mon-voyage] enregistrement impossible :", error);
    return {
      ok: false,
      message: "Votre demande n'a pas pu être envoyée à cause d'un problème technique. Vos réponses sont conservées : réessayez dans un instant.",
    };
  }
}
