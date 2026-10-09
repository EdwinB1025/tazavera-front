"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { hasLocale } from "next-intl";
import { AppHeader } from "@/widgets/app-header";
import type { AppHeaderTexts } from "@/widgets/app-header";
import type { Session } from "@/shared/api";
import type { Theme } from "@/shared/lib/theme";
import { signIn, signOut } from "@/features/auth";
import { routing } from "@/shared/config/locales";
import {
  usePathname as useLocalePathname,
  useRouter as useLocaleRouter,
} from "@/shared/lib/locale-navigation";

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
  /** The server-resolved theme (refine-header-aut D3). */
  theme?: Theme;
  /** Rendered first in the header (add-sidebar-slot design.md D6). */
  leading?: ReactNode;
};

export function ShellChrome({
  session,
  locale,
  locales,
  texts,
  theme,
  leading,
}: ShellChromeProps): ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const localeRouter = useLocaleRouter();
  const localePathname = useLocalePathname();

  const handleLocaleChange = (next: string) => {
    // The same route in the chosen locale (spec: "Choosing a locale"), through
    // next-intl's navigation (adopt-next-intl-routing design.md D6); the
    // selector offers only supported locales.
    if (hasLocale(routing.locales, next)) {
      localeRouter.push(localePathname, { locale: next });
    }
  };

  const handleSignIn = () => {
    // Sign in starts from the route the user is on, path and query, through
    // `signIn`'s default (spec: "Sign in starts from the current route";
    // fix-auth-return-query design.md D1); the popup opens within this click
    // (design.md D10).
    signIn();
  };

  const handleSignOut = () => {
    // Sign out completes locally and lands on the root of the active locale
    // through the App Router, which renders it (spec: "Sign out").
    signOut(router.push);
  };

  return (
    <AppHeader
      session={session}
      locale={locale}
      locales={locales}
      texts={texts}
      theme={theme}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
      onLocaleChange={handleLocaleChange}
      currentPath={pathname ?? undefined}
      leading={leading}
    />
  );
}
