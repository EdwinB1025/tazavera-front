import type { ReactNode } from "react";
import { OfferingFacets, type OfferingFacetsProps } from "@/features/offering-facets";
import { AppSidebar } from "@/widgets/app-sidebar";

// ─── UI-specific types (declared before the component) ───

export type OfferingsSidebarProps = OfferingFacetsProps;

/**
 * The offerings list's sidebar (add-sidebar-slot design.md D9;
 * add-offering-facets design.md D7): the frame for every session state, with
 * no navigation entries, holding the offering facet panel as its content.
 */
export function OfferingsSidebar(props: OfferingsSidebarProps): ReactNode {
  return (
    <AppSidebar>
      <OfferingFacets {...props} />
    </AppSidebar>
  );
}
