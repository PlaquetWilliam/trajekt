import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

// Client MongoDB dédié à l'authentification (la connexion ne s'ouvre qu'à la première requête).
// Sans MONGODB_URI (ex. build local), une adresse factice évite de planter au chargement.
const client = new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017");
const db = client.db(process.env.MONGODB_DB ?? "trajekt");

export const auth = betterAuth({
  appName: "Trajekt",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, {
    client,
    // Atlas gère les transactions ; une base locale autonome non : mettre MONGODB_TRANSACTIONS=false
    transaction: process.env.MONGODB_TRANSACTIONS !== "false",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: true, input: true },
      lastName: { type: "string", required: true, input: true },
      // Jamais modifiable depuis un formulaire : se change avec  npm run admin -- <email>
      role: { type: "string", required: false, defaultValue: "user", input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 jours
    updateAge: 60 * 60 * 24, // prolongée au plus une fois par jour
  },
  rateLimit: { enabled: true, window: 60, max: 30 },
  // Doit rester le dernier plugin : écrit les cookies depuis les Server Actions
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
