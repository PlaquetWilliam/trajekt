import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { n: "01", title: "Vos envies", text: "Un questionnaire guidé : destination, dates, budget, style de voyage." },
  { n: "02", title: "Votre itinéraire", text: "Nous vous proposons un parcours détaillé, ajustable à volonté." },
  { n: "03", title: "Le départ", text: "Suivez votre demande depuis votre espace client, jusqu'au jour J." },
];

export function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      aria-labelledby="comment-ca-marche-titre"
      className="container-page mt-16 scroll-mt-8 md:mt-22"
    >
      <div className="flex flex-col gap-8 border-t border-line pt-10">
        <h2 id="comment-ca-marche-titre" className="font-serif text-4xl md:text-[44px]">
          Comment ça marche
        </h2>
        <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
          {steps.map((step, i) => (
            <li key={step.n}>
              <Reveal delay={i * 0.1} className="flex flex-col gap-2.5">
                <span className="font-serif text-[40px] leading-none text-accent" aria-hidden="true">
                  {step.n}
                </span>
                <h3 className="text-[19px] font-semibold">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
