/**
 * Informations légales du site.
 */
export const legal = {
  updatedAt: "17 septembre 2026",

  // Éditeur du site (vous). Particulier : nom + prénom ; société : raison sociale, forme, capital.
  editor: {
    name: "William Plaquet",
    status: "Particulier",
    email: "contact@trajekt.fr",
    phone: "00 00 00 00 00",
    publicationDirector: "William Plaquet",
  },

  // Hébergeur du site (Render) — coordonnées issues des conditions d'utilisation de Render
  host: {
    name: "Render Services, Inc.",
    address: "525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis",
    phone: "+1 415-319-8186",
    website: "https://render.com",
  },

  // Base de données
  database: {
    name: "MongoDB, Inc. (service MongoDB Atlas)",
    region: "AWS / Paris (eu-west-3)",
    website: "https://www.mongodb.com",
  },

  // Durées de conservation (à adapter à votre activité)
  retention: {
    account: "jusqu'à la suppression du compte, ou 3 ans après la dernière connexion",
    requests: "3 ans après le dernier échange avec vous",
    logs: "12 mois maximum",
  },
} as const;
