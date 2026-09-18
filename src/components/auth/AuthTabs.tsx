import Link from "next/link";

export function AuthTabs({ current, redirectTo }: { current: "connexion" | "inscription"; redirectTo: string }) {
  const qs = redirectTo !== "/compte" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
  const tab = (id: "connexion" | "inscription", label: string) => (
    <Link
      href={`/${id}${qs}`}
      aria-current={current === id ? "page" : undefined}
      className={`flex h-11 flex-1 items-center justify-center rounded-full text-[15px] transition-colors ${
        current === id ? "bg-card font-semibold shadow-[0_1px_2px_rgb(31_28_23/0.1)]" : "text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <nav aria-label="Compte" className="flex gap-1 rounded-full bg-[#e9e2d5] p-1">
      {tab("connexion", "Connexion")}
      {tab("inscription", "Créer un compte")}
    </nav>
  );
}
