"use client";

import { createContext, useContext, useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { Collapsible, CollapsibleBody, CollapsibleHeader } from "./Collapsible";
import { useSidebar } from "./Sidebar";

// ─── UI-specific types (declared before the components) ───

export type SidebarMenuSubProps = {
  /** The toggle's text and accessible name, from the consumer's catalog. */
  title: string;
  children?: ReactNode;
};

// The toggle takes the sidebar entry's text colour and hover treatment
// (Sidebar.tsx MENU_BUTTON_CLASSES); the collapsible header keeps its own
// focus ring. The header's title and chevron colour through
// --color-text-accent, so the toggle points that variable at the entry
// tokens (theming "Text and button contrast").
const TOGGLE_CLASSES = [
  "px-3",
  "text-nav-text-dark",
  "[--color-text-accent:var(--color-nav-text-dark)]",
  "hover:bg-nav-hover",
  "hover:text-nav-text-hover",
  "hover:[--color-text-accent:var(--color-nav-text-hover)]",
].join(" ");

/**
 * A sidebar entry's collapsible sub-section (collapse-sidebar-filters; spec
 * app-shell "Sidebar entry sub-section"): the shared `Collapsible`, driven by
 * the provider's `subsectionOpen` so a control outside the sidebar (the
 * toolbar's "Filters") can open it. Closed on arrival, and closed again when
 * it unmounts, so the next route starts closed. Its content learns whether
 * it has been opened since it mounted (lazy-load-facet-controls design.md D2).
 */
export function SidebarMenuSub({ title, children }: SidebarMenuSubProps): ReactNode {
  const { subsectionOpen, setSubsectionOpen } = useSidebar();
  const toggleId = useId();
  const [opened, setOpened] = useState(false);
  if (subsectionOpen && !opened) setOpened(true);
  useEffect(() => () => setSubsectionOpen(false), [setSubsectionOpen]);
  return (
    <Collapsible open={subsectionOpen} onOpenChange={setSubsectionOpen}>
      <div data-slot="sidebar-menu-sub" className="flex flex-col gap-1 ps-3">
        <CollapsibleHeader id={toggleId} className={TOGGLE_CLASSES}>
          {title}
        </CollapsibleHeader>
        <SubsectionToggleContext.Provider value={toggleId}>
          <SubsectionOpenedContext.Provider value={opened}>
            <CollapsibleBody>{children}</CollapsibleBody>
          </SubsectionOpenedContext.Provider>
        </SubsectionToggleContext.Provider>
      </div>
    </Collapsible>
  );
}

/**
 * The id of the enclosing sub-section's toggle, or `null` outside one
 * (drop-duplicate-filter-title design.md D1): content titled by the toggle,
 * such as the facet panel, shows no title of its own.
 */
export const SubsectionToggleContext = createContext<string | null>(null);

/**
 * Whether the enclosing sub-section has been opened since it mounted, or
 * `true` outside one (lazy-load-facet-controls design.md D2): content that
 * loads its code on the first opening, such as the facet comboboxes.
 */
export const SubsectionOpenedContext = createContext(true);

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
