import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Indiquez votre adresse e-mail.")
  .pipe(z.email("Adresse e-mail invalide. Exemple : nom@domaine.fr"));

const newPassword = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(128, "128 caractères maximum.")
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), "Utilisez au moins une lettre et un chiffre.");

const name = (label: string) => z.string().trim().min(1, `Indiquez votre ${label}.`).max(60, "60 caractères maximum.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Indiquez votre mot de passe."),
});

export const signupSchema = z.object({
  firstName: name("prénom"),
  lastName: name("nom"),
  email,
  password: newPassword,
});

export const profileSchema = z.object({
  firstName: name("prénom"),
  lastName: name("nom"),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Indiquez votre mot de passe actuel."),
    newPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les deux mots de passe ne correspondent pas.",
  });

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Valeurs saisies, renvoyées pour ne pas vider le formulaire en cas d'erreur (jamais les mots de passe). */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export const formString = (data: FormData, key: string) => {
  const v = data.get(key);
  return typeof v === "string" ? v : "";
};
