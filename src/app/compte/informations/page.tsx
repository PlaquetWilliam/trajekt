import { ProfileForm, PasswordForm } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Mes informations" };

export default async function AccountInfoPage() {
  const user = await requireUser("/compte/informations");
  return (
    <>
      <div className="flex flex-col gap-2.5">
        <p className="text-[13px] tracking-[0.14em] text-meta uppercase">Espace client</p>
        <h1 className="font-serif text-[48px] leading-none md:text-[64px]">Mes informations</h1>
      </div>

      <section aria-labelledby="profil-titre" className="flex max-w-2xl flex-col gap-5 rounded border border-line bg-card p-6 md:p-8">
        <h2 id="profil-titre" className="font-serif text-3xl">Profil</h2>
        <ProfileForm firstName={user.firstName} lastName={user.lastName} email={user.email} />
      </section>

      <section aria-labelledby="mdp-titre" className="flex max-w-2xl flex-col gap-5 rounded border border-line bg-card p-6 md:p-8">
        <h2 id="mdp-titre" className="font-serif text-3xl">Mot de passe</h2>
        <PasswordForm />
      </section>
    </>
  );
}
