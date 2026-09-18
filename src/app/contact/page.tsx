import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LegalPage } from "@/components/legal/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur un voyage, votre compte ou vos données ? Contactez l'équipe Trajekt.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { editor } = legal;
  return (
    <LegalPage
      eyebrow="Contact"
      title={
        <>
          Parlons de <em className="text-accent">votre voyage</em>
        </>
      }
    >
      <p>
        Pour un nouveau projet, le plus simple est de passer par notre formulaire : il nous donne toutes les
        informations utiles pour vous répondre vite.
      </p>
      <div>
        <ButtonLink href="/creer-mon-voyage" size="lg">
          Créer mon voyage
        </ButtonLink>
      </div>

      <section aria-labelledby="ecrire" className="grid gap-4 sm:grid-cols-2">
        <h2 id="ecrire" className="sr-only">
          Nous écrire ou nous appeler
        </h2>
        <div className="flex flex-col gap-2 rounded border border-line bg-card p-6">
          <p className="text-[13px] tracking-[0.12em] text-meta uppercase">E-mail</p>
          <a href={`mailto:${editor.email}`} className="font-serif text-2xl break-all text-ink hover:text-accent">
            {editor.email}
          </a>
        </div>
        <div className="flex flex-col gap-2 rounded border border-line bg-card p-6">
          <p className="text-[13px] tracking-[0.12em] text-meta uppercase">Téléphone</p>
          <a href={`tel:${editor.phone.replace(/\s/g, "")}`} className="font-serif text-2xl text-ink hover:text-accent">
            {editor.phone}
          </a>
        </div>
      </section>

      <p>
        Vous avez déjà envoyé une demande ? Retrouvez son avancement dans{" "}
        <Link href="/compte">votre espace client</Link>.
      </p>
    </LegalPage>
  );
}
