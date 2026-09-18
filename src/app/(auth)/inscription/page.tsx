import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { SignupForm } from "@/components/auth/AuthForms";
import { getCurrentUser, safeRedirect } from "@/lib/session";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Trajekt pour suivre vos demandes de voyage sur mesure.",
  alternates: { canonical: "/inscription" },
};

export default async function SignupPage({ searchParams }: PageProps<"/inscription">) {
  const redirectTo = safeRedirect((await searchParams).redirect);
  if (await getCurrentUser()) redirect(redirectTo);

  return (
    <>
      <AuthTabs current="inscription" redirectTo={redirectTo} />
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-[44px] leading-none md:text-5xl">Créer votre compte</h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Suivez vos demandes de voyage et leur avancement, au même endroit.
        </p>
      </div>
      <SignupForm redirectTo={redirectTo} />
      <p className="text-center text-[15px] text-muted">
        Déjà inscrit ?{" "}
        <Link href={`/connexion?redirect=${encodeURIComponent(redirectTo)}`} className="text-accent underline-offset-2 hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
