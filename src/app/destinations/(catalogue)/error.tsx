"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";

export default function DestinationsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-start gap-5 py-24" role="alert">
      <h1 className="font-serif text-4xl md:text-5xl">Le catalogue est momentanément indisponible.</h1>
      <p className="max-w-xl text-lg text-muted">
        Nous n&apos;arrivons pas à charger les destinations. Réessayez dans quelques instants.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-[15px] font-semibold text-card hover:bg-accent-dark"
        >
          Réessayer
        </button>
        <ButtonLink href="/" variant="outline">
          Retour à l&apos;accueil
        </ButtonLink>
      </div>
    </div>
  );
}
