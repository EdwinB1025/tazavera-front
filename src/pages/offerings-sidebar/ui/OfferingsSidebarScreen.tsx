import type { ReactNode } from "react";
import { AppSidebar } from "@/widgets/app-sidebar";

/**
 * The offerings list's sidebar (add-sidebar-slot design.md D9; spec "Shown on
 * the offerings list"): the frame for every session state, with no
 * navigation entries. `add-offering-facets` fills it with the facets.
 */
export function OfferingsSidebarScreen(): ReactNode {
  return <AppSidebar />;
}
