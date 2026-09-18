"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/compte", label: "Mes voyages" },
  { href: "/compte/informations", label: "Mes informations" },
];

export function AccountNav({ signOut, isAdmin }: { signOut: () => Promise<void>; isAdmin: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/compte" ? pathname === "/compte" || pathname.startsWith("/compte/demandes") : pathname.startsWith(href);

  const item = "flex h-11 items-center rounded px-3.5 text-[15px] text-ink transition-colors";
  return (
    <nav aria-label="Espace client" className="lg:sticky lg:top-6">
      <ul className="flex gap-1 overflow-x-auto border-b border-line pb-3 lg:flex-col lg:border-0 lg:pb-0">
        {links.map((l) => (
          <li key={l.href} className="shrink-0">
            <Link
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`${item} hover:bg-card aria-[current=page]:border aria-[current=page]:border-line aria-[current=page]:bg-card aria-[current=page]:font-semibold`}
            >
              {l.label}
            </Link>
          </li>
        ))}
        {isAdmin && (
          <li className="shrink-0">
            <Link href="/admin" className={`${item} gap-2 hover:bg-card`}>
              <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] tracking-[0.08em] text-paper uppercase">Admin</span>
              Demandes
            </Link>
          </li>
        )}
        <li aria-hidden="true" className="mx-1 hidden h-px bg-line lg:my-3 lg:block" />
        <li className="shrink-0 lg:mt-0">
          <form action={signOut}>
            <button type="submit" className={`${item} w-full text-left hover:bg-card hover:text-accent`}>
              Se déconnecter
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
