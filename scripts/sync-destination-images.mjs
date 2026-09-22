// Associe les photos déposées dans public/destinations/ aux destinations en base.
// Usage : npm run images   (lit MONGODB_URI dans .env.local)
//
// Convention de nommage — le nom du fichier reprend le slug de la destination :
//   public/destinations/kyoto-et-environs.jpg      -> photo principale (carte + haut de fiche)
//   public/destinations/kyoto-et-environs-2.jpg    -> galerie « En images »
//   public/destinations/kyoto-et-environs-3.jpg    -> galerie (suite)
//
// Textes alternatifs (accessibilité, fortement conseillé) :
//   public/destinations/alt.json  ->  { "kyoto-et-environs.jpg": "Description de la photo" }
//   Sans entrée, le nom de la destination est utilisé par défaut.
//
// Une destination sans fichier correspondant n'est pas modifiée : elle garde
// son motif hachuré. Relancer le script après avoir ajouté ou retiré une photo.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI manquant (.env.local).");
  process.exit(1);
}

const IMAGES_DIR = path.join(process.cwd(), "public", "destinations");
const PUBLIC_PREFIX = "/destinations";
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/** Fichiers image présents dans public/destinations/. */
async function readImageFiles() {
  try {
    const entries = await readdir(IMAGES_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && EXTENSIONS.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`Dossier introuvable : ${IMAGES_DIR}`);
      process.exit(1);
    }
    throw error;
  }
}

/** Textes alternatifs optionnels, indexés par nom de fichier. */
async function readAltTexts() {
  try {
    return JSON.parse(await readFile(path.join(IMAGES_DIR, "alt.json"), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    console.warn("⚠ alt.json illisible, il sera ignoré :", error.message);
    return {};
  }
}

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB ?? "trajekt" });
const collection = mongoose.connection.collection("destinations");

const destinations = await collection
  .find({}, { projection: { slug: 1, name: 1, country: 1 } })
  .toArray();

if (destinations.length === 0) {
  console.error("Aucune destination en base. Lancez d'abord « npm run seed ».");
  await mongoose.disconnect();
  process.exit(1);
}

const files = await readImageFiles();
const alts = await readAltTexts();

// Les slugs les plus longs sont testés d'abord : « corse-du-sud » l'emporte sur « corse ».
const slugs = destinations.map((d) => d.slug).sort((a, b) => b.length - a.length);

/** Rattache un fichier à un slug : <slug>.jpg (principale) ou <slug>-2.jpg (galerie). */
function matchFile(fileName) {
  const base = path.basename(fileName, path.extname(fileName)).toLowerCase();
  for (const slug of slugs) {
    if (base === slug) return { slug, order: 1 };
    const suffix = base.startsWith(`${slug}-`) ? base.slice(slug.length + 1) : null;
    if (suffix && /^\d+$/.test(suffix)) return { slug, order: Number(suffix) };
  }
  return null;
}

const bySlug = new Map();
const orphans = [];

for (const file of files) {
  const match = matchFile(file);
  if (!match) {
    orphans.push(file);
    continue;
  }
  const list = bySlug.get(match.slug) ?? [];
  list.push({ ...match, file });
  bySlug.set(match.slug, list);
}

let updated = 0;

for (const destination of destinations) {
  const found = bySlug.get(destination.slug);
  if (!found) continue;

  const fallbackAlt = `${destination.name}${destination.country ? ` — ${destination.country}` : ""}`;
  const images = found
    .sort((a, b) => a.order - b.order)
    .map(({ file }) => ({
      src: `${PUBLIC_PREFIX}/${file}`,
      alt: alts[file]?.trim() || fallbackAlt,
    }));

  const [main, ...gallery] = images;

  await collection.updateOne(
    { slug: destination.slug },
    { $set: { image: main, gallery, updatedAt: new Date() } },
  );

  updated += 1;
  const galleryNote = gallery.length ? ` (+ ${gallery.length} en galerie)` : "";
  console.log(`✓ ${destination.name} → ${main.src}${galleryNote}`);
}

const missing = destinations.filter((d) => !bySlug.has(d.slug));
for (const d of missing) console.log(`· ${d.name} : aucune photo (${d.slug}.jpg attendu)`);
for (const file of orphans) console.warn(`⚠ ${file} ne correspond à aucun slug de destination.`);

const withoutAlt = files.filter((f) => !orphans.includes(f) && !alts[f]);
if (withoutAlt.length > 0) {
  console.log(`\n${withoutAlt.length} photo(s) sans texte alternatif dans alt.json :`);
  for (const file of withoutAlt) console.log(`   "${file}": ""`);
}

console.log(`\n${updated} destination(s) mise(s) à jour.`);
await mongoose.disconnect();
