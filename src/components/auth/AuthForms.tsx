"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { signInAction, signUpAction } from "@/app/(auth)/actions";
import { initialFormState } from "@/lib/auth-schema";
import { TextField, fieldId } from "@/components/form/fields";
import { PasswordField } from "@/components/auth/PasswordField";
import { FormMessage, SubmitButton } from "@/components/auth/FormMessage";

/** Après une erreur, le focus va sur le premier champ en erreur (ou le message). */
function useFocusFirstError(state: typeof initialFormState, formRef: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    if (state.status !== "error") return;
    const firstKey = Object.keys(state.fieldErrors ?? {})[0];
    const target = firstKey
      ? document.getElementById(fieldId(firstKey))
      : formRef.current?.querySelector<HTMLElement>("[role=alert]");
    target?.focus();
  }, [state, formRef]);
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(signInAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(state, formRef);
  const e = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="redirect" value={redirectTo} />
      <FormMessage state={state} />
      <TextField
        name="email"
        type="email"
        label="Adresse e-mail"
        requiredMark
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        key={`email-${state.values?.email ?? ""}`}
        error={e.email}
      />
      <PasswordField name="password" label="Mot de passe" autoComplete="current-password" error={e.password} />
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input type="checkbox" name="remember" defaultChecked className="size-5 accent-accent" />
        Rester connecté
      </label>
      <SubmitButton pending={pending} pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
    </form>
  );
}

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(signUpAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(state, formRef);
  const e = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const k = JSON.stringify(v);

  return (
    <form ref={formRef} action={action} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website-inscription">Ne pas remplir</label>
        <input id="website-inscription" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="firstName" label="Prénom" requiredMark autoComplete="given-name" required maxLength={60} defaultValue={v.firstName} key={`fn-${k}`} error={e.firstName} />
        <TextField name="lastName" label="Nom" requiredMark autoComplete="family-name" required maxLength={60} defaultValue={v.lastName} key={`ln-${k}`} error={e.lastName} />
      </div>
      <TextField
        name="email"
        type="email"
        label="Adresse e-mail"
        requiredMark
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={v.email}
        key={`em-${k}`}
        error={e.email}
      />
      {e.email?.startsWith("Un compte existe") && (
        <p className="-mt-3 text-sm">
          <Link href={`/connexion?redirect=${encodeURIComponent(redirectTo)}`} className="text-accent underline underline-offset-2">
            Aller à la connexion
          </Link>
        </p>
      )}
      <PasswordField
        name="password"
        label="Mot de passe"
        hint="8 caractères minimum, avec au moins une lettre et un chiffre."
        autoComplete="new-password"
        error={e.password}
      />
      <SubmitButton pending={pending} pendingLabel="Création du compte…">
        Créer mon compte
      </SubmitButton>
      <p className="text-[13px] leading-relaxed text-meta">
        En créant un compte, vous acceptez que Trajekt conserve ces informations pour gérer vos demandes de voyage.{" "}
        <Link href="/confidentialite" className="text-accent underline underline-offset-2">
          Politique de confidentialité
        </Link>
      </p>
    </form>
  );
}
