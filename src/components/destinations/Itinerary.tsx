import { Reveal } from "@/components/ui/Reveal";
import type { DestinationDetail } from "@/lib/destinations";

/** Frise « carnet de route » : étapes reliées par un tracé pointillé. */
export function Itinerary({ steps }: { steps: DestinationDetail["itinerary"] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li
            key={`${step.days}-${step.title}`}
            className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-4 sm:grid-cols-[110px_28px_minmax(0,1fr)]"
          >
            <span className="hidden pt-1.5 text-sm text-meta sm:block">{step.days}</span>
            <span className="flex flex-col items-center" aria-hidden="true">
              <span
                className={`mt-2 size-3.5 shrink-0 rounded-full ${
                  last ? "bg-accent" : "border-2 border-ink bg-paper"
                }`}
              />
              {!last && <span className="mt-1 w-0 flex-1 border-l-2 border-dashed border-accent" />}
            </span>
            <Reveal delay={i * 0.06} className="flex flex-col gap-1 pb-7">
              <span className="text-sm text-meta sm:hidden">{step.days}</span>
              <h3 className="font-serif text-[28px] leading-tight">{step.title}</h3>
              {step.description && <p className="text-[15px] leading-relaxed text-muted">{step.description}</p>}
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
