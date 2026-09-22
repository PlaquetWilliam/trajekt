// Ajoute (ou met à jour) des destinations d'exemple pour le développement.
// Usage : npm run seed   (lit MONGODB_URI dans .env.local)
// Les textes sont indicatifs : remplacez-les par vos propres contenus.
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
    continent: "europe",
    styles: ["culture", "gastronomie"],
    durationDays: 8,
    bestPeriod: "D'avril à octobre",
    summary: "Deux villes, un fleuve et l'océan : un premier voyage au Portugal à votre rythme.",
    description:
      "Des ruelles de l'Alfama aux quais du Douro, ce voyage relie les deux grandes villes du Portugal en prenant le temps : tramways, belvédères, cafés et une journée au bord de l'Atlantique.",
    itinerary: [
      { days: "Jours 1–3", title: "Lisbonne", description: "Alfama, Baixa, Belém et les miradouros au coucher du soleil." },
      { days: "Jour 4", title: "Sintra", description: "Palais et jardins dans la forêt, puis retour par la côte." },
      { days: "Jours 5–7", title: "Porto", description: "Ribeira, caves de Vila Nova de Gaia, balade sur le Douro." },
      { days: "Jour 8", title: "Retour", description: "Dernier café au comptoir avant le départ." },
    ],
    featured: true,
  },
  {
    slug: "kyoto-et-environs",
    name: "Kyoto et environs",
    country: "Japon",
    continent: "asie",
    styles: ["culture", "bien-etre"],
    durationDays: 12,
    bestPeriod: "Printemps et automne",
    summary: "Temples, jardins et auberges traditionnelles, entre Kyoto, Nara et la campagne.",
    description:
      "Un voyage au rythme des saisons japonaises : temples et jardins de Kyoto, cerfs de Nara, nuit en ryokan et bains chauds dans les montagnes.",
    itinerary: [
      { days: "Jours 1–5", title: "Kyoto", description: "Temples, jardins zen, marché de Nishiki et quartier de Gion." },
      { days: "Jour 6", title: "Nara", description: "Grands temples et parc aux cerfs." },
      { days: "Jours 7–9", title: "Campagne et onsen", description: "Nuits en ryokan, randonnées douces et bains chauds." },
      { days: "Jours 10–12", title: "Osaka", description: "Cuisine de rue et dernières découvertes avant le vol." },
    ],
    featured: true,
  },
  {
    slug: "patagonie",
    name: "Patagonie",
    country: "Argentine & Chili",
    continent: "ameriques",
    styles: ["nature", "aventure"],
    durationDays: 15,
    bestPeriod: "De novembre à mars",
    summary: "Glaciers, lacs et sentiers au bout du monde, pour les amoureux de grands espaces.",
    itinerary: [
      { days: "Jours 1–2", title: "Buenos Aires", description: "Arrivée et premiers pas en Argentine." },
      { days: "Jours 3–6", title: "El Calafate", description: "Glacier Perito Moreno et navigation sur le lac Argentino." },
      { days: "Jours 7–10", title: "El Chaltén", description: "Randonnées au pied du Fitz Roy." },
      { days: "Jours 11–15", title: "Torres del Paine", description: "Le parc national chilien, entre lacs et massifs." },
    ],
    featured: true,
  },
  {
    slug: "islande-route-circulaire",
    name: "Islande, la route circulaire",
    country: "Islande",
    continent: "europe",
    styles: ["nature", "road-trip"],
    durationDays: 10,
    bestPeriod: "De juin à septembre",
    summary: "Cascades, volcans et fjords au volant, en suivant la route qui fait le tour de l'île.",
  },
  {
    slug: "marrakech-atlas",
    name: "Marrakech & l'Atlas",
    country: "Maroc",
    continent: "afrique",
    styles: ["culture", "famille"],
    durationDays: 7,
    bestPeriod: "Printemps et automne",
    summary: "Souks et riads à Marrakech, puis villages berbères dans les montagnes de l'Atlas.",
  },
  {
    slug: "vietnam-nord-sud",
    name: "Vietnam du nord au sud",
    country: "Vietnam",
    continent: "asie",
    styles: ["culture", "gastronomie", "nature"],
    durationDays: 18,
    summary: "De Hanoï au delta du Mékong, en passant par la baie d'Halong et Hội An.",
  },
];

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB ?? "trajekt" });
const collection = mongoose.connection.collection("destinations");
for (const d of examples) {
  await collection.updateOne(
    { slug: d.slug },
    {
      // image / gallery ne sont pas touchés ici : ils sont gérés par « npm run images ».
      $set: { published: true, itinerary: [], ...d, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date(), gallery: [] },
    },
    { upsert: true },
  );
  console.log("✓", d.name);
}
await mongoose.disconnect();
