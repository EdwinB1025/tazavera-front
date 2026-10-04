"use client";

import type { ReactNode } from "react";
import { Logo, Button } from "@/shared/ui";
import type { Session } from "@/shared/api";
import { PrimaryNav } from "./PrimaryNav";
import { LanguageSelect } from "./LanguageSelect";

// ─── UI-specific types (declared before the component) ───
// Every interface text arrives as a prop (design.md D10), so the header's
// text surface is visible in its type signature and no component calls the
// translation API. The session is input (design.md D3): `add-auth` owns the
// session module and supplies it along with its actions.

export type AppHeaderTexts = {
  topRated: string;
  aboutUs: string;
  signIn: string;
  languageSelector: string;
};

export type AppHeaderProps = {
  session: Session;
  /** Active locale: the logotype and the navigation link to its routes. */
  locale: string;
  /** Exactly the supported locales, for the language selector. */
  locales: string[];
  texts: AppHeaderTexts;
  /** The session's sign in (spec: "Sign in starts from the current route"). */
  onSignIn: () => void;
  onLocaleChange: (locale: string) => void;
};

const HEADER_CLASSES = ["flex", "h-16", "items-center", "gap-4", "bg-nav-surface", "px-4"].join(" ");

/**
 * Tazavera app header (design summary §3).
 *
 * Signed out it shows the brand logotype, the primary navigation (from `md`),
 * the language selector and the "Sign in" action; while the session resolves
 * it shows neither the "Sign in" action nor a user menu (spec: "Session
 * resolving"). The user menu for the signed-in state arrives with the
 * signed-in header slice.
 *
 * The logotype renders in both forms (design.md D7): the drawing alone below
 * `md` and the wordmark form from `md` up, so the brand stays visible at
 * every size.
 */
export function AppHeader({
  session,
  locale,
  locales,
  texts,
  onSignIn,
  onLocaleChange,
}: AppHeaderProps): ReactNode {
  return (
    <header className={HEADER_CLASSES}>
      <span className="md:hidden">
        <Logo variant="icon" size={32} locale={locale} />
      </span>
      <span className="hidden md:inline-flex">
        <Logo variant="inline" size={32} locale={locale} />
      </span>
      <PrimaryNav locale={locale} texts={texts} />
      <LanguageSelect
        label={texts.languageSelector}
        locales={locales}
        value={locale}
        onLocaleChange={onLocaleChange}
      />
      {session.state === "anonymous" && (
        <Button variant="nav-button" onClick={onSignIn}>
          {texts.signIn}
        </Button>
      )}
    </header>
  );
}
