import mongoose from "mongoose";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/** Décrit l'URI de connexion sans jamais exposer l'identifiant ni le mot de passe. */
function describeUri(uri?: string) {
  if (!uri) return { defini: false as const };
  try {
    // On remplace le schéma pour pouvoir utiliser URL() sur mongodb+srv://
    const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, "https://"));
    return {
      defini: true as const,
      srv: uri.startsWith("mongodb+srv://"),
      hote: parsed.host,
      utilisateurRenseigne: Boolean(parsed.username),
      motDePasseRenseigne: Boolean(parsed.password),
      // Détecte les guillemets ou espaces collés par erreur dans le tableau de bord
      caracteresParasites: /^["'\s]|["'\s]$/.test(uri),
    };
  } catch {
    return { defini: true as const, illisible: true as const };
  }
}

/** Utilisé par Render pour vérifier que le service répond. */
export async function GET() {
  let database: "non configurée" | "ok" | "erreur" = "non configurée";
  let erreur: { code?: string; message?: string } | undefined;

  if (isDatabaseConfigured()) {
    try {
      await connectToDatabase();
      await mongoose.connection.db?.admin().ping();
      database = "ok";
    } catch (error) {
      database = "erreur";
      const e = error as { code?: string; message?: string };
      erreur = { code: e.code, message: e.message };
    }
  }

  return Response.json({
    status: "ok",
    database,
    erreur,
    uri: describeUri(process.env.MONGODB_URI),
    baseCible: process.env.MONGODB_DB ?? "trajekt",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    authUrl: process.env.BETTER_AUTH_URL ?? null,
  });
}
