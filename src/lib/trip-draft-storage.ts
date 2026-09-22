/** Brouillon du formulaire « Créer mon voyage », gardé dans le navigateur. */
export const TRIP_DRAFT_KEY = "trajekt:demande-en-cours:v1";
export const TRIP_DRAFT_EVENT = "trajekt:brouillon";

/**
 * L'événement « storage » du navigateur ne prévient que les autres onglets.
 * On émet donc notre propre événement pour que l'onglet courant se mette
 * aussi à jour (la carte « demande en cours » de l'espace client, par exemple).
 */
function notifyChange() {
  try {
    window.dispatchEvent(new Event(TRIP_DRAFT_EVENT));
  } catch {
    /* environnement sans window : rien à prévenir */
  }
}

export function readTripDraft(): string | null {
  try {
    return window.localStorage.getItem(TRIP_DRAFT_KEY);
  } catch {
    return null; // stockage indisponible (navigation privée…)
  }
}

export function writeTripDraft(raw: string) {
  try {
    window.localStorage.setItem(TRIP_DRAFT_KEY, raw);
    notifyChange();
  } catch {
    /* stockage indisponible : on continue sans brouillon */
  }
}

export function clearTripDraft() {
  try {
    window.localStorage.removeItem(TRIP_DRAFT_KEY);
    notifyChange();
  } catch {
    /* rien à supprimer */
  }
}

/** S'abonne aux changements du brouillon, dans cet onglet comme dans les autres. */
export function subscribeToTripDraft(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(TRIP_DRAFT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(TRIP_DRAFT_EVENT, onChange);
  };
}
