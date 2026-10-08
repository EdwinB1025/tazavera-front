"use client";

import { createContext, useContext, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import type { Session } from "@/shared/api";

// ─── UI-specific types (declared before the component) ───
// The sidebar frame reads what the shell knows (design.md D4): the resolved
// session, the role-based entries the management area contributes through the
// provider's seam, and the catalog's toggle text for the sidebar controls.

/** What `AppSidebarProvider` carries to every sidebar frame (design.md D4). */
export type AppSidebarContextValue = {
  /** The resolved session (`Session` comes from `@/shared/api`). */
  session: Session;
  /** Role-based navigation entries contributed through the provider's seam. */
  entries?: ReactNode;
  /** Accessible name of the sidebar's collapse control (`toggleSidebar`). */
  toggleLabel: string;
  /** Name of the sidebar's navigation landmark (label-landmarks-and-headings D1). */
  navigationLabel?: string;
};

export type AppSidebarProviderProps = AppSidebarContextValue & {
  children?: ReactNode;
};

const AppSidebarContext = createContext<AppSidebarContextValue | null>(null);

/**
 * Where focus goes once the sidebar's toggle switches on a medium or larger
 * viewport (design.md D6): both controls unmount on the switch, so the one
 * activated records the control that mounts next and that control takes
 * focus on mount. Slice-internal.
 */
export type FocusIntent = "reopen" | "collapse" | null;
const FocusIntentContext = createContext<RefObject<FocusIntent> | null>(null);

/** Rendered by `SessionShell` around the chrome and the main area (D4, D5). */
export function AppSidebarProvider({
  session,
  entries,
  toggleLabel,
  navigationLabel,
  children,
}: AppSidebarProviderProps): ReactNode {
  const focusIntent = useRef<FocusIntent>(null);
  return (
    <AppSidebarContext.Provider value={{ session, entries, toggleLabel, navigationLabel }}>
      <FocusIntentContext.Provider value={focusIntent}>
        {children}
      </FocusIntentContext.Provider>
    </AppSidebarContext.Provider>
  );
}

export function useAppSidebar(): AppSidebarContextValue {
  const context = useContext(AppSidebarContext);
  if (!context) {
    throw new Error("useAppSidebar must be used within an AppSidebarProvider");
  }
  return context;
}

export function useFocusIntent(): RefObject<FocusIntent> {
  const context = useContext(FocusIntentContext);
  if (!context) {
    throw new Error("useFocusIntent must be used within an AppSidebarProvider");
  }
  return context;
}
