import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentUser, safeRedirect } from "@/lib/session";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Trajekt pour suivre vos demandes de voyage.",
  alternates: { canonical: "/connexion" },
};

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const redirectTo = safeRedirect((await searchParams).redirect);
  if (await getCurrentUser()) redirect(redirectTo);

  return (
    <>
      <AuthTabs current="connexion" redirectTo={redirectTo} />
      <h1 className="font-serif text-[44px] leading-none md:text-5xl">Bon retour parmi nous</h1>
      <LoginForm redirectTo={redirectTo} />
      <p className="text-center text-[15px] text-muted">
        Pas encore de compte ?{" "}
        <Link href={`/inscription?redirect=${encodeURIComponent(redirectTo)}`} className="text-accent underline-offset-2 hover:underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}
