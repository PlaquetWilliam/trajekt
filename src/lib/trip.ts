import { z } from "zod";
import { STYLE_VALUES, TRAVEL_STYLES } from "@/lib/catalog";

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const TRIP_STEPS = [
  { id: "destination", label: "Destination", title: "Où rêvez-vous d'aller ?" },
  { id: "dates", label: "Dates", title: "Quand souhaitez-vous partir ?" },
  { id: "voyageurs", label: "Voyageurs & budget", title: "Qui part, et pour quel budget ?" },
  { id: "style", label: "Style & envies", title: "Qu'est-ce qui vous fait vibrer ?" },
  { id: "coordonnees", label: "Coordonnées", title: "Comment vous recontacter ?" },
] as const;

export const BUDGETS = [
  { value: "moins-1000", label: "Moins de 1 000 €" },
  { value: "1000-2000", label: "1 000 à 2 000 €" },
  { value: "2000-3500", label: "2 000 à 3 500 €" },
  { value: "plus-3500", label: "Plus de 3 500 €" },
] as const;

export const PACES = [
  { value: "tranquille", label: "Tranquille", hint: "Peu d'étapes, du temps libre" },
  { value: "equilibre", label: "Équilibré", hint: "Un bon mélange des deux" },
  { value: "intense", label: "Intense", hint: "Voir un maximum de choses" },
] as const;

export const DATE_MODES = [
  { value: "precises", label: "J'ai des dates précises" },
  { value: "flexibles", label: "Mes dates sont flexibles" },
] as const;

export const BUDGET_VALUES = BUDGETS.map((b) => b.value) as [string, ...string[]];
export const PACE_VALUES = PACES.map((p) => p.value) as [string, ...string[]];

export type BudgetValue = (typeof BUDGETS)[number]["value"];
export type PaceValue = (typeof PACES)[number]["value"];
export type DateMode = (typeof DATE_MODES)[number]["value"];

export const LIMITS = { wishes: 2000, travellers: 20, minDuration: 2, maxDuration: 60 } as const;

/* ------------------------------------------------------------------ */
/* Données du formulaire (structure plate, facile à sauvegarder)       */
/* ------------------------------------------------------------------ */

export type TripDraft = {
  destination: string;
  destinationSlug: string;
  undecided: boolean;
  dateMode: DateMode;
  startDate: string; // AAAA-MM-JJ
  endDate: string;
  month: string; // AAAA-MM
  durationDays: string;
  adults: number;
  children: number;
  budget: BudgetValue | "";
  styles: string[];
  pace: PaceValue;
  wishes: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consent: boolean;
};

export const emptyDraft: TripDraft = {
  destination: "",
  destinationSlug: "",
  undecided: false,
  dateMode: "precises",
  startDate: "",
  endDate: "",
  month: "",
  durationDays: "",
  adults: 2,
  children: 0,
  budget: "",
  styles: [],
  pace: "equilibre",
  wishes: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  consent: false,
};

export type TripField = keyof TripDraft;

/* ------------------------------------------------------------------ */
/* Dates utilitaires                                                   */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Aujourd'hui (moins un jour de marge pour les écarts de fuseau horaire). */
const earliestDay = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return isoDay(d);
};

/** Les 18 prochains mois, pour les dates flexibles. */
export function upcomingMonths(from = new Date(), count = 18) {
  const fmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const label = fmt.format(d);
    return { value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: label[0].toUpperCase() + label.slice(1) };
  });
}

const dayRe = /^\d{4}-\d{2}-\d{2}$/;
const daysBetween = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86_400_000;

/* ------------------------------------------------------------------ */
/* Règles de validation par étape                                      */
/* ------------------------------------------------------------------ */

const text = (max: number) => z.string().trim().max(max, `${max} caractères maximum.`);

const destinationStep = z
  .object({
    destination: text(120),
    destinationSlug: z.string().trim().max(120).regex(/^[a-z0-9-]*$/),
    undecided: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (!v.undecided && v.destination.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["destination"],
        message: "Indiquez une destination, ou cochez « Je ne sais pas encore ».",
      });
    }
  });

const datesStep = z
  .object({
    dateMode: z.enum(["precises", "flexibles"]),
    startDate: z.string(),
    endDate: z.string(),
    month: z.string(),
    durationDays: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    if (v.dateMode === "precises") {
      if (!dayRe.test(v.startDate)) {
        ctx.addIssue({ code: "custom", path: ["startDate"], message: "Choisissez une date de départ." });
      } else if (v.startDate < earliestDay()) {
        ctx.addIssue({ code: "custom", path: ["startDate"], message: "La date de départ doit être aujourd'hui ou plus tard." });
      }
      if (!dayRe.test(v.endDate)) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "Choisissez une date de retour." });
      } else if (dayRe.test(v.startDate)) {
        const nights = daysBetween(v.startDate, v.endDate);
        if (nights < 1) {
          ctx.addIssue({ code: "custom", path: ["endDate"], message: "La date de retour doit être après la date de départ." });
        } else if (nights > 365) {
          ctx.addIssue({ code: "custom", path: ["endDate"], message: "Le voyage ne peut pas dépasser un an." });
        }
      }
    } else {
      if (!/^\d{4}-\d{2}$/.test(v.month) || v.month < earliestDay().slice(0, 7)) {
        ctx.addIssue({ code: "custom", path: ["month"], message: "Choisissez le mois de départ souhaité." });
      }
      const n = Number(v.durationDays);
      if (!v.durationDays || !Number.isInteger(n) || n < LIMITS.minDuration || n > LIMITS.maxDuration) {
        ctx.addIssue({
          code: "custom",
          path: ["durationDays"],
          message: `Indiquez une durée entre ${LIMITS.minDuration} et ${LIMITS.maxDuration} jours.`,
        });
      }
    }
  });

const travellersStep = z.object({
  adults: z
    .number({ error: "Indiquez le nombre d'adultes." })
    .int()
    .min(1, "Il faut au moins un adulte.")
    .max(LIMITS.travellers, `${LIMITS.travellers} adultes maximum.`),
  children: z.number().int().min(0).max(LIMITS.travellers, `${LIMITS.travellers} enfants maximum.`),
  budget: z.enum(BUDGET_VALUES, { error: "Choisissez une fourchette de budget." }),
});

const styleStep = z.object({
  styles: z
    .array(z.enum(STYLE_VALUES as [string, ...string[]]))
    .min(1, "Choisissez au moins un style de voyage pour continuer.")
    .max(TRAVEL_STYLES.length),
  pace: z.enum(PACE_VALUES, { error: "Choisissez un rythme." }),
  wishes: text(LIMITS.wishes),
});

const contactStep = z.object({
  firstName: text(60).min(1, "Indiquez votre prénom."),
  lastName: text(60).min(1, "Indiquez votre nom."),
  email: z
    .string()
    .trim()
    .min(1, "Indiquez votre adresse e-mail.")
    .pipe(z.email("Adresse e-mail invalide. Exemple : nom@domaine.fr")),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[\d\s.()-]{8,20}$/.test(v), "Numéro invalide. Exemple : 06 12 34 56 78"),
  consent: z.literal(true, { error: "Vous devez accepter pour que nous puissions traiter votre demande." }),
});

export const STEP_SCHEMAS = [destinationStep, datesStep, travellersStep, styleStep, contactStep] as const;

export type FieldErrors = Partial<Record<TripField, string>>;

/** Valide une étape (index 0 à 4) et renvoie la première erreur de chaque champ. */
export function validateStep(step: number, draft: TripDraft): FieldErrors {
  const result = STEP_SCHEMAS[step].safeParse(draft);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as TripField | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Première étape incomplète, ou -1 si tout est valide. */
export function firstInvalidStep(draft: TripDraft) {
  return STEP_SCHEMAS.findIndex((_, i) => Object.keys(validateStep(i, draft)).length > 0);
}

/** Ordre d'affichage des champs, pour le résumé des erreurs et le focus. */
export const FIELD_ORDER: TripField[] = [
  "destination", "startDate", "endDate", "month", "durationDays",
  "adults", "children", "budget", "styles", "pace", "wishes",
  "firstName", "lastName", "email", "phone", "consent",
];

/** Normalise un brouillon venant du navigateur (localStorage) ou du réseau. */
export function sanitizeDraft(input: unknown): TripDraft {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out = { ...emptyDraft };
  for (const key of Object.keys(emptyDraft) as TripField[]) {
    const value = src[key];
    const expected = emptyDraft[key];
    if (Array.isArray(expected)) {
      if (Array.isArray(value)) (out as Record<string, unknown>)[key] = value.filter((x) => typeof x === "string").slice(0, 20);
    } else if (typeof value === typeof expected) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}
