import { styleLabel } from "@/lib/catalog";
import { BUDGETS, PACES, upcomingMonths, type TripDraft } from "@/lib/trip";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const fmtDay = (iso: string) => (iso ? dateFmt.format(new Date(`${iso}T12:00:00`)) : "");

export function summarize(d: TripDraft) {
  const destination = d.undecided ? "À définir ensemble" : d.destination.trim();

  let dates = "";
  if (d.dateMode === "precises" && d.startDate && d.endDate) {
    dates = `Du ${fmtDay(d.startDate)} au ${fmtDay(d.endDate)}`;
  } else if (d.dateMode === "flexibles" && d.month) {
    const month = upcomingMonths(new Date(), 24).find((m) => m.value === d.month)?.label ?? d.month;
    dates = `${month}${d.durationDays ? ` · ${d.durationDays} jours` : ""}`;
  }

  const people = [
    `${d.adults} adulte${d.adults > 1 ? "s" : ""}`,
    d.children ? `${d.children} enfant${d.children > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const budget = BUDGETS.find((b) => b.value === d.budget)?.label;
  const travellers = budget ? `${people} · ${budget} / pers.` : people;

  const style = d.styles.length
    ? `${d.styles.map((s) => styleLabel(s)).join(", ")} · rythme ${PACES.find((p) => p.value === d.pace)?.label.toLowerCase()}`
    : "";

  return [
    { label: "Destination", value: destination },
    { label: "Dates", value: dates },
    { label: "Voyageurs & budget", value: travellers },
    { label: "Style", value: style },
  ];
}

export function TripSummary({ draft, className = "" }: { draft: TripDraft; className?: string }) {
  return (
    <section aria-labelledby="recap-titre" className={`flex flex-col gap-4.5 rounded border border-line bg-card p-7 ${className}`}>
      <h2 id="recap-titre" className="font-serif text-[30px] leading-none">
        Votre voyage
      </h2>
      <dl className="flex flex-col gap-3.5">
        {summarize(draft).map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt className="text-[13px] text-meta">{row.label}</dt>
            <dd className={`text-base ${row.value ? "" : "text-meta"}`}>{row.value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-line pt-4 text-sm leading-relaxed text-meta">
        Vos réponses sont gardées sur cet appareil : vous pouvez fermer la page et reprendre plus tard.
      </p>
    </section>
  );
}
