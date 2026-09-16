import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <section className="container-page flex flex-col items-start gap-6 py-24">
      <p className="text-[13px] tracking-[0.14em] text-meta uppercase">Erreur 404</p>
      <h1 className="font-serif text-5xl md:text-7xl">
        Cette étape <em className="text-accent">n&apos;existe pas</em> (encore).
      </h1>
      <p className="max-w-lg text-lg text-muted">
        La page que vous cherchez a peut-être changé d&apos;adresse, ou elle est encore en construction.
      </p>
      <ButtonLink href="/" size="lg">
        Retour à l&apos;accueil
      </ButtonLink>
    </section>
  );
}
