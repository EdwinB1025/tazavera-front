import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

export type FilterNavigation = {
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

/**
 * Client navigation of the facets: one history entry per change and no
 * scroll to top (`router.push(href, { scroll: false })`).
 */
export function useFilterNavigation(): FilterNavigation {
  const router = useRouter();
  const pathname = usePathname();
  // Both are nullable in the types because the root `pages/` exists; the
  // App Router always provides them.
  const searchParams = useSearchParams();

  const navigateTo = useCallback(
    (href: string) => router.push(href, { scroll: false }),
    [router],
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
