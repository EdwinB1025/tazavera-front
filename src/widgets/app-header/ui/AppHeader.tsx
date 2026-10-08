"use client";

import type { ReactNode } from "react";
import { Logo, Button } from "@/shared/ui";
import type { Session } from "@/shared/api";
import { NavigationMenu } from "./NavigationMenu";
import { PrimaryNav } from "./PrimaryNav";
import { LanguageSelect } from "./LanguageSelect";
import { UserMenu } from "./UserMenu";

// ─── UI-specific types (declared before the component) ───
// Every interface text arrives as a prop (design.md D10), so the header's
// text surface is visible in its type signature and no component calls the
// translation API. The session is input (design.md D3): `add-auth` owns the
// session module and supplies it along with its actions.

export type AppHeaderTexts = {
  topRated: string;
  exploreCoffeeshops: string;
  aboutUs: string;
  signIn: string;
  /**
   * The composed accessible name of the language control the shell passes
   * (design.md D6), one string composed in the shell as the current locale's
   * code in uppercase, then " — ", then the catalog word with the current
   * language's own name — "ES — Idioma: Español" for `es`.
   */
  languageSelector: string;
  brandLink: string;
  // the user menu (spec: "Menu content")
  myAccount: string;
  security: string;
  themeSelector: string;
  manageOfferings: string;
  manageEvaluations: string;
  signOut: string;
  /** The small-viewport navigation menu control (fix-production-aut-findings D7). */
  navigationMenu: string;
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
  /** The session's sign out (spec: "Sign out"). */
  onSignOut: () => void;
  onLocaleChange: (locale: string) => void;
  /** The current route path, for the navigation's current entry (refine-app-header design.md D14). */
  currentPath?: string;
  /**
   * Rendered first in the left group, before the logotype: the shell's
   * sidebar re-open control (add-sidebar-slot design.md D6).
   */
  leading?: ReactNode;
};

const HEADER_CLASSES = ["flex", "h-16", "items-center", "gap-4", "bg-nav-surface", "px-4"].join(" ");

// ─── The two groups of the header layout (corrections.md round 3) ───
// The logo and the primary navigation sit on the left; the language selector
// and the session control ("Sign in", or the avatar once signed in) are one
// group pushed to the right edge. Neither group is gated by a breakpoint, so
// the same two-group layout holds on every viewport while only the navigation
// and the logotype form change at `md` (design summary §3).
const LEFT_GROUP_CLASSES = ["flex", "items-center", "gap-4"].join(" ");
const RIGHT_GROUP_CLASSES = ["ml-auto", "flex", "items-center", "gap-4"].join(" ");

/**
 * Tazavera app header (design summary §3).
 *
 * Signed out it shows the brand logotype, the primary navigation (from `md`;
 * below it the navigation menu control, fix-production-aut-findings D7),
 * the language selector and the "Sign in" action; signed in it shows the user
 * menu instead of the "Sign in" action; while the session resolves it shows
 * neither (spec: "Session resolving"). The user menu carries the account
 * entry, security, theme selector, management entry and sign out.
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
  onSignOut,
  onLocaleChange,
  currentPath,
  leading,
}: AppHeaderProps): ReactNode {
  return (
    <header className={HEADER_CLASSES}>
      <div className={LEFT_GROUP_CLASSES}>
        {leading}
        <span className="md:hidden">
          <Logo
            variant="icon"
            size={32}
            locale={locale}
            aria-label={texts.brandLink}
          />
        </span>
        <span className="hidden md:inline-flex">
          <Logo variant="inline" size={32} locale={locale} />
        </span>
        <NavigationMenu locale={locale} texts={texts} currentPath={currentPath} />
        <PrimaryNav locale={locale} texts={texts} currentPath={currentPath} />
      </div>
      <div className={RIGHT_GROUP_CLASSES}>
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
        {session.state === "authenticated" && (
          <UserMenu
            user={session.user}
            locale={locale}
            texts={texts}
            onSignOut={onSignOut}
          />
        )}
      </div>
    </header>
  );
}
