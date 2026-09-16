import mongoose from "mongoose";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/** Utilisé par Render pour vérifier que le service répond. */
export async function GET() {
  let database: "non configurée" | "ok" | "erreur" = "non configurée";
  if (isDatabaseConfigured()) {
    try {
      await connectToDatabase();
      await mongoose.connection.db?.admin().ping();
      database = "ok";
    } catch {
      database = "erreur";
    }
  }
  return Response.json({ status: "ok", database });
}
