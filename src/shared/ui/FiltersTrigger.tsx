"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { SIDEBAR_ID, useSidebar } from "./Sidebar";
import { SlidersHorizontal } from "./icons";

// ─── UI-specific types (declared before the component) ───

export type FiltersTriggerProps = {
  /** The visible text: "Filters" or "Filters ({count})", from the caller's catalog. */
  label: string;
};

/**
 * The body "Filters" trigger (add-offering-facets design.md D8; spec
 * "Offerings filter toolbar"): opens the sidebar and its facets
 * sub-section (collapse-sidebar-filters). Below `md` it always renders (it
 * opens the full-screen overlay); from `md` only while the sidebar is
 * collapsed or the sub-section closed.
 */
export function FiltersTrigger({ label }: FiltersTriggerProps): ReactNode {
  const { open, setOpen, isMobile, subsectionOpen, setSubsectionOpen } = useSidebar();
  const expanded = open && subsectionOpen;
  if (!isMobile && expanded) return null;
  return (
    <Button
      type="button"
      variant="primary"
      icon={SlidersHorizontal}
      aria-expanded={expanded}
      aria-controls={SIDEBAR_ID}
      onClick={() => {
        setOpen(true);
        setSubsectionOpen(true);
      }}
    >
      {label}
    </Button>
  );
}
