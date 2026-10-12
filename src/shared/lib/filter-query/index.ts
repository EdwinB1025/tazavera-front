import { createContext, useCallback, useContext } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { readTabValue, removeTabValues, writeTabValue } from "@/shared/lib/tab-storage";

/**
 * URL writes of the facet panels (add-offering-facets design.md D4). The
 * query is the only filter state: every committed change navigates to the
 * same path with the new query and without `page`.
 */

// ─── Types ───

/** Next's `searchParams` shape; structurally the catalog's `OfferingsQuery`. */
export type QueryRecord = Record<string, string | string[] | undefined>;

/**
 * Keys to replace: a string writes one value, an array one repeated key per
 * element; `undefined`, `""` or `[]` removes the key.
 */
export type FilterChanges = Record<string, string | readonly string[] | undefined>;

/**
 * A list's memory (remember-list-preferences design.md D2): its storage name
 * and the query keys it keeps for the browser tab.
 */
export type FilterMemory = { name: string; keys: readonly string[] };

type FilterNavigation = {
  navigate: (changes: FilterChanges) => void;
  navigateTo: (href: string) => void;
};

function valuesOf(change: string | readonly string[] | undefined): readonly string[] {
  if (change === undefined) return [];
  if (typeof change === "string") return change === "" ? [] : [change];
  return change;
}

function hrefOf(pathname: string, params: URLSearchParams): string {
  const query = params.toString();
  return query === "" ? pathname : `${pathname}?${query}`;
}

/**
 * The href with `changes` applied: changed keys replace the current ones in
 * place, the other keys keep their order, new keys are appended and `page`
 * is always removed.
 */
export function buildFilterHref(
  pathname: string,
  current: URLSearchParams,
  changes: FilterChanges,
): string {
  const next = new URLSearchParams();
  const written = new Set<string>();
  for (const [key, value] of current) {
    if (key === "page") continue;
    if (!Object.hasOwn(changes, key)) {
      next.append(key, value);
    } else if (!written.has(key)) {
      written.add(key);
      for (const item of valuesOf(changes[key])) next.append(key, item);
    }
  }
  for (const key of Object.keys(changes)) {
    if (key === "page" || written.has(key)) continue;
    for (const item of valuesOf(changes[key])) next.append(key, item);
  }
  return hrefOf(pathname, next);
}

/** The href keeping only the `keep` keys (and never `page`). */
export function clearFiltersHref(
  pathname: string,
  current: URLSearchParams,
  keep: readonly string[],
): string {
  const next = new URLSearchParams();
  for (const [key, value] of current) {
    if (key !== "page" && keep.includes(key)) next.append(key, value);
  }
  return hrefOf(pathname, next);
}

// ─── List memory (remember-list-preferences design.md D2) ───

const MEMORY_PREFIX = "tazavera.list-filters.";

/** The memory of the enclosing list, or `null` outside an editing list. */
export const FilterMemoryContext = createContext<FilterMemory | null>(null);

/** The kept query of a list (`""` when none or unreadable). */
export function rememberedQuery(memory: FilterMemory): string {
  return readTabValue(`${MEMORY_PREFIX}${memory.name}`) ?? "";
}

/** Keeps the href's query restricted to the memory's keys, never `page`. */
function rememberQuery(memory: FilterMemory, href: string): void {
  const kept = new URLSearchParams();
  const query = href.includes("?") ? href.slice(href.indexOf("?") + 1) : "";
  for (const [key, value] of new URLSearchParams(query)) {
    if (key !== "page" && memory.keys.includes(key)) kept.append(key, value);
  }
  writeTabValue(`${MEMORY_PREFIX}${memory.name}`, kept.toString());
}

/** Forgets the kept query of every list (design.md D4). */
export function forgetRememberedFilters(): void {
  removeTabValues(MEMORY_PREFIX);
}

/**
 * Client navigation of the facets: one history entry per change and no
 * scroll to top (`router.push(href, { scroll: false })`). Inside a list's
 * memory, every navigation first keeps its filters and order.
 */
export function useFilterNavigation(): FilterNavigation {
  const router = useRouter();
  const pathname = usePathname();
  // Both are nullable in the types because the root `pages/` exists; the
  // App Router always provides them.
  const searchParams = useSearchParams();
  const memory = useContext(FilterMemoryContext);

  const navigateTo = useCallback(
    (href: string) => {
      if (memory) rememberQuery(memory, href);
      router.push(href, { scroll: false });
    },
    [router, memory],
  );
  const navigate = useCallback(
    (changes: FilterChanges) =>
      navigateTo(
        buildFilterHref(pathname ?? "", new URLSearchParams(searchParams?.toString()), changes),
      ),
    [navigateTo, pathname, searchParams],
  );
  return { navigate, navigateTo };
}
