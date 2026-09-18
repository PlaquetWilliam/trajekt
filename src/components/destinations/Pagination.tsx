import Link from "next/link";
import { catalogHref, type CatalogFilters } from "@/lib/catalog";

const itemBase =
  "flex size-11 items-center justify-center rounded-full border text-[15px] transition-colors";

export function Pagination({ filters, page, pageCount }: { filters: CatalogFilters; page: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="flex justify-center">
      <ul className="flex flex-wrap items-center gap-2">
        {page > 1 && (
          <li>
            <Link href={catalogHref({ ...filters, page: page - 1 })} className={`${itemBase} border-line hover:border-ink`} aria-label="Page précédente">
              <Chevron dir="left" />
            </Link>
          </li>
        )}
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={catalogHref({ ...filters, page: p })}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={`${itemBase} ${p === page ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink"}`}
            >
              {p}
            </Link>
          </li>
        ))}
        {page < pageCount && (
          <li>
            <Link href={catalogHref({ ...filters, page: page + 1 })} className={`${itemBase} border-line hover:border-ink`} aria-label="Page suivante">
              <Chevron dir="right" />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}
