import { CheckIcon, ErrorIcon } from "@/components/form/fields";
import type { FormState } from "@/lib/auth-schema";

/** Message global d'un formulaire (erreur ou succès), annoncé aux lecteurs d'écran. */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message || state.status === "idle") return null;
  const ok = state.status === "success";
  return (
    <p
      role={ok ? "status" : "alert"}
      tabIndex={-1}
      className={`flex focus:outline-none items-start gap-2 rounded border-2 bg-card p-4 text-[15px] ${
        ok ? "border-success text-success" : "border-error text-error"
      }`}
    >
      {ok ? <CheckIcon size={18} /> : <ErrorIcon />}
      {state.message}
    </p>
  );
}

export function SubmitButton({ pending, children, pendingLabel }: { pending: boolean; children: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-13.5 w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-card transition-colors hover:bg-accent-dark disabled:opacity-70"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
