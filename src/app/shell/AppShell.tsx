import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { LOCALES, type Locale } from "@/shared/config/locales";
import { LOCALE_NAMES } from "@/shared/config/locale-names";
import { getMessages } from "@/shared/lib/i18n";
import { AppSidebar } from "@/widgets/app-sidebar";
import { ShellChrome } from "./ShellChrome";

// ─── UI-specific types (declared before the component) ───

export type AppShellProps = {
  locale: string;
  /**
   * The session as input (design.md D3). Absent or unresolvable, the shell
   * renders the anonymous one (spec: "Session unresolvable"); `add-auth`
   * supplies the real session later.
   */
  session?: Session;
  /** The management sidebar region (filled by `@/widgets/app-sidebar`). */
  sidebar?: ReactNode;
  children?: ReactNode;
};

const ANONYMOUS: Session = { state: "anonymous" };

const MAIN_CLASSES = ["bg-surface-page", "flex-1"].join(" ");
// The column sizes itself on its content: with the sidebar region hidden it
// collapses to nothing and the main area stays a single column.
const SIDEBAR_COLUMN_CLASSES = ["hidden", "md:block", "shrink-0"].join(" ");
const CONTENT_CLASSES = ["min-w-0", "flex-1"].join(" ");

/**
 * Tazavera app shell (design.md D1, D3, D5, D11; spec "Shell layout and main
 * area").
 *
 * Layout wiring: the header above a main area on `bg-surface-page`. The main
 * area is one column without the sidebar and gives the sidebar its own column
 * beside the content from `md` when the region is filled. The composition
 * resolves the message catalog and supplies the session — one expression here
 * (the anonymous constant) until `add-auth` rewires it.
 */
export function AppShell({
  locale,
  session,
  sidebar,
  children,
}: AppShellProps): ReactNode {
  const supplied = session ?? ANONYMOUS;
  const texts = getMessages("shell", locale);
  // The sidebar region: the management sidebar is mounted here for an
  // authenticated session (it shows itself only on a management route) and a
  // caller may fill the region explicitly.
  const region =
    sidebar ??
    (supplied.state === "authenticated" ? (
      <AppSidebar
        session={supplied}
        toggleLabel={texts.toggleSidebar!}
      />
    ) : undefined);

  return (
    <div className="flex min-h-full flex-col">
      <ShellChrome
        session={supplied}
        locale={locale}
        locales={[...LOCALES]}
        texts={{
          topRated: texts.topRated!,
          aboutUs: texts.aboutUs!,
          signIn: texts.signIn!,
          // design.md D6: the shell composes one name — the current locale's
          // code in uppercase, then " — ", then the catalog word with the
          // current language's own name, e.g. "ES — Idioma: Español" for es —
          // and passes it as one string (spec: "Selector is named"). The shell
          // renders only on a supported-locale root (`proxy.ts` resolves any
          // other prefix to not-found), so the active locale indexes the
          // names.
          languageSelector: `${locale.toUpperCase()} — ${texts.languageSelector!}: ${LOCALE_NAMES[locale as Locale].name}`,
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
        }}
      />
      <main className={region ? `${MAIN_CLASSES} md:flex` : MAIN_CLASSES}>
        {region && <aside className={SIDEBAR_COLUMN_CLASSES}>{region}</aside>}
        <div className={CONTENT_CLASSES}>{children}</div>
      </main>
    </div>
  );
}
