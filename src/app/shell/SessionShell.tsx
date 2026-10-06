"use client";

import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { LOCALES } from "@/shared/config/locales";
import { useSession } from "@/features/auth";
import { SidebarProvider } from "@/shared/ui";
import { AppSidebarProvider, DefaultSidebar } from "@/widgets/app-sidebar";
import type { AppHeaderTexts } from "@/widgets/app-header";
import { ShellChrome } from "./ShellChrome";

// ─── UI-specific types (declared before the component) ───

export type SessionShellProps = {
  locale: string;
  /** The `session?` override of `AppShell` (review round 2, item 2). */
  session?: Session;
  /** The route's sidebar (the `@sidebar` slot); absent, the default one. */
  sidebar?: ReactNode;
  /** The catalog texts `AppShell` resolves on the server (design.md D1). */
  texts: AppHeaderTexts & { toggleSidebar: string };
  children?: ReactNode;
};

// Always `md:flex` (design.md D5): presence is only known after hydration,
// so the layout never switches. The column sizes itself on its content: with
// no sidebar mounted it is empty and zero-wide, a single column remains.
const MAIN_CLASSES = ["bg-surface-page", "flex-1", "md:flex"].join(" ");
const SIDEBAR_COLUMN_CLASSES = "shrink-0";
const CONTENT_CLASSES = ["min-w-0", "flex-1"].join(" ");

/**
 * Session seam of the app shell (design.md D1; review round 2, items 1–2;
 * spec "Shell layout and main area").
 *
 * `AppShell` stays a Server Component that resolves the catalog texts and
 * passes them here; this client boundary owns the session: it calls
 * `useSession()` unconditionally and renders `ShellChrome` and the sidebar
 * providers with `session ?? <hook value>`, so an explicit session still
 * wins. The sidebar state and the sidebar's session live at this level
 * (add-sidebar-slot design.md D3, D5).
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

  // design.md D5: one sidebar state for the header, the sidebar and the page
  // body; the region is the route's slot or the default sidebar.
  return (
    // The provider's own element is the shell root (refine-app-header D15).
    <SidebarProvider className="flex flex-1 flex-col">
      <AppSidebarProvider session={supplied} toggleLabel={texts.toggleSidebar}>
        <ShellChrome
          session={supplied}
          locale={locale}
          locales={[...LOCALES]}
          texts={texts}
        />
        <main className={MAIN_CLASSES}>
          <div className={SIDEBAR_COLUMN_CLASSES}>
            {sidebar ?? <DefaultSidebar />}
          </div>
          <div className={CONTENT_CLASSES}>{children}</div>
        </main>
      </AppSidebarProvider>
    </SidebarProvider>
  );
}
