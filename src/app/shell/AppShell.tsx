import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
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
  /** The management sidebar region (filled by `@/widgets/app-sidebar`). */
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
 * (design.md D1; review round 2). The layout is unchanged.
 */
export function AppShell({
  locale,
  session,
  sidebar,
  children,
}: AppShellProps): ReactNode {
  const texts = getMessages("shell", locale);

  return (
    <SessionShell
      locale={locale}
      session={session}
      sidebar={sidebar}
      texts={{
        topRated: texts.topRated!,
        aboutUs: texts.aboutUs!,
        signIn: texts.signIn!,
        languageSelector: texts.languageSelector!,
        brandLink: texts.brandLink!,
        profile: texts.profile!,
        editProfile: texts.editProfile!,
        changePassword: texts.changePassword!,
        deactivateAccount: texts.deactivateAccount!,
        deleteAccount: texts.deleteAccount!,
        security: texts.security!,
        themeSelector: texts.themeSelector!,
        manageOfferings: texts.manageOfferings!,
        manageEvaluations: texts.manageEvaluations!,
        signOut: texts.signOut!,
        toggleSidebar: texts.toggleSidebar!,
      }}
    >
      {children}
    </SessionShell>
  );
}
