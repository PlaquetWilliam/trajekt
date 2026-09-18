import "server-only";
import { cache } from "react";
import type { QueryFilter } from "mongoose";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/mongodb";
import { Destination, type DestinationDoc } from "@/models/Destination";
import {
  DURATIONS,
  PAGE_SIZE,
  continentLabel,
  formatDuration,
  styleLabel,
  type CatalogFilters,
} from "@/lib/catalog";
import type { DestinationSummary } from "@/components/destinations/DestinationCard";

type Image = { src: string; alt: string };

export type DestinationDetail = DestinationSummary & {
  continent: string;
  continentLabel: string;
  styles: string[];
  durationDays?: number;
  bestPeriod?: string;
  budgetFrom?: number;
  summary: string;
  description?: string;
  gallery: Image[];
  itinerary: { days: string; title: string; description?: string }[];
  updatedAt?: Date;
};

type LeanDestination = DestinationDoc & { updatedAt?: Date };

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function toImage(img?: { src?: string | null; alt?: string | null } | null, fallbackAlt = ""): Image | undefined {
  return img?.src ? { src: img.src, alt: img.alt ?? fallbackAlt } : undefined;
}

function toSummary(d: LeanDestination): DestinationSummary {
  return {
    slug: d.slug,
    name: d.name,
    country: d.country,
    style: d.styles?.[0] ? styleLabel(d.styles[0]) : "Sur mesure",
    duration: formatDuration(d.durationDays),
    image: toImage(d.image, d.name),
  };
}

function toDetail(d: LeanDestination): DestinationDetail {
  return {
    ...toSummary(d),
    continent: d.continent,
    continentLabel: continentLabel(d.continent),
    styles: d.styles ?? [],
    durationDays: d.durationDays ?? undefined,
    bestPeriod: d.bestPeriod ?? undefined,
    budgetFrom: d.budgetFrom ?? undefined,
    summary: d.summary,
    description: d.description ?? undefined,
    gallery: (d.gallery ?? []).flatMap((g) => toImage(g, d.name) ?? []),
    itinerary: (d.itinerary ?? []).map((s) => ({
      days: s.days,
      title: s.title,
      description: s.description ?? undefined,
    })),
    updatedAt: d.updatedAt,
  };
}

/** Destinations mises en avant sur l'accueil. Renvoie [] si la base n'est pas joignable. */
export async function getFeaturedDestinations(limit = 3): Promise<DestinationSummary[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    await connectToDatabase();
    const docs = await Destination.find({ published: true })
      .sort({ featured: -1, name: 1 })
      .limit(limit)
      .lean<LeanDestination[]>();
    return docs.map(toSummary);
  } catch (error) {
    console.error("[destinations] lecture impossible :", error);
    return [];
  }
}

export type CatalogResult = {
  items: DestinationSummary[];
  total: number;
  page: number;
  pageCount: number;
};

/** Catalogue filtré et paginé. Lève une erreur si la base est injoignable. */
export async function listDestinations(filters: CatalogFilters): Promise<CatalogResult> {
  await connectToDatabase();

  const query: QueryFilter<DestinationDoc> = { published: true };
  if (filters.q) {
    const re = new RegExp(escapeRegex(filters.q), "i");
    query.$or = [{ name: re }, { country: re }];
  }
  if (filters.continent) query.continent = filters.continent;
  if (filters.style) query.styles = filters.style;
  if (filters.duree) {
    const range = DURATIONS.find((d) => d.value === filters.duree)!;
    query.durationDays = range.max ? { $gte: range.min, $lte: range.max } : { $gte: range.min };
  }

  const sort: Record<string, 1 | -1> =
    filters.tri === "nom"
      ? { name: 1 }
      : filters.tri === "duree"
        ? { durationDays: 1, name: 1 }
        : { featured: -1, name: 1 };

  const total = await Destination.countDocuments(query);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const docs = await Destination.find(query)
    .collation({ locale: "fr", strength: 1 })
    .sort(sort)
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean<LeanDestination[]>();

  return { items: docs.map(toSummary), total, page, pageCount };
}

/** Fiche d'une destination publiée (mise en cache le temps d'une requête). */
export const getDestinationBySlug = cache(async (slug: string): Promise<DestinationDetail | null> => {
  if (!isDatabaseConfigured()) return null;
  await connectToDatabase();
  const doc = await Destination.findOne({ slug: slug.toLowerCase(), published: true }).lean<LeanDestination>();
  return doc ? toDetail(doc) : null;
});

/** Slugs publiés, pour le sitemap et la pré-génération des fiches. */
export async function getPublishedSlugs(): Promise<{ slug: string; updatedAt?: Date }[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    await connectToDatabase();
    return await Destination.find({ published: true }, { slug: 1, updatedAt: 1, _id: 0 }).lean<
      { slug: string; updatedAt?: Date }[]
    >();
  } catch (error) {
    console.error("[destinations] slugs indisponibles :", error);
    return [];
  }
}

/** Noms des destinations publiées, pour les suggestions du formulaire. */
export async function getDestinationOptions(): Promise<{ slug: string; name: string }[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    await connectToDatabase();
    return await Destination.find({ published: true }, { slug: 1, name: 1, _id: 0 })
      .sort({ name: 1 })
      .limit(300)
      .lean<{ slug: string; name: string }[]>();
  } catch (error) {
    console.error("[destinations] suggestions indisponibles :", error);
    return [];
  }
}
