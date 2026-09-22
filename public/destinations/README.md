# Photos des destinations

Déposez ici les photos, puis lancez `npm run images` : le script lit ce dossier
et renseigne les champs `image` et `gallery` des destinations dans MongoDB.

## Nommage

Le nom du fichier reprend le **slug** de la destination (celui de l'URL
`/destinations/<slug>`) :

| Fichier                        | Où il apparaît                          |
| ------------------------------ | --------------------------------------- |
| `kyoto-et-environs.jpg`        | carte du catalogue + haut de la fiche    |
| `kyoto-et-environs-2.jpg`      | galerie « En images »                    |
| `kyoto-et-environs-3.jpg`      | galerie « En images » (suite)            |

Slugs actuels : `lisbonne-porto`, `kyoto-et-environs`, `patagonie`,
`maroc-atlas`, `vietnam-nord-sud` (la liste complète est dans
`scripts/seed-destinations.mjs`).

Formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
Une destination sans fichier garde son motif hachuré — rien ne casse.

## Textes alternatifs

`alt.json` associe à chaque fichier la description lue par les lecteurs
d'écran. Sans entrée, le nom de la destination est utilisé par défaut, ce qui
suffit techniquement mais reste pauvre : décrivez ce que montre la photo.
`npm run images` liste à la fin les fichiers auxquels il manque un texte.

## Bon à savoir

- Cadrage : les photos principales sont affichées en 3/2 (carte) et 16/7
  (fiche), rognées au centre. Évitez les sujets collés au bord.
- Poids : `next/image` se charge de redimensionner et de convertir en
  AVIF/WebP, mais l'original part dans Git — visez ~2000 px de large et
  moins de 1 Mo par fichier.
- Ces photos doivent être libres de droits ou vous appartenir.
