import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Demande envoyée",
  robots: { index: false },
};

export default async function ThanksPage() {
  const user = await getCurrentUser();
  return (
    <section className="container-page flex flex-col items-start gap-6 py-20 md:py-28">
      <svg aria-hidden="true" width="120" height="60" viewBox="0 0 120 60" fill="none">
        <path d="M8 50 C 40 10, 70 60, 104 14" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="6 8" />
        <circle cx="8" cy="50" r="6" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
        <circle cx="106" cy="12" r="8" fill="var(--color-accent)" />
      </svg>
      <p className="text-[13px] tracking-[0.14em] text-meta uppercase">Demande envoyée</p>
      <h1 className="max-w-3xl font-serif text-5xl leading-none tracking-[-0.02em] md:text-7xl">
        Merci ! Votre voyage <em className="text-accent">prend forme.</em>
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-muted">
        Nous avons bien reçu votre demande. Nous revenons vers vous par e-mail avec une première proposition
        d&apos;itinéraire.
      </p>
      {user ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/compte" size="lg">
            Suivre ma demande
          </ButtonLink>
          <ButtonLink href="/destinations" variant="outline" size="lg">
            Explorer d&apos;autres destinations
          </ButtonLink>
        </div>
      ) : (
        <div className="flex w-full max-w-2xl flex-col gap-4 rounded border border-line bg-card p-6 md:p-8">
          <h2 className="font-serif text-3xl leading-tight">Suivez votre demande en ligne</h2>
          <p className="text-muted">
            Créez votre compte (ou connectez-vous) depuis ce navigateur : cette demande y sera ajoutée
            automatiquement, avec son avancement.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/inscription?redirect=/compte" size="lg">
              Créer mon compte
            </ButtonLink>
            <ButtonLink href="/connexion?redirect=/compte" variant="outline" size="lg">
              J&apos;ai déjà un compte
            </ButtonLink>
          </div>
        </div>
      )}
    </section>
  );
}
