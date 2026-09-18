import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/destinations";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const destinations = await getPublishedSlugs();
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/destinations`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/creer-mon-voyage`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${site.url}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    ...destinations.map((d) => ({
      url: `${site.url}/destinations/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
