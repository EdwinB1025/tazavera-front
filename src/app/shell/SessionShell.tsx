"use client";

import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { LOCALES } from "@/shared/config/locales";
import { useSession } from "@/features/auth";
import { EvaluationsSidebarEntry } from "@/features/manage-evaluations";
import { AppSidebar } from "@/widgets/app-sidebar";
import type { AppHeaderTexts } from "@/widgets/app-header";
import { ShellChrome } from "./ShellChrome";

// ─── UI-specific types (declared before the component) ───

export type SessionShellProps = {
  locale: string;
  /** The `session?` override of `AppShell` (review round 2, item 2). */
  session?: Session;
  /** The management sidebar region, when a caller fills it explicitly. */
  sidebar?: ReactNode;
  /** The catalog texts `AppShell` resolves on the server (design.md D1). */
  texts: AppHeaderTexts & { toggleSidebar: string };
  children?: ReactNode;
};

const MAIN_CLASSES = ["bg-surface-page", "flex-1"].join(" ");
// The column sizes itself on its content: with the sidebar region hidden it
// collapses to nothing and the main area stays a single column.
const SIDEBAR_COLUMN_CLASSES = ["hidden", "md:block", "shrink-0"].join(" ");
const CONTENT_CLASSES = ["min-w-0", "flex-1"].join(" ");

/**
 * Session seam of the app shell (design.md D1; review round 2, items 1–2;
 * spec "Shell layout and main area").
 *
 * `AppShell` stays a Server Component that resolves the catalog texts and
 * passes them here; this client boundary owns the session: it calls
 * `useSession()` unconditionally and renders `ShellChrome` and the sidebar
 * region with `session ?? <hook value>`, so an explicit session still wins.
 * `ShellChrome` and `AppSidebar` keep receiving the session as input,
 * unchanged. The rendered layout is unchanged.
 */
export function SessionShell({
  locale,
  session,
  sidebar,
  texts,
  children,
}: SessionShellProps): ReactNode {
  const hookValue = useSession();
  const supplied = session ?? hookValue;
  // The sidebar region: the management sidebar is mounted here for an
  // authenticated session (it shows itself only on a management route) and a
  // caller may fill the region explicitly. Its entries are the management
  // area's for the session's role, by the user menu's role rule
  // (add-specialist-evaluations design.md D5): a specialist gets "My
  // evaluations"; no other role contributes entries here.
  const entries =
    supplied.state === "authenticated" && supplied.user.role === "specialist" ? (
      <EvaluationsSidebarEntry locale={locale} texts={{ label: texts.manageEvaluations }} />
    ) : undefined;
  const region =
    sidebar ??
    (supplied.state === "authenticated" ? (
      <AppSidebar
        session={supplied}
        entries={entries}
        toggleLabel={texts.toggleSidebar}
      />
    ) : undefined);

  return (
    <div className="flex flex-1 flex-col">
      <ShellChrome
        session={supplied}
        locale={locale}
        locales={[...LOCALES]}
        texts={texts}
      />
      <main className={region ? `${MAIN_CLASSES} md:flex` : MAIN_CLASSES}>
        {region && <aside className={SIDEBAR_COLUMN_CLASSES}>{region}</aside>}
        <div className={CONTENT_CLASSES}>{children}</div>
      </main>
    </div>
  );
}
