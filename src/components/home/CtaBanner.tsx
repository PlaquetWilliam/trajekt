import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBanner() {
  return (
    <section className="container-page my-16 md:my-26">
      <Reveal className="flex flex-col gap-6 rounded border border-line bg-card px-6 py-8 md:flex-row md:items-center md:justify-between md:p-14">
        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-4xl leading-none md:text-[52px]">
            Prêt à tracer <em className="text-accent">votre</em> route ?
          </h2>
          <p className="text-[17px] text-muted">
            Quelques minutes suffisent pour décrire votre voyage idéal.
          </p>
        </div>
        <ButtonLink href="/creer-mon-voyage" size="lg">
          Créer mon voyage
        </ButtonLink>
      </Reveal>
    </section>
  );
}
