"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { claimPendingRequests } from "@/lib/pending-requests";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { safeRedirect } from "@/lib/session";
import {
  formString,
  loginSchema,
  signupSchema,
  toFieldErrors,
  type FormState,
} from "@/lib/auth-schema";

const errorCode = (error: unknown) =>
  isAPIError(error) ? String((error.body as { code?: string } | undefined)?.code ?? "") : "";

export async function signInAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = { email: formString(data, "email") };
  const parsed = loginSchema.safeParse({ email: values.email, password: formString(data, "password") });
  if (!parsed.success) {
    return { status: "error", values, fieldErrors: toFieldErrors(parsed.error), message: "Vérifiez les champs indiqués." };
  }

  const ip = await clientIp();
  if (isRateLimited(`login:${ip}`, 10, 10 * 60 * 1000)) {
    return { status: "error", values, message: "Trop de tentatives. Patientez quelques minutes avant de réessayer." };
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password, rememberMe: data.get("remember") === "on" },
      headers: await headers(),
    });
    await claimPendingRequests(result.user.id);
  } catch (error) {
    const code = errorCode(error);
    if (code.startsWith("INVALID_EMAIL") || code === "CREDENTIAL_ACCOUNT_NOT_FOUND" || code === "INVALID_PASSWORD") {
      return { status: "error", values, message: "Adresse e-mail ou mot de passe incorrect." };
    }
    console.error("[connexion]", error);
    return { status: "error", values, message: "Connexion impossible pour le moment. Réessayez dans un instant." };
  }

  redirect(safeRedirect(data.get("redirect")));
}

export async function signUpAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = {
    firstName: formString(data, "firstName"),
    lastName: formString(data, "lastName"),
    email: formString(data, "email"),
  };
  const parsed = signupSchema.safeParse({ ...values, password: formString(data, "password") });
  if (!parsed.success) {
    return { status: "error", values, fieldErrors: toFieldErrors(parsed.error), message: "Vérifiez les champs indiqués." };
  }
  if (data.get("website")) redirect("/"); // champ piège anti-robots

  const ip = await clientIp();
  if (isRateLimited(`signup:${ip}`, 5, 60 * 60 * 1000)) {
    return { status: "error", values, message: "Trop de comptes créés depuis cette connexion. Réessayez plus tard." };
  }

  const { firstName, lastName, email, password } = parsed.data;
  try {
    const result = await auth.api.signUpEmail({
      body: { name: `${firstName} ${lastName}`, firstName, lastName, email, password },
      headers: await headers(),
    });
    await claimPendingRequests(result.user.id);
  } catch (error) {
    const code = errorCode(error);
    if (code.startsWith("USER_ALREADY_EXISTS")) {
      return {
        status: "error",
        values,
        fieldErrors: { email: "Un compte existe déjà avec cette adresse. Connectez-vous plutôt." },
        message: "Un compte existe déjà avec cette adresse.",
      };
    }
    if (code === "PASSWORD_TOO_SHORT" || code === "PASSWORD_TOO_LONG") {
      return { status: "error", values, fieldErrors: { password: "Mot de passe de 8 à 128 caractères." } };
    }
    console.error("[inscription]", error);
    return { status: "error", values, message: "Création du compte impossible pour le moment. Réessayez dans un instant." };
  }

  redirect(safeRedirect(data.get("redirect")));
}
