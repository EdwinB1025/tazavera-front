import type { ReactNode } from "react";
import { DefaultSidebar } from "@/widgets/app-sidebar";

/**
 * The `@sidebar` slot's default and catch-all screen (add-sidebar-slot
 * design.md D2): the shell's default sidebar, so a soft navigation to a
 * route without its own sidebar replaces the previous route's one.
 */
export function DefaultSidebarScreen(): ReactNode {
  return <DefaultSidebar />;
}
