"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateRequestAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/auth-schema";
import { REQUEST_STATUS, type RequestStatus } from "@/lib/request-status";
import { FormMessage } from "@/components/auth/FormMessage";
import { FieldError, errorId, fieldId } from "@/components/form/fields";

const STATUSES: RequestStatus[] = ["sent", "preparing", "proposed", "archived"];

export function AdminRequestForm({
  id,
  status,
  clientMessage,
  internalNote,
}: {
  id: string;
  status: RequestStatus;
  clientMessage?: string;
  internalNote?: string;
}) {
  const [state, action, pending] = useActionState(updateRequestAction.bind(null, id), initialFormState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "idle") return;
    ref.current?.querySelector<HTMLElement>("[role=alert],[role=status]")?.focus();
  }, [state]);

  const v = state.values ?? { status, clientMessage: clientMessage ?? "", internalNote: internalNote ?? "" };
  const e = state.fieldErrors ?? {};
  const textarea =
    "min-h-28 w-full resize-y rounded border border-line bg-paper p-3.5 text-base placeholder:text-meta hover:border-meta";

  return (
    <form ref={ref} action={action} className="flex flex-col gap-5" key={JSON.stringify(v)}>
      <FormMessage state={state} />

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[15px] font-semibold">Statut</legend>
        {STATUSES.map((s) => (
          <label key={s} className="flex cursor-pointer items-center gap-3 rounded border border-line bg-paper px-4 py-3 has-[:checked]:border-accent has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-accent)]">
            <input type="radio" name="status" value={s} defaultChecked={v.status === s} className="size-4 accent-accent" />
            {REQUEST_STATUS[s].label}
          </label>
        ))}
        <FieldError name="status" error={e.status} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId("clientMessage")} className="text-[15px] font-semibold">
          Message au client
        </label>
        <p id="aide-clientMessage" className="-mt-1 text-[13px] text-meta">
          Affiché dans son espace client, sur la page de la demande.
        </p>
        <textarea
          id={fieldId("clientMessage")}
          name="clientMessage"
          maxLength={1000}
          defaultValue={v.clientMessage}
          aria-describedby={e.clientMessage ? `aide-clientMessage ${errorId("clientMessage")}` : "aide-clientMessage"}
          className={textarea}
          placeholder="Ex. : Votre itinéraire vous a été envoyé par e-mail le 20 septembre."
        />
        <FieldError name="clientMessage" error={e.clientMessage} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId("internalNote")} className="text-[15px] font-semibold">
          Note interne
        </label>
        <p id="aide-internalNote" className="-mt-1 text-[13px] text-meta">
          Visible uniquement par l&apos;équipe.
        </p>
        <textarea
          id={fieldId("internalNote")}
          name="internalNote"
          maxLength={2000}
          defaultValue={v.internalNote}
          aria-describedby={e.internalNote ? `aide-internalNote ${errorId("internalNote")}` : "aide-internalNote"}
          className={textarea}
        />
        <FieldError name="internalNote" error={e.internalNote} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-[15px] font-semibold text-card transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
