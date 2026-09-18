import type { ComponentProps, ReactNode } from "react";

export const fieldId = (name: string) => `champ-${name}`;
export const errorId = (name: string) => `erreur-${name}`;
export const hintId = (name: string) => `aide-${name}`;

const describedBy = (name: string, hint?: ReactNode, error?: string) =>
  [hint ? hintId(name) : null, error ? errorId(name) : null].filter(Boolean).join(" ") || undefined;

export function ErrorIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5v.01" />
    </svg>
  );
}

export function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

export function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId(name)} className="flex items-start gap-2 text-[15px] text-error">
      <ErrorIcon />
      <span>{error}</span>
    </p>
  );
}

export function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-error"> *</span>
      <span className="sr-only"> (obligatoire)</span>
    </>
  );
}

export const inputClass = (error?: string) =>
  `h-[50px] w-full rounded border bg-card px-3.5 text-base text-ink placeholder:text-meta transition-colors hover:border-meta disabled:opacity-50 ${
    error ? "border-2 border-error" : "border-line"
  }`;

type TextFieldProps = Omit<ComponentProps<"input">, "name"> & {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  requiredMark?: boolean;
};

export function TextField({ name, label, hint, error, requiredMark, className = "", ...props }: TextFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={fieldId(name)} className="text-[15px] font-medium">
        {label}
        {requiredMark && <RequiredMark />}
      </label>
      {hint && (
        <p id={hintId(name)} className="-mt-1 text-[13px] text-meta">
          {hint}
        </p>
      )}
      <input
        id={fieldId(name)}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={inputClass(error)}
        {...props}
      />
      <FieldError name={name} error={error} />
    </div>
  );
}

type TextAreaProps = Omit<ComponentProps<"textarea">, "name"> & {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
};

export function TextArea({ name, label, hint, error, maxLength, value, ...props }: TextAreaProps) {
  const count = typeof value === "string" ? value.length : 0;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId(name)} className="text-[17px] font-semibold">
        {label}
      </label>
      {hint && (
        <p id={hintId(name)} className="-mt-1 text-sm text-meta">
          {hint}
        </p>
      )}
      <textarea
        id={fieldId(name)}
        name={name}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={`min-h-32 w-full resize-y rounded border bg-card p-3.5 text-base placeholder:text-meta transition-colors hover:border-meta ${
          error ? "border-2 border-error" : "border-line"
        }`}
        {...props}
      />
      {maxLength && (
        <p className="self-end text-[13px] text-meta" aria-live="polite">
          {count} / {maxLength}
        </p>
      )}
      <FieldError name={name} error={error} />
    </div>
  );
}

/** Case à cocher habillée en pastille. */
export function ChoiceChip({
  label,
  invalid,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: string; invalid?: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        className={`flex h-12 items-center gap-2.5 rounded-full border bg-card px-4.5 text-[15px] transition-colors select-none peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent hover:border-ink md:h-13 ${
          invalid ? "border-error" : "border-line"
        } [&>svg]:hidden peer-checked:[&>svg]:block`}
      >
        <CheckIcon />
        {label}
      </span>
    </label>
  );
}

/** Bouton radio habillé en carte. */
export function RadioCard({
  label,
  hint,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: string; hint?: string }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" className="peer sr-only" {...props} />
      <span className="flex h-full flex-col gap-1 rounded border border-line bg-card px-4.5 py-4 transition-colors select-none peer-checked:border-accent peer-checked:shadow-[inset_0_0_0_1px_var(--color-accent)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent hover:border-meta [&_svg]:invisible peer-checked:[&_svg]:visible">
        <span className="flex items-center justify-between gap-3 font-semibold">
          {label}
          <span className="text-accent">
            <CheckIcon size={18} />
          </span>
        </span>
        {hint && <span className="text-sm text-meta">{hint}</span>}
      </span>
    </label>
  );
}

/** Compteur − / + avec saisie directe. */
export function Counter({
  name,
  label,
  hint,
  value,
  min,
  max,
  error,
  onChange,
}: {
  name: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  error?: string;
  onChange: (v: number) => void;
}) {
  const btn =
    "flex size-11 items-center justify-center rounded-full border border-line bg-card text-xl transition-colors hover:border-ink disabled:opacity-40 disabled:hover:border-line";
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <label htmlFor={fieldId(name)} className="text-[17px] font-semibold">
            {label}
          </label>
          {hint && (
            <span id={hintId(name)} className="text-sm text-meta">
              {hint}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={btn} onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label={`Retirer 1 (${label})`}>
            <span aria-hidden="true">−</span>
          </button>
          <input
            id={fieldId(name)}
            name={name}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(clamp(Number.parseInt(e.target.value || "0", 10) || 0))}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(name, hint, error)}
            className="h-11 w-14 rounded border border-line bg-card text-center text-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button type="button" className={btn} onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label={`Ajouter 1 (${label})`}>
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
      <FieldError name={name} error={error} />
    </div>
  );
}

/** Groupe de champs (cases, radios) avec légende et message d'erreur. */
export function FieldGroup({
  name,
  legend,
  hint,
  error,
  required,
  children,
}: {
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset
      id={fieldId(name)}
      tabIndex={-1}
      aria-describedby={describedBy(name, hint, error)}
      className="flex flex-col gap-3.5 focus:outline-none"
    >
      <legend className="mb-3.5 text-[17px] font-semibold">
        {legend}
        {hint && (
          <span id={hintId(name)} className="font-normal text-meta">
            {" "}
            {hint}
          </span>
        )}
        {required && <RequiredMark />}
      </legend>
      {children}
      <FieldError name={name} error={error} />
    </fieldset>
  );
}
