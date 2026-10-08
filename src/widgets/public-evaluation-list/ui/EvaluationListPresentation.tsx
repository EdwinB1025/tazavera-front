import type { ReactNode } from "react";
import type { EvaluationItem, EvaluationPageMeta, OfferingDetail } from "@/shared/api";
import { Card, CardContent, ClearFiltersButton, Pagination, ResultStatus, RetryButton } from "@/shared/ui";
import type { PaginationTexts } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

// ─── UI-specific types (declared before the component) ───

export type EvaluationListTexts = PaginationTexts & {
    emptyMessage: string;
    /** The empty message while a facet is applied (`filters.noMatches`). */
    noMatches: string;
    /** "Clear all" (`filters.clearAll`). */
    clearAll: string;
    errorMessage: string;
    retryLabel: string;
    /** The polite result announcement, with a `{count}` placeholder. */
    resultCount: string;
  };

export type PublicEvaluationRow = {
  evaluation: EvaluationItem;
  /** `null` when its read failed or its `offeringId` is `null`. */
  offering: OfferingDetail | null;
};

/** The fetch result, mapped before it reaches this view (design.md D1). */
export type EvaluationListResult =
  | { state: "success"; rows: PublicEvaluationRow[]; meta: EvaluationPageMeta }
  | { state: "empty" }
  | { state: "error" };

export type EvaluationListPresentationProps = {
  result: EvaluationListResult;
  /** Whether a facet is applied: an empty page then offers "Clear all". */
  filtered: boolean;
  locale: string;
  /** The URL's search params; the pagination keeps them and replaces `page`. */
  query: Record<string, string | string[] | undefined>;
  texts: EvaluationListTexts;
  /** Renders one row: the row card, composed by the host page (FSD slot). */
  renderRow: (row: PublicEvaluationRow) => ReactNode;
};

/** The sort keys "Clear all" keeps (design.md D7). */
const SORT_KEYS = ["orderBy", "orderDirection"] as const;

const BLOCK_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const ROWS_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
// Empty and error states: a centred column, 1rem apart, no box (summary §5.2).
const STATE_CLASSES = ["flex", "flex-col", "items-center", "gap-4", "text-center"].join(" ");
const SKELETON_CONTENT_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const BAR_CLASSES = ["bg-surface-section", "rounded-field"].join(" ");
const SKELETON_KEYS = [0, 1, 2] as const;

/** The list's loading state: three row placeholders (spec "Loading the list"). */
export function EvaluationListSkeleton(): ReactNode {
  return (
    <div aria-busy="true" className={ROWS_CLASSES}>
      {SKELETON_KEYS.map((key) => (
        <Card key={key} layout="default" aria-hidden="true">
          <CardContent className={SKELETON_CONTENT_CLASSES}>
            <div className={cn(BAR_CLASSES, "h-6 w-2/3")} />
            <div className={cn(BAR_CLASSES, "h-4 w-1/2")} />
            <div className={cn(BAR_CLASSES, "h-4 w-1/4")} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * The public evaluations list (design.md D4, D6; spec "Public evaluations
 * list"): one row card per evaluation and the pagination on success, the
 * empty message (or `noMatches` with "Clear all" while a facet is applied),
 * or the error message with Retry. Every text arrives as a prop.
 */
export function EvaluationListPresentation({
  result,
  filtered,
  locale,
  query,
  texts,
  renderRow,
}: EvaluationListPresentationProps): ReactNode {
  const total = result.state === "success" ? (result.meta.total ?? result.rows.length) : 0;
  const currentPage = result.state === "success" ? (result.meta.current_page ?? 1) : 1;
  const lastPage = result.state === "success" ? (result.meta.last_page ?? currentPage) : 1;

  return (
    <div className={BLOCK_CLASSES}>
      {result.state !== "error" ? (
        <ResultStatus text={texts.resultCount.replace("{count}", String(total))} />
      ) : null}
      {result.state === "success" ? (
        <>
          <ul className={ROWS_CLASSES}>
            {result.rows.map((row, index) => (
              <li key={row.evaluation.ulid ?? index}>{renderRow(row)}</li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            path={`/${locale}/evaluations`}
            query={query}
            texts={texts}
          />
        </>
      ) : null}
      {result.state === "empty" ? (
        filtered ? (
          <div className={STATE_CLASSES}>
            <p className="type-body">{texts.noMatches}</p>
            <ClearFiltersButton label={texts.clearAll} keep={SORT_KEYS} />
          </div>
        ) : (
          <p className={cn("type-body", "text-center")}>{texts.emptyMessage}</p>
        )
      ) : null}
      {result.state === "error" ? (
        <div className={STATE_CLASSES}>
          <p className="type-body">{texts.errorMessage}</p>
          <RetryButton label={texts.retryLabel} />
        </div>
      ) : null}
    </div>
  );
}
