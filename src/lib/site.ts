export const site = {
  name: "Trajekt",
  tagline: "Voyages sur mesure, tracés pour vous.",
  description:
    "Trajekt compose des voyages sur mesure : dites-nous vos envies, votre rythme et votre budget, nous créons un itinéraire unique, étape par étape.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "fr_FR",
};

export const mainNav = [
  { href: "/destinations", label: "Destinations" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/compte", label: "Mon compte" },
] as const;

export const footerNav = [
  {
    title: "Explorer",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/#comment-ca-marche", label: "Comment ça marche" },
      { href: "/creer-mon-voyage", label: "Créer mon voyage" },
    ],
  },
  {
    title: "Mon compte",
    links: [
      { href: "/connexion", label: "Connexion" },
      { href: "/compte", label: "Mes voyages" },
    ],
  },
  {
    title: "Informations",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;
