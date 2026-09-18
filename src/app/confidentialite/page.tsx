import type { Metadata } from "next";
import Link from "next/link";
import { InfoList, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { legal } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Quelles données Trajekt collecte, pourquoi, combien de temps, et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
};

const toc = [
  { id: "responsable", label: "Responsable du traitement" },
  { id: "donnees", label: "Données collectées" },
  { id: "finalites", label: "Finalités et bases légales" },
  { id: "conservation", label: "Durées de conservation" },
  { id: "destinataires", label: "Destinataires et hébergement" },
  { id: "cookies", label: "Cookies et stockage local" },
  { id: "securite", label: "Sécurité" },
  { id: "droits", label: "Vos droits" },
];

export default function PrivacyPage() {
  const { editor, host, database, retention } = legal;
  return (
    <LegalPage
      eyebrow="Vos données"
      title={
        <>
          Politique de <em className="text-accent">confidentialité</em>
        </>
      }
      updatedAt={legal.updatedAt}
      toc={toc}
    >
      <p>
        Cette politique explique comment {site.name} traite vos données personnelles lorsque vous utilisez
        le site, conformément au Règlement général sur la protection des données (RGPD) et à la loi
        Informatique et Libertés. Nous ne collectons que ce qui est nécessaire pour préparer votre voyage.
      </p>

      <LegalSection id="responsable" title="Responsable du traitement">
        <InfoList
          items={[
            { label: "Responsable", value: editor.name },
            { label: "Adresse", value: editor.address },
            { label: "Contact", value: <a href={`mailto:${editor.email}`}>{editor.email}</a> },
          ]}
        />
      </LegalSection>

      <LegalSection id="donnees" title="Données collectées">
        <ul>
          <li>
            <strong>Demande de voyage</strong> : destination, dates ou période, nombre de voyageurs, budget,
            styles de voyage, rythme, envies (texte libre), prénom, nom, adresse e-mail, téléphone (facultatif)
            et date de votre accord.
          </li>
          <li>
            <strong>Compte client</strong> : prénom, nom, adresse e-mail et mot de passe. Le mot de passe est
            enregistré sous forme chiffrée (hachée) : personne ne peut le lire, pas même nous.
          </li>
          <li>
            <strong>Données techniques</strong> : adresse IP et informations du navigateur, utilisées pour la
            sécurité (sessions de connexion, limitation des envois abusifs).
          </li>
        </ul>
        <p>
          Merci de ne pas indiquer d&apos;informations sensibles (santé, religion…) dans le champ « Vos
          envies ».
        </p>
      </LegalSection>

      <LegalSection id="finalites" title="Finalités et bases légales">
        <ul>
          <li>
            <strong>Préparer et suivre votre proposition de voyage</strong> — mesures précontractuelles prises à
            votre demande (art. 6.1.b RGPD) et votre accord donné dans le formulaire.
          </li>
          <li>
            <strong>Gérer votre compte client</strong> — exécution du service que vous avez demandé
            (art. 6.1.b).
          </li>
          <li>
            <strong>Sécuriser le site</strong> (prévention des abus et des connexions frauduleuses) — intérêt
            légitime (art. 6.1.f).
          </li>
        </ul>
        <p>Vos données ne sont ni vendues, ni utilisées pour de la publicité.</p>
      </LegalSection>

      <LegalSection id="conservation" title="Durées de conservation">
        <InfoList
          items={[
            { label: "Compte client", value: retention.account },
            { label: "Demandes de voyage", value: retention.requests },
            { label: "Journaux techniques", value: retention.logs },
          ]}
        />
      </LegalSection>

      <LegalSection id="destinataires" title="Destinataires et hébergement">
        <p>
          Vos données sont accessibles uniquement à l&apos;équipe {site.name} chargée de préparer votre voyage,
          et à nos sous-traitants techniques :
        </p>
        <ul>
          <li>
            <strong>{host.name}</strong> (hébergement du site, États-Unis) — les transferts hors de l&apos;Union
            européenne sont encadrés par le Data Privacy Framework UE–États-Unis, auquel Render déclare
            adhérer, et par des clauses contractuelles types.
          </li>
          <li>
            <strong>{database.name}</strong> (base de données) — région : {database.region}.
          </li>
        </ul>
        <p>
          Si votre voyage est confirmé, les informations strictement nécessaires peuvent être transmises aux
          prestataires concernés (hébergements, transports, guides), avec votre accord.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies et stockage local">
        <p>
          {site.name} n&apos;utilise <strong>aucun cookie publicitaire ni de mesure d&apos;audience</strong>.
          Les seuls éléments déposés sont nécessaires au fonctionnement du site et sont, à ce titre, exemptés
          de consentement selon les recommandations de la CNIL :
        </p>
        <ul>
          <li>
            <strong>Cookie de session</strong> (<code>better-auth.session_token</code>) : vous garder
            connecté à votre compte, jusqu&apos;à 30 jours.
          </li>
          <li>
            <strong>Cookie de suivi de demande</strong> (<code>trajekt_demandes</code>) : rattacher une
            demande envoyée sans compte au compte que vous créez ensuite sur ce navigateur, 30 jours.
          </li>
          <li>
            <strong>Stockage local du navigateur</strong> : garder votre demande en cours de saisie pour que
            vous puissiez la reprendre. Il est effacé à l&apos;envoi, ou via « Recommencer ».
          </li>
        </ul>
        <p>Vous pouvez supprimer ces éléments à tout moment depuis les réglages de votre navigateur.</p>
      </LegalSection>

      <LegalSection id="securite" title="Sécurité">
        <p>
          Les échanges avec le site sont chiffrés (HTTPS), les mots de passe sont hachés, l&apos;accès aux
          données est réservé aux personnes habilitées et les tentatives répétées de connexion ou
          d&apos;envoi sont limitées.
        </p>
      </LegalSection>

      <LegalSection id="droits" title="Vos droits">
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation,
          d&apos;opposition et de portabilité de vos données, ainsi que du droit de définir des directives
          sur leur sort après votre décès. Vous pouvez retirer votre accord à tout moment.
        </p>
        <p>
          Vous pouvez modifier vos informations depuis <Link href="/compte/informations">votre espace
          client</Link>. Pour toute autre demande, écrivez-nous à{" "}
          <a href={`mailto:${editor.email}`}>{editor.email}</a> ; nous répondons sous un mois.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL
          (<a href="https://www.cnil.fr/fr/plaintes">cnil.fr/plaintes</a>).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
