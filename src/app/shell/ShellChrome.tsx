"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AppHeader } from "@/widgets/app-header";
import type { AppHeaderTexts } from "@/widgets/app-header";
import type { Session } from "@/shared/api";

/**
 * Client chrome of the shell wiring (design.md D1, D3).
 *
 * The shell composition resolves messages and supplies the session on the
 * server; this chrome owns the header's interactions, which must live on the
 * client side of the boundary: choosing a locale opens the same route in that
 * locale (spec: "Choosing a locale") and activating "Sign in" will invoke the
 * session's sign in once `add-auth` supplies it (design.md D3, D5).
 */

export type ShellChromeProps = {
  session: Session;
  locale: string;
  locales: string[];
  texts: AppHeaderTexts;
};

export function ShellChrome({
  session,
  locale,
  locales,
  texts,
}: ShellChromeProps): ReactNode {
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (next: string) => {
    // The same route in the chosen locale (spec: "Choosing a locale").
    const current = pathname ?? `/${locale}`;
    router.push(current.replace(/^\/[^/]*/, `/${next}`));
  };

  const handleSignIn = () => {
    // design.md D3/D5: signing in is the flow `add-auth` owns; the session
    // owner supplies the session's sign in when it lands.
  };

  return (
    <AppHeader
      session={session}
      locale={locale}
      locales={locales}
      texts={texts}
      onSignIn={handleSignIn}
      onLocaleChange={handleLocaleChange}
    />
  );
}
