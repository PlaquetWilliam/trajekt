/** Statuts d'une demande de voyage (partagé serveur / navigateur). */
export const REQUEST_STATUS = {
  draft: { label: "Brouillon", tone: "draft" },
  sent: { label: "Demande envoyée", tone: "neutral" },
  preparing: { label: "En préparation", tone: "warning" },
  proposed: { label: "Itinéraire proposé", tone: "success" },
  archived: { label: "Archivée", tone: "neutral" },
} as const;

export type RequestStatus = keyof typeof REQUEST_STATUS;
