import type { Metadata } from "next";
import { TripWizard } from "@/components/trip/TripWizard";
import { getDestinationBySlug, getDestinationOptions } from "@/lib/destinations";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Créer mon voyage",
  description:
    "Décrivez votre voyage idéal en 5 étapes : destination, dates, voyageurs, budget et envies. Nous composons un itinéraire sur mesure.",
  alternates: { canonical: "/creer-mon-voyage" },
};

export default async function CreateTripPage({ searchParams }: PageProps<"/creer-mon-voyage">) {
  const { destination } = await searchParams;
  const slug = typeof destination === "string" ? destination.slice(0, 120) : undefined;

  const [picked, options, user] = await Promise.all([
    slug ? getDestinationBySlug(slug).catch(() => null) : null,
    getDestinationOptions(),
    getCurrentUser(),
  ]);

  return (
    <div className="container-page pt-8 pb-18 md:pt-10 md:pb-22">
      <TripWizard
        prefill={picked ? { destination: picked.name, destinationSlug: picked.slug } : null}
        options={options}
        account={user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null}
      />
    </div>
  );
}
