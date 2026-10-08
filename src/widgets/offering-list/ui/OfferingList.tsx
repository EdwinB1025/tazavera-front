import type { ReactNode } from "react";
import type { OfferingsPageMeta, OfferingSummary } from "@/shared/api";
import type {
  OfferingCardTexts,
  ResolvedTaxonomyBadge,
} from "@/entities/offering";
import { OfferingCard } from "@/entities/offering";
import { EvaluateLink } from "@/features/evaluate-offering";
import { Pagination, RetryButton } from "@/shared/ui";
import type { PaginationTexts } from "@/shared/ui";
import { OFFERING_GRID_CLASSES } from "../lib/grid";

// ─── UI-specific types (declared before the component) ───

export type OfferingListTexts = OfferingCardTexts &
  PaginationTexts & {
    emptyMessage: string;
    /**
     * The polite result announcement, with a `{count}` placeholder
     * (add-offering-facets design.md D9); none when absent.
     */
    resultCount?: string;
    errorMessage: string;
    retryLabel: string;
    evaluateLabel: string;
  };

export type OfferingListItem = {
  offering: OfferingSummary;
  taxonomies: ResolvedTaxonomyBadge[];
};

/** The fetch result of design.md D9, mapped before it reaches this view. */
export type OfferingListResult =
  | { state: "success"; items: OfferingListItem[]; meta: OfferingsPageMeta }
  | { state: "empty" }
  | { state: "error" };

export type OfferingListProps = {
  result: OfferingListResult;
  locale: string;
  texts: OfferingListTexts;
  /** The pagination's address without its query; landing's `/${locale}` by default. */
  path?: string;
  /** The query the pagination keeps while it replaces `page`; none by default. */
  query?: Record<string, string | string[] | undefined>;
  /** Replaces the grid classes; landing's `OFFERING_GRID_CLASSES` by default. */
  gridClassName?: string;
  /** Rendered centered below the empty message (add-offering-facets design.md D9). */
  emptyAction?: ReactNode;
};

// The centered empty message (spec "Empty"), in the primary text colour, which
// passes on the page and section surfaces it renders on in both themes.
const EMPTY_CLASSES = ["text-center", "text-text-primary"].join(" ");

// The empty message with an action below it, centered 1rem apart like the
// error block (add-offering-facets design.md D9).
const EMPTY_ACTION_CLASSES = ["flex", "flex-col", "items-center", "gap-4"].join(" ");

// The grid of cards, then the pagination below it (design.md D14). The root is
// the container a region-sized grid measures (add-offering-catalog D10).
const BLOCK_CLASSES = ["@container", "flex", "flex-col", "gap-8"].join(" ");

// The error message with its retry action, centered like the empty message,
// so the button keeps its own width; the message in the primary text colour.
const ERROR_CLASSES = [
  "flex",
  "flex-col",
  "items-center",
  "gap-4",
  "text-text-primary",
].join(" ");

/**
 * The presentation of the verified-offerings block (design.md D9; the landing
 * spec "Verified offerings list"). One offering card per item with the
 * pagination on success, the centered empty message on an empty page, and the
 * error message with the retry action on a failure — an offerings failure and
 * a taxonomy failure alike, since both map into the one `error` result
 * (design.md D4). Every text arrives as a prop (design.md D11) and this widget
 * fills each card's actions slot with `EvaluateLink`, which shows itself to a
 * signed-in specialist only (add-specialist-evaluations design.md D6).
 */
export function OfferingList({
  result,
  locale,
  texts,
  path = `/${locale}`,
  query,
  gridClassName = OFFERING_GRID_CLASSES,
  emptyAction,
}: OfferingListProps): ReactNode {
  // The contract marks the `meta` fields optional; the API always sends both,
  // and the fallbacks keep the paging arithmetic defined (design.md D3).
  const currentPage =
    result.state === "success" ? (result.meta.current_page ?? 1) : 1;
  const lastPage =
    result.state === "success" ? (result.meta.last_page ?? currentPage) : 1;

  // The total of the success and empty states (add-offering-facets D9).
  const total = result.state === "success" ? (result.meta.total ?? 0) : 0;
  const emptyMessage = <p className={EMPTY_CLASSES}>{texts.emptyMessage}</p>;

  return (
    <div id="offerings" className={BLOCK_CLASSES}>
      {texts.resultCount !== undefined && result.state !== "error" ? (
        <div role="status" className="sr-only">
          {texts.resultCount.replace("{count}", String(total))}
        </div>
      ) : null}
      {result.state === "success" ? (
        <>
          <div className={gridClassName}>
            {result.items.map((item, index) => (
              <OfferingCard
                key={item.offering.ulid ?? index}
                offering={item.offering}
                locale={locale}
                taxonomies={item.taxonomies}
                texts={texts}
                actions={
                  <EvaluateLink
                    ulid={item.offering.ulid ?? ""}
                    locale={locale}
                    texts={texts}
                  />
                }
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            path={path}
            query={query}
            texts={texts}
          />
        </>
      ) : null}
      {result.state === "empty" ? (
        emptyAction ? (
          <div className={EMPTY_ACTION_CLASSES}>
            {emptyMessage}
            {emptyAction}
          </div>
        ) : (
          emptyMessage
        )
      ) : null}
      {result.state === "error" ? (
        <div className={ERROR_CLASSES}>
          <p>{texts.errorMessage}</p>
          <RetryButton label={texts.retryLabel} />
        </div>
      ) : null}
    </div>
  );
}
