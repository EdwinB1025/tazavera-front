import type { ReactNode } from "react";
import type { CoffeeshopsPageMeta, CoffeeshopSummary } from "@/shared/api";
import { CoffeeshopCard, type CoffeeshopCardTexts } from "@/entities/coffeeshop";
import { Pagination, RetryButton, type PaginationTexts } from "@/shared/ui";
import { COFFEESHOP_COLUMN_CLASSES } from "../lib/column";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopListTexts = CoffeeshopCardTexts &
  PaginationTexts & {
    emptyMessage: string;
    errorMessage: string;
    retryLabel: string;
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
  texts: CoffeeshopListTexts;
};

// The column, then the pagination 2rem below it.
const BLOCK_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const EMPTY_CLASSES = ["text-center", "text-text-primary"].join(" ");
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
export function CoffeeshopList({ result, locale, query, texts }: CoffeeshopListProps): ReactNode {
  if (result.state === "empty") {
    return <p className={EMPTY_CLASSES}>{texts.emptyMessage}</p>;
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
    <div className={BLOCK_CLASSES}>
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
    </div>
  );
}
