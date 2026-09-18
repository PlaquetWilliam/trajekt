"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAPIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { formString, passwordSchema, profileSchema, toFieldErrors, type FormState } from "@/lib/auth-schema";

export async function signOutAction() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.error("[déconnexion]", error);
  }
  redirect("/");
}

export async function updateProfileAction(_prev: FormState, data: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/compte/informations");

  const values = { firstName: formString(data, "firstName"), lastName: formString(data, "lastName") };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", values, fieldErrors: toFieldErrors(parsed.error), message: "Vérifiez les champs indiqués." };
  }
  const { firstName, lastName } = parsed.data;
  try {
    await auth.api.updateUser({
      body: { name: `${firstName} ${lastName}`, firstName, lastName },
      headers: await headers(),
    });
  } catch (error) {
    console.error("[profil]", error);
    return { status: "error", values, message: "Enregistrement impossible pour le moment." };
  }
  revalidatePath("/compte", "layout");
  return { status: "success", values: parsed.data, message: "Vos informations ont été enregistrées." };
}

export async function changePasswordAction(_prev: FormState, data: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/compte/informations");

  const parsed = passwordSchema.safeParse({
    currentPassword: formString(data, "currentPassword"),
    newPassword: formString(data, "newPassword"),
    confirmPassword: formString(data, "confirmPassword"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), message: "Vérifiez les champs indiqués." };
  }
  if (isRateLimited(`password:${user.id}:${await clientIp()}`, 5, 15 * 60 * 1000)) {
    return { status: "error", message: "Trop de tentatives. Patientez quelques minutes." };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    const code = isAPIError(error) ? String((error.body as { code?: string } | undefined)?.code ?? "") : "";
    if (code === "INVALID_PASSWORD") {
      return { status: "error", fieldErrors: { currentPassword: "Mot de passe actuel incorrect." }, message: "Mot de passe actuel incorrect." };
    }
    console.error("[mot de passe]", error);
    return { status: "error", message: "Modification impossible pour le moment." };
  }
  return { status: "success", message: "Mot de passe modifié. Vos autres appareils ont été déconnectés." };
}
