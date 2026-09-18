"use client";

import type { ChangeEvent } from "react";
import { TRAVEL_STYLES } from "@/lib/catalog";
import {
  BUDGETS,
  DATE_MODES,
  LIMITS,
  PACES,
  isoDay,
  upcomingMonths,
  type FieldErrors,
  type TripDraft,
} from "@/lib/trip";
import {
  ChoiceChip,
  Counter,
  FieldError,
  FieldGroup,
  RadioCard,
  RequiredMark,
  TextArea,
  TextField,
  errorId,
  fieldId,
  inputClass,
} from "@/components/form/fields";

export type DestinationOption = { slug: string; name: string };

export type StepProps = {
  draft: TripDraft;
  errors: FieldErrors;
  update: (patch: Partial<TripDraft>) => void;
};

/* 1 — Destination ------------------------------------------------------ */

export function StepDestination({ draft, errors, update, options }: StepProps & { options: DestinationOption[] }) {
  const onDestination = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const match = options.find((o) => o.name.toLowerCase() === value.trim().toLowerCase());
    update({ destination: value, destinationSlug: match?.slug ?? "" });
  };

  return (
    <div className="flex flex-col gap-6">
      <TextField
        name="destination"
        label="Destination"
        requiredMark={!draft.undecided}
        hint="Un pays, une région, une ville… ou une idée de notre catalogue."
        placeholder="Ex. : Japon, Lisbonne & Porto, la côte ouest américaine…"
        value={draft.destination}
        onChange={onDestination}
        disabled={draft.undecided}
        list={options.length ? "destinations-catalogue" : undefined}
        autoComplete="off"
        maxLength={120}
        error={errors.destination}
      />
      {options.length > 0 && (
        <datalist id="destinations-catalogue">
          {options.map((o) => (
            <option key={o.slug} value={o.name} />
          ))}
        </datalist>
      )}
      <label className="flex cursor-pointer items-center gap-3 text-base">
        <input
          type="checkbox"
          checked={draft.undecided}
          onChange={(e) => update({ undecided: e.target.checked, ...(e.target.checked ? { destination: "", destinationSlug: "" } : {}) })}
          className="size-5 accent-accent"
        />
        Je ne sais pas encore, conseillez-moi
      </label>
    </div>
  );
}

/* 2 — Dates ------------------------------------------------------------- */

export function StepDates({ draft, errors, update }: StepProps) {
  const today = isoDay(new Date());
  const months = upcomingMonths();

  return (
    <div className="flex flex-col gap-8">
      <FieldGroup name="dateMode" legend="Vos dates">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {DATE_MODES.map((m) => (
            <RadioCard
              key={m.value}
              name="dateMode"
              value={m.value}
              label={m.label}
              checked={draft.dateMode === m.value}
              onChange={() => update({ dateMode: m.value })}
            />
          ))}
        </div>
      </FieldGroup>

      {draft.dateMode === "precises" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="startDate"
            type="date"
            label="Départ"
            requiredMark
            min={today}
            value={draft.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
            error={errors.startDate}
          />
          <TextField
            name="endDate"
            type="date"
            label="Retour"
            requiredMark
            min={draft.startDate || today}
            value={draft.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
            error={errors.endDate}
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor={fieldId("month")} className="text-[15px] font-medium">
              Mois de départ
              <RequiredMark />
            </label>
            <select
              id={fieldId("month")}
              name="month"
              value={draft.month}
              onChange={(e) => update({ month: e.target.value })}
              aria-invalid={errors.month ? true : undefined}
              aria-describedby={errors.month ? errorId("month") : undefined}
              className={inputClass(errors.month)}
            >
              <option value="">Choisir un mois</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <FieldError name="month" error={errors.month} />
          </div>
          <TextField
            name="durationDays"
            type="number"
            inputMode="numeric"
            label="Durée souhaitée (en jours)"
            requiredMark
            min={LIMITS.minDuration}
            max={LIMITS.maxDuration}
            placeholder="Ex. : 10"
            value={draft.durationDays}
            onChange={(e) => update({ durationDays: e.target.value })}
            error={errors.durationDays}
          />
        </div>
      )}
    </div>
  );
}

/* 3 — Voyageurs & budget ------------------------------------------------ */

export function StepTravellers({ draft, errors, update }: StepProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded border border-line bg-card p-5">
        <Counter
          name="adults"
          label="Adultes"
          value={draft.adults}
          min={1}
          max={LIMITS.travellers}
          error={errors.adults}
          onChange={(adults) => update({ adults })}
        />
        <div className="border-t border-line" />
        <Counter
          name="children"
          label="Enfants"
          hint="Moins de 12 ans"
          value={draft.children}
          min={0}
          max={LIMITS.travellers}
          error={errors.children}
          onChange={(children) => update({ children })}
        />
      </div>

      <FieldGroup name="budget" legend="Budget par personne" hint="(hors vols internationaux)" error={errors.budget} required>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {BUDGETS.map((b) => (
            <RadioCard
              key={b.value}
              name="budget"
              value={b.value}
              label={b.label}
              checked={draft.budget === b.value}
              onChange={() => update({ budget: b.value })}
              aria-invalid={errors.budget ? true : undefined}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

/* 4 — Style & envies ---------------------------------------------------- */

export function StepStyle({ draft, errors, update }: StepProps) {
  const toggle = (value: string, on: boolean) =>
    update({ styles: on ? [...draft.styles, value] : draft.styles.filter((s) => s !== value) });

  return (
    <div className="flex flex-col gap-9">
      <FieldGroup
        name="styles"
        legend="Quel style de voyage ?"
        hint="(plusieurs choix possibles)"
        error={errors.styles}
        required
      >
        <div className="flex flex-wrap gap-2.5">
          {TRAVEL_STYLES.map((s) => (
            <ChoiceChip
              key={s.value}
              name="styles"
              value={s.value}
              label={s.label}
              checked={draft.styles.includes(s.value)}
              invalid={Boolean(errors.styles)}
              onChange={(e) => toggle(s.value, e.target.checked)}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup name="pace" legend="Quel rythme ?" error={errors.pace}>
        <div className="grid gap-2.5 md:grid-cols-3">
          {PACES.map((p) => (
            <RadioCard
              key={p.value}
              name="pace"
              value={p.value}
              label={p.label}
              hint={p.hint}
              checked={draft.pace === p.value}
              onChange={() => update({ pace: p.value })}
            />
          ))}
        </div>
      </FieldGroup>

      <TextArea
        name="wishes"
        label="Vos envies en quelques mots"
        hint="Facultatif — une activité, un lieu, une occasion spéciale…"
        placeholder="Ex. : un anniversaire de mariage, une nuit dans un lieu insolite…"
        maxLength={LIMITS.wishes}
        value={draft.wishes}
        onChange={(e) => update({ wishes: e.target.value })}
        error={errors.wishes}
      />
    </div>
  );
}

/* 5 — Coordonnées ------------------------------------------------------- */

export function StepContact({ draft, errors, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="firstName"
          label="Prénom"
          requiredMark
          autoComplete="given-name"
          maxLength={60}
          value={draft.firstName}
          onChange={(e) => update({ firstName: e.target.value })}
          error={errors.firstName}
        />
        <TextField
          name="lastName"
          label="Nom"
          requiredMark
          autoComplete="family-name"
          maxLength={60}
          value={draft.lastName}
          onChange={(e) => update({ lastName: e.target.value })}
          error={errors.lastName}
        />
      </div>
      <TextField
        name="email"
        type="email"
        label="Adresse e-mail"
        requiredMark
        autoComplete="email"
        inputMode="email"
        hint="Nous vous enverrons votre proposition d'itinéraire à cette adresse."
        value={draft.email}
        onChange={(e) => update({ email: e.target.value })}
        error={errors.email}
      />
      <TextField
        name="phone"
        type="tel"
        label="Téléphone"
        autoComplete="tel"
        hint="Facultatif — pour affiner votre projet de vive voix."
        value={draft.phone}
        onChange={(e) => update({ phone: e.target.value })}
        error={errors.phone}
      />
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed">
          <input
            id={fieldId("consent")}
            type="checkbox"
            name="consent"
            checked={draft.consent}
            onChange={(e) => update({ consent: e.target.checked })}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? errorId("consent") : undefined}
            className="mt-1 size-5 shrink-0 accent-accent"
          />
          <span>
            J&apos;accepte que Trajekt utilise ces informations pour préparer ma proposition de voyage et me recontacter.
            <RequiredMark />{" "}
            <a href="/confidentialite" target="_blank" className="text-accent underline underline-offset-2">
              En savoir plus<span className="sr-only"> (nouvel onglet)</span>
            </a>
          </span>
        </label>
        <FieldError name="consent" error={errors.consent} />
      </div>
    </div>
  );
}
