"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { StatusBadge } from "@/components/account/StatusBadge";
import { ConfirmDialog, DialogAction } from "@/components/ui/ConfirmDialog";
import { clearTripDraft, readTripDraft, subscribeToTripDraft } from "@/lib/trip-draft-storage";
import { TRIP_STEPS } from "@/lib/trip";

/** Demande commencée sur cet appareil mais pas encore envoyée. */
export function DraftCard() {
  const raw = useSyncExternalStore(subscribeToTripDraft, readTripDraft, () => null);
  const [confirming, setConfirming] = useState(false);
  if (!raw) return null;

  let destination = "Destination à définir";
  let step = 0;
  try {
    const saved = JSON.parse(raw) as { draft?: { destination?: string }; step?: number };
    if (saved.draft?.destination?.trim()) destination = saved.draft.destination.trim();
    step = Math.min(TRIP_STEPS.length - 1, Math.max(0, Number(saved.step) || 0));
  } catch {
    return null;
  }

  return (
    <article className="relative grid gap-5 rounded border border-dashed border-line p-5 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <div className="hidden h-24 rounded-sm border border-dashed border-line sm:block" aria-hidden="true" />
      <div className="flex flex-col items-start gap-2">
        <StatusBadge status="local-draft" />
        <h3 className="font-serif text-[28px] leading-tight md:text-[30px]">{destination}</h3>
        <p className="text-sm text-meta">
          Arrêtée à l&apos;étape {step + 1} sur {TRIP_STEPS.length} · non envoyée
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/creer-mon-voyage"
          className="inline-flex h-11 items-center justify-center rounded-full border border-ink px-5 text-[15px] text-ink transition-colors after:absolute after:inset-0 hover:bg-ink hover:text-paper"
        >
          Reprendre
        </Link>
        {/* Au-dessus de la zone cliquable de la carte */}
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="relative z-10 inline-flex h-11 items-center justify-center rounded-full px-4 text-[15px] text-meta transition-colors hover:text-error"
        >
          Supprimer
        </button>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Supprimer cette demande ?"
        description={`« ${destination} » n'a pas encore été envoyée. Le brouillon sera effacé de cet appareil, sans possibilité de le récupérer.`}
      >
        <DialogAction
          tone="danger"
          onClick={() => {
            clearTripDraft();
            setConfirming(false);
          }}
        >
          Supprimer définitivement
        </DialogAction>
        <DialogAction tone="ghost" onClick={() => setConfirming(false)}>
          Garder ma demande
        </DialogAction>
      </ConfirmDialog>
    </article>
  );
}
