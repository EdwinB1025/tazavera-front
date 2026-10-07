import type { ReactNode } from "react";
import type { CoffeeshopsPageMeta, CoffeeshopSummary } from "@/shared/api";
import { CoffeeshopCard, type CoffeeshopCardTexts } from "@/entities/coffeeshop";
import { COFFEESHOP_CLEAR_KEEP } from "@/features/coffeeshop-facets";
import { ClearFiltersButton, Pagination, RetryButton, type PaginationTexts } from "@/shared/ui";
import { COFFEESHOP_COLUMN_CLASSES } from "../lib/column";

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
  };

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
  texts: CoffeeshopListTexts;
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
  result,
  locale,
  query,
  filtered = false,
  texts,
}: CoffeeshopListProps): ReactNode {
  const total = result.state === "success" ? (result.meta.total ?? 0) : 0;
  return (
    <div className={BLOCK_CLASSES}>
      {result.state !== "error" ? (
        <div role="status" className="sr-only">
          {texts.resultCount.replace("{count}", String(total))}
        </div>
      ) : null}
      <CoffeeshopListBody result={result} locale={locale} query={query} filtered={filtered} texts={texts} />
    </div>
  );
}

function CoffeeshopListBody({
  result,
  locale,
  query,
  filtered,
  texts,
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
  return (
    <>
      <ul className={COFFEESHOP_COLUMN_CLASSES}>
        {result.items.map((coffeeshop, index) => (
          <li key={coffeeshop.ulid ?? index}>
            <CoffeeshopCard coffeeshop={coffeeshop} locale={locale} texts={texts} />
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
