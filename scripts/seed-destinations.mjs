// Ajoute quelques destinations d'exemple pour le développement.
// Usage : npm run seed   (lit MONGODB_URI dans .env.local)
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI manquant (.env.local).");
  process.exit(1);
}

const examples = [
  {
    slug: "lisbonne-porto",
    name: "Lisbonne & Porto",
    country: "Portugal",
    continent: "Europe",
    styles: ["Culture & patrimoine", "Gastronomie"],
    durationDays: 8,
    summary: "Deux villes, un fleuve et l'océan : un premier voyage au Portugal à votre rythme.",
    featured: true,
  },
  {
    slug: "kyoto-et-environs",
    name: "Kyoto et environs",
    country: "Japon",
    continent: "Asie",
    styles: ["Culture & patrimoine", "Bien-être"],
    durationDays: 12,
    summary: "Temples, jardins et auberges traditionnelles, entre Kyoto, Nara et la campagne.",
    featured: true,
  },
  {
    slug: "patagonie",
    name: "Patagonie",
    country: "Argentine & Chili",
    continent: "Amériques",
    styles: ["Nature & randonnée", "Aventure"],
    durationDays: 15,
    summary: "Glaciers, lacs et sentiers au bout du monde, pour les amoureux de grands espaces.",
    featured: true,
  },
];

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB ?? "trajekt" });
const collection = mongoose.connection.collection("destinations");
for (const d of examples) {
  await collection.updateOne(
    { slug: d.slug },
    { $set: { ...d, published: true, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );
  console.log("✓", d.name);
}
await mongoose.disconnect();
