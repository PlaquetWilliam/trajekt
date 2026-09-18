import type { ReactNode } from "react";

/** Mise en page commune aux pages légales : titre, date, sommaire, contenu lisible. */
export function LegalPage({
  eyebrow,
  title,
  updatedAt,
  toc,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  updatedAt?: string;
  toc?: { id: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <div className="container-page grid gap-10 pt-10 pb-20 md:pt-14 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-18 lg:pb-24">
      <article className="flex max-w-3xl min-w-0 flex-col gap-10">
        <header className="flex flex-col gap-4">
          <p className="text-[13px] tracking-[0.14em] text-meta uppercase">{eyebrow}</p>
          <h1 className="font-serif text-[48px] leading-none tracking-[-0.02em] md:text-[68px]">{title}</h1>
          {updatedAt && <p className="text-sm text-meta">Dernière mise à jour : {updatedAt}</p>}
        </header>
        <div className="legal-prose flex flex-col gap-10">{children}</div>
      </article>

      {toc && toc.length > 0 && (
        <nav aria-label="Sommaire" className="hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-3 border-l border-line pl-5">
            <p className="text-[13px] tracking-[0.12em] text-meta uppercase">Sommaire</p>
            <ol className="flex flex-col gap-2 text-[15px]">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-muted hover:text-accent">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="flex scroll-mt-6 flex-col gap-4">
      <h2 id={`${id}-titre`} className="font-serif text-[32px] leading-tight md:text-[38px]">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Tableau clé / valeur pour les coordonnées. */
export function InfoList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-3 rounded border border-line bg-card p-5 sm:grid-cols-[180px_minmax(0,1fr)] md:p-6">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-sm text-meta sm:pt-0.5">{item.label}</dt>
          <dd className="mb-2 text-base break-words sm:mb-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
