"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
// Photos du collage : importées depuis src/assets pour que Next génère
// les tailles, le format AVIF/WebP et le flou de chargement automatiquement.
import islande from "@/assets/Image1.jpg";
import grece from "@/assets/Image2.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="container-page grid items-center gap-12 pt-10 md:grid-cols-2 md:gap-14 md:pt-18">
      <motion.div
        className="flex flex-col gap-6 md:gap-7"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <p className="text-[13px] tracking-[0.14em] text-meta uppercase">Voyages sur mesure</p>
        <h1 className="font-serif text-[50px] leading-none tracking-[-0.02em] md:text-[84px] md:leading-[0.98]">
          Le voyage que vous imaginez, <em className="text-accent">tracé pour vous.</em>
        </h1>
        <p className="max-w-[460px] text-[17px] leading-relaxed text-muted md:text-[19px]">
          Dites-nous vos envies, votre rythme et votre budget. Nous composons un itinéraire
          unique, étape par étape.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/creer-mon-voyage" size="lg">
            Créer mon voyage
          </ButtonLink>
          <ButtonLink href="/destinations" variant="outline" size="lg">
            Explorer les destinations
          </ButtonLink>
        </div>
      </motion.div>

      <HeroCollage />
    </section>
  );
}

/**
 * Collage de la page d'accueil. Pour changer une photo : remplacez le fichier
 * dans src/assets (ou l'import ci-dessus) et mettez à jour le texte alternatif.
 */
function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px]">
      <motion.div
        className="hatch absolute top-[5%] left-[0%] h-[68%] w-[54%] overflow-hidden rounded"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease }}
      >
        <Image
          src={islande}
          alt="Cascade au fond d'une vallée islandaise, au bout d'un ponton de bois."
          fill
          sizes="(min-width: 768px) 302px, 54vw"
          placeholder="blur"
          priority
          className="object-cover"
        />
      </motion.div>

      <motion.div
        className="absolute top-[15%] left-[45%] flex -rotate-2 flex-col gap-1 rounded border border-line bg-card px-8 py-3"
        initial={{ opacity: 0, rotate: -8 }}
        animate={{ opacity: 1, rotate: -2 }}
        transition={{ delay: 0.8, duration: 0.8, ease }}
      >
        <span className="font-serif text-[12px] italic md:text-[22px]">Islande</span>
      </motion.div>

      <motion.div
        className="hatch absolute top-[35%] right-[0%] h-[61%] w-[60%] overflow-hidden rounded shadow-[0_18px_40px_rgb(31_28_23/0.12)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease }}
      >
        <Image
          src={grece}
          alt="Crique grecque aux eaux turquoise et transparentes, bordée de collines boisées."
          fill
          sizes="(min-width: 768px) 336px, 60vw"
          placeholder="blur"
          className="object-cover"
        />
      </motion.div>

      <motion.div
        className="absolute top-[80%] left-[30%] flex -rotate-2 flex-col gap-1 rounded border border-line bg-card px-8 py-3"
        initial={{ opacity: 0, rotate: -8 }}
        animate={{ opacity: 1, rotate: -2 }}
        transition={{ delay: 1.6, duration: 0.8, ease }}
      >
        <span className="font-serif text-[12px] italic md:text-[22px]">Grèce</span>
      </motion.div>
    </div>
  );
}
