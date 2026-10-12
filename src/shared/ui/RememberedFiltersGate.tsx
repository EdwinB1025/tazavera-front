"use client";

import { useContext, useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterMemoryContext, rememberedQuery } from "@/shared/lib/filter-query";

// ─── UI-specific types (declared before the component) ───

export type RememberedFiltersGateProps = {
  /** Shown in the list's place while the kept filters are being restored. */
  fallback: ReactNode;
  /** The part of the list that starts its read. */
  children: ReactNode;
};

/**
 * The restore of an editing list (remember-list-preferences design.md D3;
 * spec "Editing lists remember their filters and order for the tab"): when
 * the address carries none of the list's keys and the tab keeps a query, the
 * address is replaced by it — no history entry added, page 1 — and the list
 * renders only once the address carries it, so its one read is the request
 * of that address. Outside a list's memory it renders the list.
 */
export function RememberedFiltersGate({ fallback, children }: RememberedFiltersGateProps): ReactNode {
  const memory = useContext(FilterMemoryContext);
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const carriesKey = memory?.keys.some((key) => searchParams?.has(key)) ?? true;
  const kept = memory && !carriesKey ? rememberedQuery(memory) : "";
  const target = kept === "" ? null : `${pathname}?${kept}`;

  useEffect(() => {
    if (target) router.replace(target, { scroll: false });
  }, [router, target]);

  return target ? fallback : children;
}
