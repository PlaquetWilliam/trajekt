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

Pour ajouter trois destinations d'exemple : `npm run seed`.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm run start` | lance le build (utilisé par Render) |
| `npm run lint` | vérifie le code |
| `npm run seed` | insère des destinations d'exemple |

## Structure

```
src/
  app/                 routes (App Router)
    layout.tsx         polices, en-tête, pied de page, SEO global
    page.tsx           accueil
    api/health/        point de contrôle pour Render
    robots.ts, sitemap.ts
  components/
    layout/            SiteHeader, SiteFooter
    home/              sections de l'accueil
    destinations/      DestinationCard
    ui/                ButtonLink, Logo, Reveal (animation au scroll)
  lib/                 site.ts (config), mongodb.ts (connexion), destinations.ts
  models/              schémas Mongoose : Destination, TripRequest
scripts/               seed-destinations.mjs
```

Le design system « Carnet de route » est défini dans `src/app/globals.css` (bloc `@theme`) :
couleurs `paper`, `card`, `sand`, `line`, `ink`, `muted`, `meta`, `accent`, `error`… utilisables en classes Tailwind (`bg-paper`, `text-accent`…), polices `font-serif` (Instrument Serif) et `font-sans` (Instrument Sans).

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

- [ ] Catalogue `/destinations` et fiche `/destinations/[slug]`
- [ ] Formulaire « Créer mon voyage » en 5 étapes, avec validation
- [ ] Comptes clients : inscription, connexion, espace client
