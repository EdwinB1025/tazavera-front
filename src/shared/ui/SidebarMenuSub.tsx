"use client";

import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { Collapsible, CollapsibleBody, CollapsibleHeader } from "./Collapsible";
import { useSidebar } from "./Sidebar";

// ─── UI-specific types (declared before the components) ───

export type SidebarMenuSubProps = {
  /** The toggle's text and accessible name, from the consumer's catalog. */
  title: string;
  children?: ReactNode;
};

// The toggle takes the sidebar entry's hover treatment (Sidebar.tsx
// MENU_BUTTON_CLASSES); the collapsible header keeps its own focus ring.
const TOGGLE_CLASSES = [
  "px-3",
  "hover:bg-nav-hover",
  "hover:text-nav-text-hover",
].join(" ");

/**
 * A sidebar entry's collapsible sub-section (collapse-sidebar-filters; spec
 * app-shell "Sidebar entry sub-section"): the shared `Collapsible`, driven by
 * the provider's `subsectionOpen` so a control outside the sidebar (the
 * toolbar's "Filters") can open it. Closed on arrival, and closed again when
 * it unmounts, so the next route starts closed.
 */
export function SidebarMenuSub({ title, children }: SidebarMenuSubProps): ReactNode {
  const { subsectionOpen, setSubsectionOpen } = useSidebar();
  useEffect(() => () => setSubsectionOpen(false), [setSubsectionOpen]);
  return (
    <Collapsible open={subsectionOpen} onOpenChange={setSubsectionOpen}>
      <div data-slot="sidebar-menu-sub" className="flex flex-col gap-1 ps-3">
        <CollapsibleHeader className={TOGGLE_CLASSES}>{title}</CollapsibleHeader>
        <CollapsibleBody>{children}</CollapsibleBody>
      </div>
    </Collapsible>
  );
}

const SidebarSubsectionContext = createContext<ReactNode>(null);

/** Hands a sub-section to the entry that nests it (`SidebarSubsectionOutlet`). */
export function SidebarSubsectionProvider({
  subsection,
  children,
}: {
  subsection: ReactNode;
  children?: ReactNode;
}): ReactNode {
  return (
    <SidebarSubsectionContext.Provider value={subsection}>
      {children}
    </SidebarSubsectionContext.Provider>
  );
}

/** Renders, under an entry, the sub-section its sidebar provides (or nothing). */
export function SidebarSubsectionOutlet(): ReactNode {
  return useContext(SidebarSubsectionContext);
}
