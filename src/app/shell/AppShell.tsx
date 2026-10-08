import { Suspense, type ReactNode } from "react";
import type { Session } from "@/shared/api";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type Locale,
} from "@/shared/config/locales";
import { LOCALE_NAMES } from "@/shared/config/locale-names";
import { getMessages } from "@/shared/lib/i18n";
import { NavigationTracker } from "./NavigationTracker";
import { SessionShell } from "./SessionShell";

// ─── UI-specific types (declared before the component) ───

export type AppShellProps = {
  locale: string;
  /**
   * The session as input (design.md D3). Absent, the shell uses the session
   * `useSession()` resolves (design.md D1); passed, it wins over the hook
   * (review round 2, item 2).
   */
  session?: Session;
  /** The `@sidebar` slot of the `[locale]` layout (add-sidebar-slot D1). */
  sidebar?: ReactNode;
  children?: ReactNode;
};

/**
 * Tazavera app shell (design.md D1, D3, D5, D11; spec "Shell layout and main
 * area").
 *
 * Server composition: it resolves the message catalog and passes its texts to
 * `SessionShell`, the `"use client"` seam that owns the session, renders the
 * header above a main area on `bg-surface-page` and chooses the sidebar region
 * (design.md D1; review round 2). The layout is unchanged. It also mounts the
 * navigation tracker behind the back link (fix-production-aut-findings
 * design.md D5).
 */
export function AppShell({
  locale,
  session,
  sidebar,
  children,
}: AppShellProps): ReactNode {
  // design.md D6 (correction 3 of round 1): the locale is resolved with
  // `isSupportedLocale` and never cast. An unsupported locale resolves to
  // DEFAULT_LOCALE (es) for the whole composition — catalog word, code and
  // own name — so the name reads "ES — Idioma: Español" and the shell
  // renders without throwing (the catalog included, since `getMessages`
  // rejects an unsupported locale).
  const active: Locale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const texts = getMessages("shell", active);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationTracker />
      </Suspense>
      <SessionShell
        locale={active}
        session={session}
        sidebar={sidebar}
        texts={{
          topRated: texts.topRated!,
          exploreCoffeeshops: texts.exploreCoffeeshops!,
          aboutUs: texts.aboutUs!,
          signIn: texts.signIn!,
          // design.md D6: the shell composes one name — the resolved
          // locale's code in uppercase, then " — ", then the catalog word
          // with the resolved language's own name, e.g.
          // "ES — Idioma: Español" for es — and passes it as one string
          // (spec: "Selector is named"), so the name leads with the code
          // the trigger shows.
          languageSelector: `${active.toUpperCase()} — ${texts.languageSelector!}: ${LOCALE_NAMES[active].name}`,
          brandLink: texts.brandLink!,
          myAccount: texts.myAccount!,
          security: texts.security!,
          themeSelector: texts.themeSelector!,
          manageOfferings: texts.manageOfferings!,
          manageEvaluations: texts.manageEvaluations!,
          signOut: texts.signOut!,
          toggleSidebar: texts.toggleSidebar!,
          navigationMenu: texts.navigationMenu!,
        }}
      >
        {children}
      </SessionShell>
    </>
  );
}
