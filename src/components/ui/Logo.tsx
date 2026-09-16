import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`font-serif text-[28px] leading-none tracking-tight md:text-[32px] ${
        light ? "text-paper" : "text-ink"
      }`}
    >
      Trajekt
      <span className={light ? "text-[#d9876b]" : "text-accent"} aria-hidden="true">
        .
      </span>
      <span className="sr-only"> — accueil</span>
    </Link>
  );
}
