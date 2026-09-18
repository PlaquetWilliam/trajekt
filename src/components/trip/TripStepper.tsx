import { TRIP_STEPS } from "@/lib/trip";
import { CheckIcon } from "@/components/form/fields";

/** Progression : étapes cliquables quand elles ont déjà été atteintes. */
export function TripStepper({
  current,
  reached,
  onSelect,
}: {
  current: number;
  reached: number;
  onSelect: (step: number) => void;
}) {
  return (
    <nav aria-label="Étapes du formulaire">
      {/* Mobile : barre de progression */}
      <div className="flex flex-col gap-2.5 md:hidden">
        <p className="flex justify-between text-[13px] text-meta">
          <span>
            Étape {current + 1} sur {TRIP_STEPS.length}
          </span>
          <span>{TRIP_STEPS[current].label}</span>
        </p>
        <div className="grid grid-cols-5 gap-1" aria-hidden="true">
          {TRIP_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 rounded-full transition-colors duration-300 ${
                i < current ? "bg-ink" : i === current ? "bg-accent" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Ordinateur : étapes nommées */}
      <ol className="hidden items-center gap-2.5 md:flex">
        {TRIP_STEPS.map((s, i) => {
          const done = i < current;
          const isCurrent = i === current;
          const clickable = i !== current && i <= reached;
          const dot = (
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] transition-colors duration-300 ${
                isCurrent
                  ? "bg-accent font-semibold text-card"
                  : done
                    ? "bg-ink text-paper"
                    : "border border-line text-meta"
              }`}
            >
              {done ? <CheckIcon size={14} /> : i + 1}
            </span>
          );
          const label = (
            <span className={`text-sm whitespace-nowrap ${isCurrent ? "font-semibold text-ink" : "text-meta"}`}>{s.label}</span>
          );
          return (
            <li key={s.id} className="contents">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`min-w-3 flex-1 border-t border-dashed transition-colors ${i <= current ? "border-accent" : "border-line"}`}
                />
              )}
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  className="flex items-center gap-2.5 rounded-full hover:[&>span:nth-child(2)]:text-accent"
                >
                  {dot}
                  {label}
                  <span className="sr-only">{done ? " (terminée, modifier)" : " (reprendre)"}</span>
                </button>
              ) : (
                <span className="flex items-center gap-2.5" aria-current={isCurrent ? "step" : undefined}>
                  {dot}
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
