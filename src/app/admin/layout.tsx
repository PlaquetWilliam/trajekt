import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin · Trajekt" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="container-page flex flex-col gap-8 pt-8 pb-20 md:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-card px-5 py-3">
        <p className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[12px] tracking-[0.08em] text-paper uppercase">Admin</span>
          Espace d&apos;administration
        </p>
        <nav aria-label="Administration" className="flex gap-5 text-[15px]">
          <Link href="/admin" className="text-accent hover:underline">
            Demandes
          </Link>
          <Link href="/compte" className="text-muted hover:text-ink">
            Mon compte
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
