import "server-only";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/mongodb";
import { Destination } from "@/models/Destination";
import type { DestinationSummary } from "@/components/destinations/DestinationCard";

/** Destinations mises en avant sur l'accueil. Renvoie [] si la base n'est pas joignable. */
export async function getFeaturedDestinations(limit = 3): Promise<DestinationSummary[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    await connectToDatabase();
    const docs = await Destination.find({ published: true })
      .sort({ featured: -1, name: 1 })
      .limit(limit)
      .lean();

    return docs.map((d) => ({
      slug: d.slug,
      name: d.name,
      country: d.country,
      style: d.styles?.[0] ?? "Sur mesure",
      duration: d.durationDays ? `${d.durationDays} jours` : "Durée libre",
      image: d.image?.src ? { src: d.image.src, alt: d.image.alt ?? d.name } : undefined,
    }));
  } catch (error) {
    console.error("[destinations] lecture impossible :", error);
    return [];
  }
}
