# Trajekt — voyages sur mesure

Site de création de voyages sur mesure.
Stack : **Next.js 16** (App Router, TypeScript) · **React 19** · **Tailwind CSS 4** · **Motion** · **MongoDB** (Mongoose) · déploiement **Render**.

## Démarrer en local

Prérequis : Node.js 20.9 ou plus (22 recommandé).

```bash
npm install
cp .env.example .env.local   # puis remplir MONGODB_URI
npm run dev                  # http://localhost:3000
```

Sans `MONGODB_URI`, le site démarre quand même : la section « Destinations à explorer » est simplement masquée.

Pour ajouter six destinations d'exemple (ou les remettre à jour) : `npm run seed`.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm run start` | lance le build (utilisé par Render) |
| `npm run lint` | vérifie le code |
| `npm run seed` | insère ou met à jour les destinations d'exemple |

## Structure

```
src/
  app/                   routes (App Router)
    layout.tsx           polices, en-tête, pied de page, SEO global
    page.tsx             accueil
    destinations/
      (catalogue)/       catalogue /destinations (filtres, pagination, chargement, erreur)
      [slug]/            fiche destination /destinations/…
    creer-mon-voyage/    formulaire en 5 étapes (page, actions.ts = enregistrement), merci/
    (auth)/              connexion, inscription
    compte/              espace client
    admin/               espace admin (liste et traitement des demandes)
    mentions-legales/, confidentialite/, contact/
    api/health/          point de contrôle pour Render
    robots.ts, sitemap.ts
  components/
    layout/              SiteHeader, SiteFooter, HideOnPaths
    home/                sections de l'accueil
    destinations/        carte, filtres, pagination, frise d'itinéraire
    trip/                étapes, progression, récapitulatif, TripWizard (logique du formulaire)
    form/                champs accessibles (texte, pastilles, cartes, compteur, erreurs)
    ui/                  ButtonLink, Logo, Select, Reveal (animation au scroll)
  lib/
    site.ts              configuration du site
    catalog.ts           continents, styles, durées
    trip.ts              règles de validation (Zod) partagées navigateur / serveur
    mongodb.ts           connexion
    destinations.ts      requêtes
  models/                schémas Mongoose : Destination, TripRequest
scripts/                 seed-destinations.mjs, set-admin.mjs
```

Le design system « Carnet de route » est défini dans `src/app/globals.css` (bloc `@theme`) :
couleurs `paper`, `card`, `sand`, `line`, `ink`, `muted`, `meta`, `accent`, `error`… utilisables en classes Tailwind (`bg-paper`, `text-accent`…), polices `font-serif` (Instrument Serif) et `font-sans` (Instrument Sans).

## Ajouter une destination

Les destinations sont des documents de la collection `destinations` (schéma : `src/models/Destination.ts`).
Champs principaux : `slug` (adresse de la fiche), `name`, `country`, `continent`
(`europe`, `afrique`, `asie`, `ameriques`, `oceanie`), `styles` (valeurs listées dans `src/lib/catalog.ts`),
`durationDays`, `bestPeriod`, `budgetFrom`, `summary`, `description`, `image` `{ src, alt }`, `gallery`,
`itinerary` `[{ days, title, description }]`, `featured` (mise en avant sur l'accueil), `published`.

Les photos peuvent être dans `public/images/…` (`src: "/images/lisbonne.jpg"`) ou chez Cloudinary / Unsplash.
Pour un autre hébergeur, ajoutez son adresse dans `images.remotePatterns` (`next.config.ts`).
Les pages sont mises à jour au plus toutes les 10 minutes après une modification en base.

## Comptes clients

L'authentification utilise [Better Auth](https://www.better-auth.com) (e-mail + mot de passe),
avec les sessions stockées dans MongoDB (collections `user`, `session`, `account`, `verification`).

- `src/lib/auth.ts` : configuration ; `src/app/api/auth/[...all]` : routes internes de Better Auth.
- `src/lib/session.ts` : `getCurrentUser()` et `requireUser()` (à appeler dans chaque page protégée).
- `src/proxy.ts` : redirige vers `/connexion` les visiteurs sans session qui ouvrent `/compte…`.
- Pages : `/connexion`, `/inscription`, `/compte` (mes voyages), `/compte/demandes/[id]`, `/compte/informations`.

Variables à ajouter dans `.env.local` **et sur Render** (Environment) :

| Variable | Valeur |
| --- | --- |
| `BETTER_AUTH_SECRET` | clé aléatoire : `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `BETTER_AUTH_URL` | `http://localhost:3000` en local, l'URL Render en production |

Une demande envoyée sans être connecté est rattachée automatiquement au compte
si la personne s'inscrit ou se connecte ensuite depuis le même navigateur (cookie signé, 30 jours).

## Espace admin

`/admin` liste toutes les demandes (filtre par statut, recherche, pagination). Sur chaque demande,
un administrateur change le statut, écrit un **message au client** (affiché dans son espace) et une
**note interne**. Chaque changement de statut est gardé dans l'historique.

Pour donner le rôle admin à un compte (créé au préalable sur le site) :

```bash
npm run admin -- vous@exemple.fr            # donner le rôle
npm run admin -- vous@exemple.fr --retirer  # le retirer
```

En production, lancez la commande en local avec la `MONGODB_URI` de production, ou depuis l'onglet
**Shell** du service Render : `node scripts/set-admin.mjs vous@exemple.fr`.
Un visiteur non administrateur qui ouvre `/admin` obtient une page 404.

## Pages légales

`/mentions-legales`, `/confidentialite` et `/contact` lisent leurs informations dans `src/lib/legal.ts`.
**Remplacez toutes les valeurs entre crochets** (éditeur, adresse, e-mail, téléphone, région Atlas)
avant d'ouvrir le site au public. Le site n'utilise que des cookies nécessaires à son fonctionnement :
aucun bandeau de consentement n'est requis tant qu'aucun outil de statistiques ou de publicité n'est ajouté.

## Demandes de voyage

Chaque envoi du formulaire crée un document dans la collection `triprequests` (statut `sent`),
visible dans Atlas → Browse Collections. Le brouillon en cours est gardé dans le navigateur
(localStorage) jusqu'à l'envoi, et apparaît dans « Mes voyages » avec un bouton « Reprendre ».
Protection anti-spam : champ piège invisible + 5 envois maximum par adresse IP toutes les 10 minutes.

## 1. MongoDB Atlas (gratuit)

1. Créer un compte sur <https://www.mongodb.com/cloud/atlas/register>.
2. Créer un cluster **M0 (Free)**, région proche (ex. Paris ou Francfort).
3. **Database Access** → ajouter un utilisateur avec mot de passe (rôle *Read and write to any database*).
4. **Network Access** → ajouter `0.0.0.0/0` (nécessaire pour Render, dont l'offre gratuite n'a pas d'IP fixe).
5. **Connect → Drivers** → copier la chaîne `mongodb+srv://…` dans `.env.local` (`MONGODB_URI`), en remplaçant `<password>`.

## 2. GitHub

```bash
git init
git add .
git commit -m "Initialisation du projet Trajekt"
git branch -M main
git remote add origin https://github.com/<votre-compte>/trajekt.git
git push -u origin main
```

(Créer d'abord le dépôt vide `trajekt` sur <https://github.com/new>, sans README.)
`.env.local` est ignoré par Git : la chaîne de connexion ne part jamais sur GitHub.

## 3. Render (gratuit)

1. Se connecter sur <https://render.com> avec son compte GitHub.
2. **New → Blueprint** → choisir le dépôt `trajekt` : Render lit `render.yaml`.
3. Renseigner les variables demandées :
   - `MONGODB_URI` : la même chaîne que dans `.env.local` ;
   - `NEXT_PUBLIC_SITE_URL` : l'URL fournie par Render (ex. `https://trajekt.onrender.com`).
4. Chaque `git push` sur `main` redéploie automatiquement.

Bon à savoir sur l'offre gratuite : le service se met en veille après ~15 min sans visite ; la première visite suivante prend quelques dizaines de secondes.

## Prochaines étapes

- [x] Catalogue `/destinations` et fiche `/destinations/[slug]`
- [x] Formulaire « Créer mon voyage » en 5 étapes, avec validation
- [ ] Recevoir un e-mail à chaque nouvelle demande
- [x] Comptes clients : inscription, connexion, espace client
- [ ] Mot de passe oublié et vérification de l'adresse e-mail (nécessitent un service d'envoi d'e-mails)
- [ ] Favoris
- [x] Pages légales et espace admin
