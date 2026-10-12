"use client";

import { useMemo, type ReactNode } from "react";
import { FilterMemoryContext } from "@/shared/lib/filter-query";

// ─── UI-specific types (declared before the component) ───

export type FilterMemoryScopeProps = {
  /** The list's storage name, the same in its page and in its sidebar slot. */
  name: string;
  /** The query keys the list keeps: its filters and its order. */
  keys: readonly string[];
  children: ReactNode;
};

/**
 * The memory of an editing list (remember-list-preferences design.md D2;
 * spec "Editing lists remember their filters and order for the tab"): inside
 * it, every facet navigation keeps the list's filters and order for the tab.
 */
export function FilterMemoryScope({ name, keys, children }: FilterMemoryScopeProps): ReactNode {
  const joined = keys.join(",");
  // The keys come as a new array on every server render; their content keys the value.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memory = useMemo(() => ({ name, keys }), [name, joined]);
  return <FilterMemoryContext.Provider value={memory}>{children}</FilterMemoryContext.Provider>;
}
