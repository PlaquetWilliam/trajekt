import mongoose from "mongoose";

/**
 * Connexion unique à MongoDB, réutilisée entre les requêtes
 * (et entre les rechargements à chaud en développement).
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { mongooseCache?: Cache };
const cache: Cache = (globalForMongoose.mongooseCache ??= { conn: null, promise: null });

export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI est manquant : copiez .env.example vers .env.local et renseignez-le.");
  }
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? "trajekt",
    serverSelectionTimeoutMS: 8000,
  });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}
