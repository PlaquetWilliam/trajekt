import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Itinerary } from "@/components/destinations/Itinerary";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getDestinationBySlug, getPublishedSlugs, type DestinationDetail } from "@/lib/destinations";
import { catalogHref, formatBudget, formatDuration, styleLabel, type ContinentValue } from "@/lib/catalog";
import { site } from "@/lib/site";

// Les fiches sont régénérées au plus toutes les 10 minutes ; les nouvelles sont créées à la demande.
export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return { title: "Destination introuvable", robots: { index: false } };

  return {
    title: `${destination.name} — voyage sur mesure`,
    description: destination.summary,
    alternates: { canonical: `/destinations/${destination.slug}` },
    openGraph: {
      title: `${destination.name} · ${site.name}`,
      description: destination.summary,
      type: "article",
      images: destination.image ? [{ url: destination.image.src, alt: destination.image.alt }] : undefined,
    },
  };
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const d = destination;
  const createHref = `/creer-mon-voyage?destination=${encodeURIComponent(d.slug)}`;

  const facts = [
    d.durationDays && { label: "Durée conseillée", value: formatDuration(d.durationDays) },
    d.bestPeriod && { label: "Meilleure période", value: d.bestPeriod },
    d.budgetFrom != null && { label: "Budget indicatif", value: `À partir de ${formatBudget(d.budgetFrom)} / pers.` },
    d.styles.length > 0 && { label: d.styles.length > 1 ? "Styles" : "Style", value: d.styles.map((s) => styleLabel(s)).join(", ") },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <article className="container-page flex flex-col gap-8 pt-7 pb-18 md:gap-10 md:pb-24">
      <JsonLd destination={d} />

      <nav aria-label="Fil d'Ariane" className="text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-meta">
          <li>
            <Link href="/" className="text-accent hover:underline">Accueil</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/destinations" className="text-accent hover:underline">Destinations</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{d.name}</li>
        </ol>
      </nav>

      <div className="relative aspect-[4/3] overflow-hidden rounded sm:aspect-[16/7]">
        {d.image ? (
          <Image
            src={d.image.src}
            alt={d.image.alt}
            fill
            preload
            sizes="(min-width: 1280px) 1136px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="hatch size-full" aria-hidden="true" />
        )}
      </div>

      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-18">
        <div className="flex flex-col gap-10">
          <header className="flex flex-col gap-3.5">
            <p className="text-[13px] tracking-[0.14em] text-meta uppercase">
              {d.country} · <Link href={catalogHref({ continent: d.continent as ContinentValue })} className="hover:text-accent">{d.continentLabel}</Link>
            </p>
            <h1 className="font-serif text-[52px] leading-none tracking-[-0.02em] md:text-[80px]">{d.name}</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted md:text-[19px]">{d.summary}</p>
          </header>

          {facts.length > 0 && (
            <dl className="grid grid-cols-2 gap-6 border-y border-line py-6 md:flex md:flex-wrap md:gap-x-12">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-1">
                  <dt className="text-[13px] text-meta">{f.label}</dt>
                  <dd className="text-[17px] font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Appel à l'action visible tôt sur mobile */}
          <div className="lg:hidden">
            <ButtonLink href={createHref} size="lg" className="w-full">
              Créer ce voyage
            </ButtonLink>
          </div>

          {d.description && (
            <section aria-labelledby="presentation" className="flex flex-col gap-4">
              <h2 id="presentation" className="font-serif text-4xl md:text-[44px]">Le voyage</h2>
              <p className="max-w-2xl text-[17px] leading-relaxed whitespace-pre-line text-muted">{d.description}</p>
            </section>
          )}

          {d.itinerary.length > 0 && (
            <section aria-labelledby="itineraire" className="flex flex-col gap-6">
              <h2 id="itineraire" className="font-serif text-4xl md:text-[44px]">Exemple d&apos;itinéraire</h2>
              <Itinerary steps={d.itinerary} />
            </section>
          )}

          {d.gallery.length > 0 && (
            <section aria-labelledby="galerie" className="flex flex-col gap-5">
              <h2 id="galerie" className="font-serif text-4xl md:text-[44px]">En images</h2>
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {d.gallery.map((img) => (
                  <li key={img.src} className="relative aspect-[4/3] overflow-hidden rounded">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside
          aria-labelledby="cta-titre"
          className="flex flex-col gap-4.5 rounded border border-line bg-card p-7 lg:sticky lg:top-6"
        >
          <h2 id="cta-titre" className="font-serif text-[32px] leading-[1.05]">
            Envie de découvrir <em className="text-accent">{d.name}</em> ?
          </h2>
          <p className="text-[15px] leading-relaxed text-muted">
            Partez de cet exemple : nous l&apos;adaptons à vos dates, votre budget et vos envies.
          </p>
          <ButtonLink href={createHref} size="lg">
            Créer ce voyage
          </ButtonLink>
          <Link href="/destinations" className="text-center text-[15px] text-accent hover:underline">
            Voir d&apos;autres destinations
          </Link>
        </aside>
      </div>
    </article>
  );
}

function JsonLd({ destination: d }: { destination: DestinationDetail }) {
  const url = `${site.url}/destinations/${d.slug}`;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: d.name,
      description: d.summary,
      url,
      image: d.image?.src,
      touristType: d.styles.map((s) => styleLabel(s)),
      provider: { "@type": "TravelAgency", name: site.name, url: site.url },
      itinerary: d.itinerary.length
        ? {
            "@type": "ItemList",
            itemListElement: d.itinerary.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "TouristDestination", name: s.title, description: s.description },
            })),
          }
        : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
        { "@type": "ListItem", position: 2, name: "Destinations", item: `${site.url}/destinations` },
        { "@type": "ListItem", position: 3, name: d.name, item: url },
      ],
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
