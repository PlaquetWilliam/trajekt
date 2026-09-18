import type { Metadata } from "next";
import { AccountNav } from "@/components/account/AccountNav";
import { signOutAction } from "@/app/compte/actions";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Mon compte", template: "%s · Mon compte · Trajekt" },
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: LayoutProps<"/compte">) {
  const user = await getCurrentUser();
  return (
    <div className="container-page grid items-start gap-8 pt-8 pb-20 md:pt-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:pb-24">
      <AccountNav signOut={signOutAction} isAdmin={Boolean(user?.isAdmin)} />
      <div className="flex min-w-0 flex-col gap-8">{children}</div>
    </div>
  );
}
