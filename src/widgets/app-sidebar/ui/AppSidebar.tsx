"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "@/shared/api";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type AppSidebarProps = {
  session: Session;
  /** Navigation entries contributed by the management area in view. */
  entries?: ReactNode;
  /** Accessible name of the collapse control (design summary §3). */
  toggleLabel: string;
};

// A management route is `/[locale]/manage/*` (design summary §1).
const MANAGE_ROUTE = /^\/[^/]+\/manage(\/|$)/;

/**
 * Management sidebar (design.md D11; spec "Management sidebar").
 *
 * It appears only for an authenticated session on a `/[locale]/manage/*`
 * route (spec: "Hidden outside the management area" — hidden, the main area
 * keeps its single column), and renders the navigation entries the management
 * area contributes, its region with no entries and no empty placeholder when
 * none are contributed (spec: "No entries contributed"). From `md` it is the
 * collapsible sidebar column; below `md` it opens as a full-screen overlay.
 */
export function AppSidebar({
  session,
  entries,
  toggleLabel,
}: AppSidebarProps): ReactNode {
  const pathname = usePathname();
  const visible =
    session.state === "authenticated" && MANAGE_ROUTE.test(pathname ?? "");

  if (!visible) return null;

  return (
    <SidebarProvider>
      <Sidebar label={toggleLabel}>
        <SidebarHeader>
          <SidebarTrigger aria-label={toggleLabel} />
        </SidebarHeader>
        <SidebarContent>
          <nav>{entries}</nav>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
