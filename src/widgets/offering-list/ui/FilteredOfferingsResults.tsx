import { Suspense, type ReactNode } from "react";
import {
  ClearFiltersButton,
  hasOfferingFilters,
  parseOfferingFilters,
  sanitizeOfferingQuery,
} from "@/features/offering-facets";
import { CATALOG_GRID_CLASSES } from "../lib/grid";
import { buildOfferingsQuery, type OfferingsQuery } from "../lib/query";
import type { OfferingListTexts } from "./OfferingList";
import { OfferingSkeletonCard } from "./OfferingSkeletonCard";
import { Offerings } from "./Offerings";

// ─── UI-specific types (declared before the component) ───

/** The list texts, with `emptyMessage` as the unfiltered empty message. */
export type FilteredOfferingsResultsTexts = OfferingListTexts & {
  noMatches: string;
  clearAll: string;
};

export type FilteredOfferingsResultsProps = {
  locale: string;
  /** The address query; only the contract's names are kept. */
  searchParams: OfferingsQuery;
  /** The pagination path, `/${locale}/offerings` in the catalog. */
  path: string;
  /** Keys forced on the request, over the same keys of the address. */
  fixedQuery?: OfferingsQuery;
  texts: FilteredOfferingsResultsTexts;
};

// Placeholder cards rendered while the list loads (spec "Loading").
const SKELETON_CARD_KEYS = [0, 1, 2] as const;

/**
 * The filtered offerings results (extract-filtered-offerings design.md D3;
 * spec "Filtered offerings scoped by a host"): the kept address query, with
 * out-of-limit facet values dropped and the fixed keys applied after, drives
 * the list inside a `Suspense` boundary whose fallback is the skeleton cards
 * in the catalog column. Only the address makes the list "filtered": then the
 * empty state shows the no-matches message and "Clear all".
 */
export function FilteredOfferingsResults({
  locale,
  searchParams,
  path,
  fixedQuery,
  texts,
}: FilteredOfferingsResultsProps): ReactNode {
  const query = { ...sanitizeOfferingQuery(buildOfferingsQuery(searchParams)), ...fixedQuery };
  const filtered = hasOfferingFilters(parseOfferingFilters(searchParams));
  const { noMatches, clearAll, ...listTexts } = texts;

  return (
    <Suspense
      fallback={
        <div className="@container">
          <div className={CATALOG_GRID_CLASSES}>
            {SKELETON_CARD_KEYS.map((key) => (
              <OfferingSkeletonCard key={key} />
            ))}
          </div>
        </div>
      }
    >
      <Offerings
        locale={locale}
        query={query}
        texts={filtered ? { ...listTexts, emptyMessage: noMatches } : listTexts}
        path={path}
        gridClassName={CATALOG_GRID_CLASSES}
        emptyAction={filtered ? <ClearFiltersButton label={clearAll} /> : undefined}
      />
    </Suspense>
  );
}
