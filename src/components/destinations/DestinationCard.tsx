import Image from "next/image";
import Link from "next/link";

export type DestinationSummary = {
  slug: string;
  name: string;
  country: string;
  style: string;
  duration: string;
  image?: { src: string; alt: string };
};

export function DestinationCard({ destination }: { destination: DestinationSummary }) {
  const { slug, name, country, style, duration, image } = destination;
  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-[3/2] overflow-hidden rounded">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="hatch size-full" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-[26px] leading-tight">
          <Link href={`/destinations/${slug}`} className="text-ink after:absolute after:inset-0 hover:text-accent">
            {name}
          </Link>
        </h3>
        <span className="shrink-0 text-[13px] text-meta">{duration}</span>
      </div>
      <p className="text-sm text-muted">
        {country} · {style}
      </p>
    </article>
  );
}
