// Donne (ou retire) le rôle administrateur à un compte existant.
// Usage :  npm run admin -- camille@exemple.fr
//          npm run admin -- camille@exemple.fr --retirer
// En production : lancez-le depuis votre ordinateur avec la MONGODB_URI de production dans .env.local,
// ou depuis le Shell du service Render :  node scripts/set-admin.mjs camille@exemple.fr
import { MongoClient } from "mongodb";

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Indiquez l'adresse e-mail du compte :  npm run admin -- vous@exemple.fr");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI manquant (.env.local).");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const users = client.db(process.env.MONGODB_DB ?? "trajekt").collection("user");
  const role = flag === "--retirer" ? "user" : "admin";
  const result = await users.updateOne({ email: email.trim().toLowerCase() }, { $set: { role } });
  if (result.matchedCount === 0) {
    console.error(`Aucun compte trouvé pour ${email}. Créez d'abord le compte sur le site.`);
    process.exitCode = 1;
  } else {
    console.log(role === "admin" ? `✓ ${email} est administrateur.` : `✓ ${email} n'est plus administrateur.`);
  }
} finally {
  await client.close();
}
