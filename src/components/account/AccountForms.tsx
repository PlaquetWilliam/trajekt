"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, updateProfileAction } from "@/app/compte/actions";
import { initialFormState, type FormState } from "@/lib/auth-schema";
import { TextField, fieldId } from "@/components/form/fields";
import { PasswordField } from "@/components/auth/PasswordField";
import { FormMessage } from "@/components/auth/FormMessage";

function useFocusAfterSubmit(state: FormState, formRef: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    if (state.status === "idle") return;
    const firstKey = Object.keys(state.fieldErrors ?? {})[0];
    const el = firstKey
      ? document.getElementById(fieldId(firstKey))
      : formRef.current?.querySelector<HTMLElement>("[role=alert],[role=status]");
    if (el && !el.hasAttribute("tabindex") && !firstKey) el.setAttribute("tabindex", "-1");
    el?.focus();
  }, [state, formRef]);
}

const buttonClass =
  "inline-flex h-12 items-center justify-center self-start rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-colors hover:bg-accent disabled:opacity-60";

export function ProfileForm({ firstName, lastName, email }: { firstName: string; lastName: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialFormState);
  const ref = useRef<HTMLFormElement>(null);
  useFocusAfterSubmit(state, ref);
  const v = state.values ?? { firstName, lastName };
  const e = state.fieldErrors ?? {};
  return (
    <form ref={ref} action={action} noValidate className="flex flex-col gap-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="firstName" label="Prénom" requiredMark autoComplete="given-name" required maxLength={60} defaultValue={v.firstName} key={`fn-${v.firstName}`} error={e.firstName} />
        <TextField name="lastName" label="Nom" requiredMark autoComplete="family-name" required maxLength={60} defaultValue={v.lastName} key={`ln-${v.lastName}`} error={e.lastName} />
      </div>
      <TextField
        name="email"
        type="email"
        label="Adresse e-mail"
        value={email}
        readOnly
        hint="Pour changer d'adresse e-mail, contactez-nous."
        className="[&_input]:bg-transparent [&_input]:text-muted"
      />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initialFormState);
  const ref = useRef<HTMLFormElement>(null);
  useFocusAfterSubmit(state, ref);
  const e = state.fieldErrors ?? {};
  // Après un succès, on vide le formulaire
  const key = state.status === "success" ? state.message : "pwd";
  return (
    <form ref={ref} key={key} action={action} noValidate className="flex flex-col gap-5">
      <FormMessage state={state} />
      <PasswordField name="currentPassword" label="Mot de passe actuel" autoComplete="current-password" error={e.currentPassword} />
      <PasswordField
        name="newPassword"
        label="Nouveau mot de passe"
        hint="8 caractères minimum, avec au moins une lettre et un chiffre."
        autoComplete="new-password"
        error={e.newPassword}
      />
      <PasswordField name="confirmPassword" label="Confirmer le nouveau mot de passe" autoComplete="new-password" error={e.confirmPassword} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Modification…" : "Modifier le mot de passe"}
      </button>
    </form>
  );
}
