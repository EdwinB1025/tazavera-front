import type { ReactNode } from "react";
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
};
