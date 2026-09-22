import Link from "next/link";
import { DestinationCard, type DestinationSummary } from "@/components/destinations/DestinationCard";
import { Reveal } from "@/components/ui/Reveal";

export function DestinationsPreview({ destinations }: { destinations: DestinationSummary[] }) {
  if (destinations.length === 0) return null;

  return (
    <section aria-labelledby="destinations-titre" className="container-page mt-16 flex flex-col gap-6 md:mt-22">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="destinations-titre" className="font-serif text-4xl md:text-[44px]">
          Destinations à explorer
        </h2>
        <Link href="/destinations" className="text-[15px] text-accent hover:text-accent-dark hover:underline">
          Tout le catalogue<span aria-hidden="true">▸</span>
        </Link>
      </div>
      <ul className="grid gap-7 md:grid-cols-3 md:gap-6">
        {destinations.map((d, i) => (
          <li key={d.slug}>
            <Reveal delay={i * 0.08}>
              <DestinationCard destination={d} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
