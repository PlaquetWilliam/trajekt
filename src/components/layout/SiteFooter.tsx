import Link from "next/link";
import { footerNav, site } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="container-page flex flex-col gap-10 pt-14 pb-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Logo light />
            <p className="text-[15px] leading-relaxed text-[#cfc6b6]">{site.tagline}</p>
          </div>
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title} className="flex flex-col gap-2.5">
              <h2 className="text-[13px] tracking-[0.12em] text-footer-meta uppercase">
                {group.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[15px] hover:text-[#d9876b]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="border-t border-[#3a352d] pt-5 text-[13px] text-footer-meta">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
