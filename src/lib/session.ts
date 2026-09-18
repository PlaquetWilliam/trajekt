import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
};

/** Utilisateur connecté (ou null). Une seule lecture par requête. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // headers() / cookies() hors du try : Next doit voir que la page dépend de la requête.
  // On repart des cookies « à jour » : si une Server Action vient de renouveler la session
  // (ex. changement de mot de passe), le nouveau jeton est pris en compte tout de suite.
  const requestHeaders = new Headers(await headers());
  const cookieStore = await cookies();
  requestHeaders.set("cookie", cookieStore.toString());
  try {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) return null;
    const u = session.user;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      firstName: (u.firstName as string | undefined) ?? u.name.split(" ")[0] ?? "",
      lastName: (u.lastName as string | undefined) ?? "",
      isAdmin: u.role === "admin",
    };
  } catch (error) {
    console.error("[session] lecture impossible :", error);
    return null;
  }
});

/** À appeler en tête de chaque page / action protégée. */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?redirect=${encodeURIComponent(returnTo)}`);
  return user;
}

/** N'accepte que des chemins internes (évite les redirections vers un autre site). */
export function safeRedirect(value: unknown, fallback = "/compte") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : fallback;
}

/** Réservé aux administrateurs : les autres reçoivent une page 404 (l'espace reste invisible). */
export async function requireAdmin(returnTo: string): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  if (!user.isAdmin) notFound();
  return user;
}
