"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { clearFiltersHref, useFilterNavigation } from "@/shared/lib/filter-query";
import { Button } from "@/shared/ui";
import { OFFERING_SORT_KEYS } from "./OfferingFacets";

// ─── UI-specific types (declared before the component) ───

export type ClearFiltersButtonProps = {
  /** `filters.clearAll`. */
  label: string;
};

/**
 * "Clear all" of the catalog's filtered empty state (design.md D5, D9; R9
 * option (b)): the panel's "Clear all" behaviour — every filter key removed,
 * the sort kept.
 */
export function ClearFiltersButton({ label }: ClearFiltersButtonProps): ReactNode {
  const { navigateTo } = useFilterNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <Button
      type="button"
      variant="primary"
      onClick={() =>
        navigateTo(
          clearFiltersHref(
            pathname ?? "",
            new URLSearchParams(searchParams?.toString()),
            OFFERING_SORT_KEYS,
          ),
        )
      }
    >
      {label}
    </Button>
  );
}
