import type { ReactNode } from "react";
import type { CoffeeshopsPageMeta, CoffeeshopSummary } from "@/shared/api";
import { CoffeeshopCard, hasLocatedLocation, type CoffeeshopCardTexts } from "@/entities/coffeeshop";
import { COFFEESHOP_CLEAR_KEEP } from "@/features/coffeeshop-facets";
import { ClearFiltersButton, Pagination, ResultStatus, RetryButton, type PaginationTexts } from "@/shared/ui";
import { COFFEESHOP_COLUMN_CLASSES } from "../lib/column";
import { CoffeeshopsMapView, type CoffeeshopsMapTexts } from "./CoffeeshopsMapView";
import { ShowOnMapButton } from "./ShowOnMapButton";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopListTexts = CoffeeshopCardTexts &
  PaginationTexts & {
    emptyMessage: string;
    errorMessage: string;
    retryLabel: string;
    /** The polite result announcement, with a `{count}` placeholder (design.md D6). */
    resultCount: string;
    noMatches: string;
    clearAll: string;
    /** "Show {name} on the map" (design.md D13). */
    showOnMapLabel: string;
  };

/** The map view's texts besides the pagination's (design.md D13). */
export type CoffeeshopListMapTexts = Omit<
  CoffeeshopsMapTexts,
  "previousLabel" | "nextLabel" | "navigationLabel" | "pageLabel"
>;

/** The fetch result, mapped before it reaches this view (design.md D7). */
export type CoffeeshopListResult =
  | { state: "success"; items: CoffeeshopSummary[]; meta: CoffeeshopsPageMeta }
  | { state: "empty" }
  | { state: "error" };

export type CoffeeshopListProps = {
  result: CoffeeshopListResult;
  locale: string;
  /** The request's query; the pagination keeps it and replaces `page` (design.md D4). */
  query: Record<string, string>;
  /** At least one coffee shop filter is applied: the empty state is "no matches" (design.md D6). */
  filtered?: boolean;
  /** The address's view: the map replaces the cards of a non-empty page (design.md D13). */
  view?: "map";
  /** The address's `focus` (design.md D13). */
  focus?: string;
  texts: CoffeeshopListTexts;
  /** Needed for the map view only. */
  mapTexts?: CoffeeshopListMapTexts;
};

// The column, then the pagination 2rem below it.
const BLOCK_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const EMPTY_CLASSES = ["text-center", "text-text-primary"].join(" ");
const EMPTY_ACTION_CLASSES = ["flex", "flex-col", "items-center", "gap-4"].join(" ");
const ERROR_CLASSES = ["flex", "flex-col", "items-center", "gap-4", "text-text-primary"].join(" ");

/** The request's query without `page`, which the pagination writes itself. */
function pagingQuery(query: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(query).filter(([key]) => key !== "page"));
}

/**
 * The directory list (add-coffeeshop-directory design.md D7; specs "Coffee
 * shop directory page" and "Directory pagination"): one card per coffee shop
 * in one column with the pagination on success, the centred empty message, or
 * the error message with the retry action. Every text arrives as a prop.
 */
export function CoffeeshopList({
  filtered = false,
  ...props
}: CoffeeshopListProps): ReactNode {
  const { result, texts } = props;
  const total = result.state === "success" ? (result.meta.total ?? 0) : 0;
  return (
    <div className={BLOCK_CLASSES}>
      {result.state !== "error" ? (
        <ResultStatus text={texts.resultCount.replace("{count}", String(total))} />
      ) : null}
      <CoffeeshopListBody {...props} filtered={filtered} />
    </div>
  );
}

function CoffeeshopListBody({
  result,
  locale,
  query,
  filtered,
  view,
  focus,
  texts,
  mapTexts,
}: CoffeeshopListProps): ReactNode {
  if (result.state === "empty") {
    return filtered ? (
      <div className={EMPTY_ACTION_CLASSES}>
        <p className={EMPTY_CLASSES}>{texts.noMatches}</p>
        <ClearFiltersButton label={texts.clearAll} keep={COFFEESHOP_CLEAR_KEEP} />
      </div>
    ) : (
      <p className={EMPTY_CLASSES}>{texts.emptyMessage}</p>
    );
  }
  if (result.state === "error") {
    return (
      <div className={ERROR_CLASSES}>
        <p>{texts.errorMessage}</p>
        <RetryButton label={texts.retryLabel} />
      </div>
    );
  }
  const currentPage = result.meta.current_page ?? 1;
  const lastPage = result.meta.last_page ?? currentPage;
  if (view === "map" && mapTexts) {
    return (
      <CoffeeshopsMapView
        items={result.items}
        currentPage={currentPage}
        lastPage={lastPage}
        locale={locale}
        query={query}
        focus={focus}
        texts={{
          ...mapTexts,
          previousLabel: texts.previousLabel,
          nextLabel: texts.nextLabel,
          navigationLabel: texts.navigationLabel,
          pageLabel: texts.pageLabel,
        }}
      />
    );
  }
  return (
    <>
      <ul className={COFFEESHOP_COLUMN_CLASSES}>
        {result.items.map((coffeeshop, index) => (
          <li key={coffeeshop.ulid ?? index}>
            <CoffeeshopCard
              coffeeshop={coffeeshop}
              locale={locale}
              texts={texts}
              actions={
                hasLocatedLocation(coffeeshop) ? (
                  <ShowOnMapButton ulid={coffeeshop.ulid ?? ""} name={coffeeshop.name ?? ""} label={texts.showOnMapLabel} />
                ) : undefined
              }
            />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        lastPage={lastPage}
        path={`/${locale}/coffeeshops`}
        query={pagingQuery(query)}
        texts={texts}
      />
    </>
  );
}
