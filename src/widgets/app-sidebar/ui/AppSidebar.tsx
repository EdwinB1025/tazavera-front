"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/shared/ui";
import { useAppSidebar, useFocusIntent } from "./AppSidebarContext";

// ─── UI-specific types (declared before the component) ───

export type AppSidebarProps = {
  /** Navigation entries contributed by the management area in view. */
  entries?: ReactNode;
  /** The route's own sidebar content (a list's controls), after the entries. */
  children?: ReactNode;
};

// A management route is `/[locale]/manage/*` (design summary §1).
export const MANAGE_ROUTE = /^\/[^/]+\/manage(\/|$)/;

/**
 * Sidebar frame (add-sidebar-slot design.md D4; spec "Management sidebar").
 *
 * Always rendered when mounted: a route's slot screen mounts it with its own
 * content, `DefaultSidebar` applies the management rule. The navigation holds
 * the provider's role-based entries (only on a management route with an
 * authenticated session) followed by the `entries` prop; on a management
 * route with none it is empty (spec: "No entries contributed"), and without
 * entries outside the management area there is no navigation at all.
 */
export function AppSidebar({ entries, children }: AppSidebarProps): ReactNode {
  const { session, entries: roleEntries, toggleLabel, navigationLabel } = useAppSidebar();
  const { isMobile, open, toggleSidebar } = useSidebar();
  const focusIntentRef = useFocusIntent();
  const headerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Re-opened from the header's control: focus moves to the collapse control
  // (design.md D6; spec "Re-opening the sidebar").
  useEffect(() => {
    if (open && focusIntentRef.current === "collapse") {
      focusIntentRef.current = null;
      headerRef.current?.querySelector("button")?.focus();
    }
  }, [open, focusIntentRef]);

  const handleToggle = () => {
    if (!isMobile) focusIntentRef.current = "reopen";
    toggleSidebar();
  };
  const managing =
    session.state === "authenticated" && MANAGE_ROUTE.test(pathname ?? "");

  return (
    <Sidebar label={toggleLabel}>
      <SidebarHeader ref={headerRef}>
        <SidebarTrigger aria-label={toggleLabel} onClick={handleToggle} />
      </SidebarHeader>
      <SidebarContent>
        {(managing || entries) && (
          <nav aria-label={navigationLabel}>
            {managing && roleEntries}
            {entries}
          </nav>
        )}
        {children}
      </SidebarContent>
    </Sidebar>
  );
}
