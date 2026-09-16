"use client";

import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/ButtonLink";

const ease = [0.22, 1, 0.36, 1] as const;
const ROUTE = "M120 110 C 260 60, 250 300, 410 250 S 470 470, 380 500";

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

function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden="true">
      {/* Remplacer ces zones par des <Image> (next/image) quand les photos seront prêtes */}
      <motion.div
        className="hatch absolute top-[5%] left-0 h-[68%] w-[54%] rounded"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease }}
      />
      <motion.div
        className="hatch absolute top-[30%] right-0 h-[61%] w-[46%] rounded shadow-[0_18px_40px_rgb(31_28_23/0.12)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease }}
      />
      <svg viewBox="0 0 560 560" fill="none" className="absolute inset-0 size-full">
        {/* Le tracé pointillé est révélé progressivement par un masque animé */}
        <defs>
          <mask id="route-reveal" maskUnits="userSpaceOnUse">
            <motion.path
              d={ROUTE}
              stroke="white"
              strokeWidth="8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, delay: 0.5, ease: "easeInOut" }}
            />
          </mask>
        </defs>
        <path d={ROUTE} stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="6 8" mask="url(#route-reveal)" />
        <circle cx="120" cy="110" r="7" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
        <motion.circle
          cx="410" cy="250" r="7"
          fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: "spring", stiffness: 300, damping: 18 }}
        />
        <motion.circle
          cx="380" cy="500" r="9" fill="var(--color-accent)"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 2.6, type: "spring", stiffness: 300, damping: 18 }}
        />
      </svg>
      <motion.div
        className="absolute top-[80%] left-[27%] flex -rotate-2 flex-col gap-1 rounded border border-line bg-card px-4 py-3"
        initial={{ opacity: 0, rotate: -8 }}
        animate={{ opacity: 1, rotate: -2 }}
        transition={{ delay: 1.2, duration: 0.6, ease }}
      >
        <span className="font-serif text-[22px] italic">Étape 3 sur 5</span>
      </motion.div>
    </div>
  );
}
