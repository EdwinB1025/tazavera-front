"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar, MANAGE_ROUTE } from "./AppSidebar";
import { useAppSidebar } from "./AppSidebarContext";

/**
 * The shell's default sidebar (design.md D4): the management sidebar for an
 * authenticated session on a `/[locale]/manage/*` route, nothing elsewhere
 * (spec: "Hidden outside the management area").
 */
export function DefaultSidebar(): ReactNode {
  const { session } = useAppSidebar();
  const pathname = usePathname();
  const visible =
    session.state === "authenticated" && MANAGE_ROUTE.test(pathname ?? "");

  return visible ? <AppSidebar /> : null;
}
