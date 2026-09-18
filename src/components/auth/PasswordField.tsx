"use client";

import { useState } from "react";
import { FieldError, RequiredMark, errorId, fieldId, hintId, inputClass } from "@/components/form/fields";

export function PasswordField({
  name,
  label,
  hint,
  error,
  autoComplete,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  const describedBy = [hint ? hintId(name) : null, error ? errorId(name) : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId(name)} className="text-[15px] font-medium">
        {label}
        <RequiredMark />
      </label>
      {hint && (
        <p id={hintId(name)} className="-mt-1 text-[13px] text-meta">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          id={fieldId(name)}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          maxLength={128}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass(error)} pr-28`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-controls={fieldId(name)}
          className="absolute top-1/2 right-2 flex h-10 -translate-y-1/2 items-center gap-1.5 rounded px-2 text-sm text-accent hover:text-accent-dark"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="M4 4l16 16" />}
          </svg>
          {visible ? "Masquer" : "Afficher"}
          <span className="sr-only"> le mot de passe</span>
        </button>
      </div>
      <FieldError name={name} error={error} />
    </div>
  );
}
