import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Les pages destinations seront ajoutées ici depuis MongoDB
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/destinations`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/creer-mon-voyage`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
