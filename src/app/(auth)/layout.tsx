import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** Écran partagé de la maquette : panneau illustré à gauche, formulaire à droite. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#e9e2d5] px-14 py-10 lg:flex">
        <div className="relative">
          <Logo />
        </div>
        <svg aria-hidden="true" viewBox="0 0 640 900" fill="none" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
          <path d="M560 640 C 420 600, 140 560, 220 400 S 520 260, 470 120" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="6 8" />
          <circle cx="560" cy="640" r="8" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
          <circle cx="220" cy="400" r="8" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
          <circle cx="470" cy="120" r="10" fill="var(--color-accent)" />
        </svg>
        <p className="relative max-w-[460px] font-serif text-[52px] leading-[1.05]">
          Retrouvez vos voyages, <em className="text-accent">là où vous les avez laissés.</em>
        </p>
      </div>

      <div className="flex flex-col">
        <div className="container-page flex h-16 items-center justify-between lg:justify-end lg:px-14">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link href="/" className="text-[15px] text-ink hover:text-accent">
            <span aria-hidden="true">← </span>Retour au site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pt-6 pb-16 md:px-14">
          <div className="flex w-full max-w-[420px] flex-col gap-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
