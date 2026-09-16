import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { DestinationsPreview } from "@/components/home/DestinationsPreview";
import { CtaBanner } from "@/components/home/CtaBanner";
import { getFeaturedDestinations } from "@/lib/destinations";
import { site } from "@/lib/site";

// Régénère la page au plus toutes les 10 minutes (nouvelles destinations)
export const revalidate = 600;

export default async function HomePage() {
  const destinations = await getFeaturedDestinations();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: site.name,
    description: site.description,
    url: site.url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <HowItWorks />
      <DestinationsPreview destinations={destinations} />
      <CtaBanner />
    </>
  );
}
