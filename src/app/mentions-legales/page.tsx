import type { Metadata } from "next";
import Link from "next/link";
import { InfoList, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { legal } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et conditions d'utilisation du site Trajekt.",
  alternates: { canonical: "/mentions-legales" },
};

const toc = [
  { id: "editeur", label: "Éditeur du site" },
  { id: "hebergeur", label: "Hébergement" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "responsabilite", label: "Responsabilité" },
  { id: "donnees", label: "Données personnelles" },
  { id: "droit", label: "Droit applicable" },
];

export default function LegalNoticePage() {
  const { editor, host } = legal;
  return (
    <LegalPage eyebrow="Informations légales" title="Mentions légales" updatedAt={legal.updatedAt} toc={toc}>
      <p>
        Conformément à l&apos;article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans
        l&apos;économie numérique (LCEN), voici les informations relatives au site {site.name} ({site.url}).
      </p>

      <LegalSection id="editeur" title="Éditeur du site">
        <InfoList
          items={[
            { label: "Éditeur", value: editor.name },
            { label: "Statut", value: editor.status },
            { label: "Immatriculation", value: editor.registration },
            { label: "Adresse", value: editor.address },
            { label: "E-mail", value: <a href={`mailto:${editor.email}`}>{editor.email}</a> },
            { label: "Téléphone", value: editor.phone },
            { label: "Directeur de la publication", value: editor.publicationDirector },
          ]}
        />
      </LegalSection>

      <LegalSection id="hebergeur" title="Hébergement">
        <InfoList
          items={[
            { label: "Hébergeur", value: host.name },
            { label: "Adresse", value: host.address },
            { label: "Téléphone", value: host.phone },
            { label: "Site web", value: <a href={host.website}>{host.website.replace("https://", "")}</a> },
          ]}
        />
        <p>
          Les données du site sont stockées par {legal.database.name}, région : {legal.database.region}.
        </p>
      </LegalSection>

      <LegalSection id="propriete" title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus de ce site (textes, mise en page, logo, illustrations, photographies,
          code) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou réutilisation,
          totale ou partielle, sans autorisation écrite préalable de l&apos;éditeur est interdite.
        </p>
        <p>
          Les photographies éventuellement issues de banques d&apos;images restent la propriété de leurs
          auteurs et sont utilisées conformément à leur licence.
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" title="Responsabilité">
        <p>
          Les idées de voyages, itinéraires, durées et budgets présentés sur le site sont donnés à titre
          indicatif. Ils ne constituent pas une offre de vente : chaque voyage fait l&apos;objet d&apos;une
          proposition personnalisée.
        </p>
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des informations publiées mais ne
          peut garantir l&apos;absence d&apos;erreurs ni la disponibilité permanente du site.
        </p>
      </LegalSection>

      <LegalSection id="donnees" title="Données personnelles et cookies">
        <p>
          Le traitement de vos données et l&apos;usage des cookies sont détaillés dans notre{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection id="droit" title="Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit français. Pour toute question, vous pouvez
          nous écrire via la page <Link href="/contact">Contact</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
