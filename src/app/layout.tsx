import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MotionProvider } from "@/components/MotionProvider";
import { HideOnPaths } from "@/components/layout/HideOnPaths";
import { chromelessPaths, focusedPaths, site } from "@/lib/site";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Voyages sur mesure`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f3eee5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${instrumentSerif.variable} ${instrumentSans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenu"
          className="sr-only z-50 rounded bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Aller au contenu
        </a>
        <MotionProvider>
          <HideOnPaths paths={chromelessPaths}>
            <SiteHeader />
          </HideOnPaths>
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <HideOnPaths paths={[...focusedPaths, ...chromelessPaths]}>
            <SiteFooter />
          </HideOnPaths>
        </MotionProvider>
      </body>
    </html>
  );
}
