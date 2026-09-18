"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { focusedPaths, mainNav } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  if (focusedPaths.includes(pathname)) {
    return (
      <header className="container-page">
        <div className="flex h-16 items-center justify-between border-b border-line md:h-22">
          <Logo />
          <Link href="/" className="flex h-11 items-center gap-2 text-[15px] text-ink hover:text-accent">
            Enregistrer et quitter
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Link>
        </div>
      </header>
    );
  }

  const isActive = (href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="container-page">
      <div className="flex h-16 items-center justify-between border-b border-line md:h-22">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex gap-9 text-[15px]">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="border-b border-transparent pb-1 text-ink transition-colors hover:border-accent aria-[current=page]:border-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <ButtonLink href="/creer-mon-voyage" variant="dark">
            Créer mon voyage
          </ButtonLink>
        </div>

        <button
          type="button"
          className="flex size-11 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-mobile"
            aria-label="Navigation mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-b border-line py-6 md:hidden"
          >
            <ul className="flex flex-col gap-4 text-lg">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href="/creer-mon-voyage" size="lg" className="mt-6 w-full" onClick={close}>
              Créer mon voyage
            </ButtonLink>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
