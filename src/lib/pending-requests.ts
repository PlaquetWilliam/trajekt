import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { TripRequest } from "@/models/TripRequest";

/**
 * Demandes envoyées sans être connecté : leurs identifiants sont gardés dans un cookie signé,
 * pour les rattacher au compte si la personne s'inscrit ou se connecte ensuite sur ce navigateur.
 */
const COOKIE = "trajekt_demandes";
const MAX_AGE = 60 * 60 * 24 * 30;

const secret = () => process.env.BETTER_AUTH_SECRET ?? "dev-secret-a-remplacer";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function read(value?: string): string[] {
  if (!value) return [];
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return [];
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return [];
  try {
    const ids = JSON.parse(Buffer.from(payload, "base64url").toString()) as unknown;
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && isValidObjectId(id)) : [];
  } catch {
    return [];
  }
}

/** À appeler depuis une Server Action, après l'envoi anonyme d'une demande. */
export async function rememberPendingRequest(id: string) {
  const store = await cookies();
  const ids = [...read(store.get(COOKIE)?.value), id].slice(-10);
  const payload = Buffer.from(JSON.stringify(ids)).toString("base64url");
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** À appeler depuis une Server Action, juste après l'inscription ou la connexion. */
export async function claimPendingRequests(userId: string) {
  const store = await cookies();
  const ids = read(store.get(COOKIE)?.value);
  if (!ids.length) return 0;
  store.delete(COOKIE);
  try {
    await connectToDatabase();
    const result = await TripRequest.updateMany(
      { _id: { $in: ids }, user: { $exists: false } },
      { $set: { user: userId } },
    );
    return result.modifiedCount;
  } catch (error) {
    console.error("[demandes] rattachement impossible :", error);
    return 0;
  }
}
