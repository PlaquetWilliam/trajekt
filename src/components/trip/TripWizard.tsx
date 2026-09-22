"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { submitTripRequest } from "@/app/creer-mon-voyage/actions";
import { FIELD_ORDER, TRIP_STEPS, emptyDraft, sanitizeDraft, validateStep, type FieldErrors, type TripDraft } from "@/lib/trip";
import { ErrorIcon, fieldId } from "@/components/form/fields";
import { clearTripDraft, readTripDraft, writeTripDraft } from "@/lib/trip-draft-storage";
import { ConfirmDialog, DialogAction } from "@/components/ui/ConfirmDialog";
import { TripStepper } from "@/components/trip/TripStepper";
import { TripSummary } from "@/components/trip/TripSummary";
import {
  StepContact,
  StepDates,
  StepDestination,
  StepStyle,
  StepTravellers,
  type DestinationOption,
} from "@/components/trip/steps";

const LAST = TRIP_STEPS.length - 1;

type Saved = { draft: TripDraft; step: number; reached: number };
type Prefill = { destination: string; destinationSlug: string } | null;
type Account = { firstName: string; lastName: string; email: string } | null;

function readSaved(): Saved | null {
  try {
    const raw = readTripDraft();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    const step = Math.min(LAST, Math.max(0, Number(parsed.step) || 0));
    const reached = Math.min(LAST, Math.max(step, Number(parsed.reached) || 0));
    return { draft: sanitizeDraft(parsed.draft), step, reached };
  } catch {
    return null;
  }
}

function writeSaved(value: Saved | null) {
  if (value) writeTripDraft(JSON.stringify(value));
  else clearTripDraft();
}

const noopSubscribe = () => () => {};

/**
 * Le brouillon vit dans le navigateur : on attend d'être côté client
 * avant d'afficher le formulaire, pour éviter tout décalage d'affichage.
 */
export function TripWizard(props: { prefill: Prefill; options: DestinationOption[]; account: Account }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) {
    return (
      <div className="flex min-h-[60vh] items-center" aria-busy="true">
        <p className="text-meta" role="status">
          Chargement du formulaire…
        </p>
      </div>
    );
  }
  return <Wizard {...props} />;
}

/** Compte connecté : on complète les coordonnées laissées vides. */
function withAccount(draft: TripDraft, account: Account): TripDraft {
  if (!account) return draft;
  return {
    ...draft,
    firstName: draft.firstName || account.firstName,
    lastName: draft.lastName || account.lastName,
    email: draft.email || account.email,
  };
}

function initialState(prefill: Prefill, account: Account): Saved & { restored: boolean } {
  const state = baseState(prefill);
  return { ...state, draft: withAccount(state.draft, account) };
}

function baseState(prefill: Prefill): Saved & { restored: boolean } {
  const saved = readSaved();
  if (saved) {
    if (prefill && prefill.destinationSlug !== saved.draft.destinationSlug) {
      // L'internaute arrive depuis une fiche : on garde ses réponses mais on change la destination.
      return {
        draft: { ...saved.draft, ...prefill, undecided: false },
        step: saved.step,
        reached: saved.reached,
        restored: true,
      };
    }
    return { ...saved, restored: true };
  }
  return { draft: { ...emptyDraft, ...(prefill ?? {}) }, step: 0, reached: 0, restored: false };
}

function Wizard({ prefill, options, account }: { prefill: Prefill; options: DestinationOption[]; account: Account }) {
  const router = useRouter();
  const [init] = useState(() => initialState(prefill, account));
  const [draft, setDraft] = useState<TripDraft>(init.draft);
  const [step, setStep] = useState(init.step);
  const [reached, setReached] = useState(init.reached);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [serverError, setServerError] = useState("");
  const [restored, setRestored] = useState(init.restored);
  const [leaving, setLeaving] = useState(false);
  const [submitting, startSubmit] = useTransition();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef(false);
  // Demande envoyée ou supprimée : plus rien ne doit être réécrit dans le navigateur.
  const closed = useRef(false);
  const [summaryTick, setSummaryTick] = useState(0);

  // Sauvegarde automatique du brouillon
  useEffect(() => {
    if (closed.current) return;
    writeSaved({ draft, step, reached });
  }, [draft, step, reached]);

  // Après une validation ratée : focus sur le résumé des erreurs
  useEffect(() => {
    if (summaryTick > 0) summaryRef.current?.focus();
  }, [summaryTick]);

  // Nouvelle étape affichée : focus sur son titre (lecteurs d'écran, clavier)
  const onStepShown = (definition: unknown) => {
    if (definition !== "center" || !pendingFocus.current) return;
    pendingFocus.current = false;
    headingRef.current?.focus({ preventScroll: true });
  };

  const update = (patch: Partial<TripDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setServerError("");
    // Une erreur disparaît dès que le champ concerné est corrigé
    setErrors((prev) => {
      if (!Object.keys(prev).length) return prev;
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof TripDraft)[]) delete next[key];
      if (patch.dateMode) return {};
      return next;
    });
  };

  const goTo = (target: number) => {
    pendingFocus.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    setDirection(target > step ? 1 : -1);
    setErrors({});
    setShowSummary(false);
    setServerError("");
    setStep(target);
    setReached((r) => Math.max(r, target));
  };

  const next = () => {
    const stepErrors = validateStep(step, draft);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      setShowSummary(true);
      setSummaryTick((t) => t + 1);
      return false;
    }
    return true;
  };

  const onContinue = () => {
    if (next()) goTo(step + 1);
  };

  const onSubmit = () => {
    if (!next()) return;
    startSubmit(async () => {
      const result = await submitTripRequest(draft, honeypotRef.current?.value ?? "");
      if (result.ok) {
        closed.current = true;
        writeSaved(null);
        router.push("/creer-mon-voyage/merci");
        return;
      }
      if (result.fieldErrors && result.step !== undefined) {
        if (result.step !== step) goTo(result.step);
        setErrors(result.fieldErrors);
        setShowSummary(true);
        setSummaryTick((t) => t + 1);
      } else {
        setServerError(result.message);
      }
    });
  };

  const restart = () => {
    writeSaved(null);
    setDraft(withAccount({ ...emptyDraft, ...(prefill ?? {}) }, account));
    setReached(0);
    setRestored(false);
    goTo(0);
  };

  /** Quitter en gardant le brouillon : il est déjà enregistré, on s'en va. */
  const saveAndLeave = () => {
    writeSaved({ draft, step, reached });
    setLeaving(false);
    router.push(account ? "/compte" : "/");
  };

  /** Abandonner : le brouillon est effacé de cet appareil, sans retour possible. */
  const discard = () => {
    closed.current = true;
    writeSaved(null);
    setLeaving(false);
    router.push("/");
  };

  const errorList = FIELD_ORDER.filter((f) => errors[f]);
  const stepProps = { draft, errors, update };

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      <div className="flex items-start justify-between gap-4 md:gap-8">
        <div className="min-w-0 flex-1">
          <TripStepper current={step} reached={reached} onSelect={goTo} />
        </div>
        <button
          type="button"
          onClick={() => setLeaving(true)}
          className="-mt-1 flex h-9 shrink-0 items-center gap-1.5 rounded-full text-[15px] text-meta transition-colors hover:text-accent"
        >
          <CloseIcon />
          Quitter
        </button>
      </div>

      <ConfirmDialog
        open={leaving}
        onClose={() => setLeaving(false)}
        title="Quitter cette demande ?"
        description={`Vous en êtes à l'étape ${step + 1} sur ${TRIP_STEPS.length}. Vos réponses sont gardées sur cet appareil : vous pouvez les retrouver plus tard, ou les supprimer définitivement.`}
      >
        <DialogAction onClick={saveAndLeave}>Enregistrer et quitter</DialogAction>
        <DialogAction tone="danger" onClick={discard}>
          Supprimer ma demande
        </DialogAction>
        <DialogAction tone="ghost" onClick={() => setLeaving(false)}>
          Continuer ma demande
        </DialogAction>
      </ConfirmDialog>

      {restored && (
        <div role="status" className="flex flex-col gap-3 rounded border border-line bg-card px-5 py-4 text-[15px] sm:flex-row sm:items-center sm:justify-between">
          <span>Nous avons retrouvé votre demande en cours.</span>
          <span className="flex gap-4">
            <button type="button" onClick={() => setRestored(false)} className="text-accent hover:underline">
              Continuer
            </button>
            <button type="button" onClick={restart} className="text-muted hover:underline">
              Recommencer
            </button>
          </span>
        </div>
      )}

      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-18">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step === LAST) onSubmit();
            else onContinue();
          }}
          className="flex flex-col gap-9"
          aria-labelledby="etape-titre"
        >
          {/* Champ piège anti-robots, invisible pour les humains */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Ne pas remplir</label>
            <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              onAnimationComplete={onStepShown}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-9"
            >
              <div className="flex flex-col gap-2.5">
                <p className="text-[13px] tracking-[0.14em] text-meta uppercase">
                  Étape {step + 1} sur {TRIP_STEPS.length}
                </p>
                <h1
                  id="etape-titre"
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-serif text-[42px] leading-none tracking-[-0.02em] focus:outline-none md:text-[60px]"
                >
                  <StepTitle step={step} />
                </h1>
              </div>

              {showSummary && errorList.length > 0 && (
                <div
                  ref={summaryRef}
                  tabIndex={-1}
                  role="alert"
                  aria-labelledby="erreurs-titre"
                  className="flex flex-col gap-2 rounded border-2 border-error bg-card p-5 focus:outline-none"
                >
                  <p id="erreurs-titre" className="flex items-center gap-2 font-semibold text-error">
                    <ErrorIcon />
                    {errorList.length > 1
                      ? `${errorList.length} informations sont à corriger :`
                      : "Une information est à corriger :"}
                  </p>
                  <ul className="flex list-disc flex-col gap-1 pl-10 text-[15px]">
                    {errorList.map((f) => (
                      <li key={f}>
                        <a
                          href={`#${fieldId(f)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(fieldId(f));
                            el?.focus();
                            el?.scrollIntoView({ block: "center" });
                          }}
                          className="text-error underline underline-offset-2"
                        >
                          {errors[f]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === 0 && <StepDestination {...stepProps} options={options} />}
              {step === 1 && <StepDates {...stepProps} />}
              {step === 2 && <StepTravellers {...stepProps} />}
              {step === 3 && <StepStyle {...stepProps} />}
              {step === 4 && (
                <>
                  <StepContact {...stepProps} />
                  <TripSummary draft={draft} className="lg:hidden" />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {serverError && (
            <p role="alert" className="flex items-start gap-2 rounded border-2 border-error bg-card p-4 text-[15px] text-error">
              <ErrorIcon />
              {serverError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="flex h-12 items-center gap-2 rounded-full px-2 text-base hover:text-accent md:px-5"
              >
                <Arrow dir="left" />
                Retour
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex h-13 items-center gap-2.5 rounded-full bg-accent px-7 text-base font-semibold text-card transition-colors hover:bg-accent-dark disabled:opacity-70"
            >
              {step === LAST ? (submitting ? "Envoi en cours…" : "Envoyer ma demande") : "Continuer"}
              {!submitting && <Arrow dir="right" />}
            </button>
          </div>
        </form>

        <TripSummary draft={draft} className="hidden lg:sticky lg:top-6 lg:flex" />
      </div>
    </div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: 24 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -24 * dir }),
};

function StepTitle({ step }: { step: number }) {
  // Dernier mot mis en valeur, comme sur la maquette
  const title: string = TRIP_STEPS[step].title;
  const cut = title.lastIndexOf(" ", title.length - 3);
  return (
    <>
      {title.slice(0, cut + 1)}
      <em className="text-accent">{title.slice(cut + 1, -2)}</em>
      {title.slice(-2)}
    </>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}
