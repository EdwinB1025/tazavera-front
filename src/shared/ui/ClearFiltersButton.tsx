"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { clearFiltersHref, useFilterNavigation } from "@/shared/lib/filter-query";
import { Button } from "./Button";

// ─── UI-specific types (declared before the component) ───

export type ClearFiltersButtonProps = {
  /** The visible text and accessible name (the host's `filters.clearAll`). */
  label: string;
  /** The query keys that survive; passed to `clearFiltersHref` unchanged. */
  keep: readonly string[];
};

/**
 * "Clear all" of a filtered empty list (extract-clear-filters-button design.md
 * D1–D3; spec "Clear all action for an empty filtered list"): every query key
 * but `keep` removed, the page dropped, opened without moving the scroll.
 */
export function ClearFiltersButton({ label, keep }: ClearFiltersButtonProps): ReactNode {
  const { navigateTo } = useFilterNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <Button
      type="button"
      variant="primary"
      onClick={() =>
        navigateTo(
          clearFiltersHref(pathname ?? "", new URLSearchParams(searchParams?.toString()), keep),
        )
      }
    >
      {label}
    </Button>
  );
}
