/** Référentiels partagés par le catalogue, les fiches et le formulaire. */

export const CONTINENTS = [
  { value: "europe", label: "Europe" },
  { value: "afrique", label: "Afrique" },
  { value: "asie", label: "Asie" },
  { value: "ameriques", label: "Amériques" },
  { value: "oceanie", label: "Océanie" },
] as const;

export const TRAVEL_STYLES = [
  { value: "culture", label: "Culture & patrimoine" },
  { value: "nature", label: "Nature & randonnée" },
  { value: "plage", label: "Plage & détente" },
  { value: "gastronomie", label: "Gastronomie" },
  { value: "aventure", label: "Aventure" },
  { value: "road-trip", label: "Road trip" },
  { value: "famille", label: "En famille" },
  { value: "bien-etre", label: "Bien-être" },
] as const;

export const DURATIONS = [
  { value: "courte", label: "Jusqu'à 7 jours", min: 1, max: 7 },
  { value: "moyenne", label: "8 à 14 jours", min: 8, max: 14 },
  { value: "longue", label: "15 jours et plus", min: 15, max: undefined },
] as const;

export const SORTS = [
  { value: "recommandees", label: "Recommandées" },
  { value: "nom", label: "Nom (A–Z)" },
  { value: "duree", label: "Durée" },
] as const;

export const PAGE_SIZE = 9;

export type ContinentValue = (typeof CONTINENTS)[number]["value"];
export type StyleValue = (typeof TRAVEL_STYLES)[number]["value"];
export type DurationValue = (typeof DURATIONS)[number]["value"];
export type SortValue = (typeof SORTS)[number]["value"];

export const CONTINENT_VALUES = CONTINENTS.map((c) => c.value);
export const STYLE_VALUES = TRAVEL_STYLES.map((s) => s.value);

const labelOf = <T extends { value: string; label: string }>(list: readonly T[], value?: string) =>
  list.find((item) => item.value === value)?.label;

export const continentLabel = (value?: string) => labelOf(CONTINENTS, value) ?? value ?? "";
export const styleLabel = (value?: string) => labelOf(TRAVEL_STYLES, value) ?? value ?? "";

export type CatalogFilters = {
  q?: string;
  continent?: ContinentValue;
  duree?: DurationValue;
  style?: StyleValue;
  tri: SortValue;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const oneOf = <T extends string>(list: readonly { value: T }[], v?: string) =>
  list.find((item) => item.value === v)?.value;

/** Lit et nettoie les paramètres d'URL du catalogue (toute valeur inconnue est ignorée). */
export function parseCatalogParams(params: RawParams): CatalogFilters {
  const q = first(params.q)?.trim().slice(0, 80);
  const page = Number.parseInt(first(params.page) ?? "1", 10);
  return {
    q: q || undefined,
    continent: oneOf(CONTINENTS, first(params.continent)),
    duree: oneOf(DURATIONS, first(params.duree)),
    style: oneOf(TRAVEL_STYLES, first(params.style)),
    tri: oneOf(SORTS, first(params.tri)) ?? "recommandees",
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 500) : 1,
  };
}

/** Construit l'URL du catalogue à partir de filtres (les valeurs par défaut sont omises). */
export function catalogHref(filters: Partial<CatalogFilters>) {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.continent) sp.set("continent", filters.continent);
  if (filters.duree) sp.set("duree", filters.duree);
  if (filters.style) sp.set("style", filters.style);
  if (filters.tri && filters.tri !== "recommandees") sp.set("tri", filters.tri);
  if (filters.page && filters.page > 1) sp.set("page", String(filters.page));
  const qs = sp.toString();
  return qs ? `/destinations?${qs}` : "/destinations";
}

export const formatBudget = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

export const formatDuration = (days?: number | null) =>
  days ? `${days} jour${days > 1 ? "s" : ""}` : "Durée libre";
