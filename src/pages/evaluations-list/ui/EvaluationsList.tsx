"use client";

import type { ReactNode } from "react";
import type { QueryRecord } from "@/shared/lib/filter-query";
import type { EvaluationPageMeta } from "@/shared/api";
import { evaluationListQuery, type EvaluationFilterValues } from "@/features/evaluation-facets";
import { Button, Card, CardContent, Pagination, ResultStatus } from "@/shared/ui";
import type { PaginationTexts } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { useEvaluationsPage, type ListRow } from "../model/use-evaluations-page";
import { SpecialistEvaluationRow } from "./SpecialistEvaluationRow";
import type { EvaluationRowTexts } from "./SpecialistEvaluationRow";

// ─── UI-specific types (declared before the component) ───

export type EvaluationsListTexts = EvaluationRowTexts &
  PaginationTexts & {
    heading: string;
    emptyMessage: string;
    loadErrorMessage: string;
    retryLabel: string;
    /** The empty message while a filter is applied (`filters.noMatches`). */
    noMatches: string;
  };

export type EvaluationsListProps = {
  locale: string;
  texts: EvaluationsListTexts;
  /** The parsed facet values and sort of the route (add-evaluation-facets D4). */
  values: EvaluationFilterValues;
  /** The route's page. */
  page: number;
  /** The route's search params, kept by `Pagination`. */
  query: QueryRecord;
  /** Shown with `noMatches` instead of the empty message: "Clear all". */
  emptyAction?: ReactNode;
  /** The polite result announcement; holds `{count}`. */
  resultCountText?: string;
};

const BLOCK_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const ROWS_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
const ERROR_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");
const PLACEHOLDER_CLASSES = ["animate-pulse", "bg-surface-section", "rounded-field"].join(" ");
const SKELETON_KEYS = [0, 1, 2] as const;

/** The loading placeholder in the list's place. */
function ListPlaceholder(): ReactNode {
  return (
    <div aria-busy="true" className={ROWS_CLASSES}>
      {SKELETON_KEYS.map((key) => (
        <Card key={key}>
          <CardContent>
            <div className={cn(PLACEHOLDER_CLASSES, "h-4 w-1/4")} />
            <div className={cn(PLACEHOLDER_CLASSES, "h-6 w-2/3")} />
            <div className={cn(PLACEHOLDER_CLASSES, "h-4 w-1/2")} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** The empty message, or `noMatches` with the empty action while a filter is applied. */
function EmptyList({
  texts,
  emptyAction,
}: {
  texts: EvaluationsListTexts;
  emptyAction?: ReactNode;
}): ReactNode {
  return emptyAction ? (
    <div className={ERROR_CLASSES}>
      <p className="type-body">{texts.noMatches}</p>
      {emptyAction}
    </div>
  ) : (
    <p className="type-body">{texts.emptyMessage}</p>
  );
}

/** One row per evaluation in the API's order, then the pagination. */
function ListRows({
  rows,
  meta,
  locale,
  texts,
  page,
  query,
  onDeleted,
  onClosed,
}: Pick<EvaluationsListProps, "locale" | "texts" | "page" | "query"> & {
  rows: ListRow[];
  meta: EvaluationPageMeta;
  onDeleted: (ulid: string) => void;
  onClosed: (ulid: string) => void;
}): ReactNode {
  return (
    <>
      <ul className={ROWS_CLASSES}>
        {rows.map((row, index) => (
          <li key={row.evaluation.ulid ?? index}>
            <SpecialistEvaluationRow
              evaluation={row.evaluation}
              offering={row.offering}
              locale={locale}
              texts={texts}
              onDeleted={onDeleted}
              onClosed={onClosed}
            />
          </li>
        ))}
      </ul>
      {(meta.last_page ?? 1) > 1 ? (
        <Pagination
          currentPage={meta.current_page ?? page}
          lastPage={meta.last_page ?? 1}
          path={`/${locale}/manage/evaluations`}
          query={query}
          texts={texts}
        />
      ) : null}
    </>
  );
}

/**
 * "My evaluations" (design.md D1, endpoint 1 and its error table; spec "My
 * evaluations list"): the signed-in specialist's evaluations, read on the
 * client through the add-auth client, newest first, 15 per page. A loading
 * placeholder stands in the list's place until the page and its offerings
 * arrive; then one row per evaluation in the API's order, the empty message,
 * or the failure message with a retry that loads again. A deleted row
 * leaves the list at once and the page reloads behind it.
 */
export function EvaluationsList({
  locale,
  texts,
  values,
  page,
  query,
  emptyAction,
  resultCountText,
}: EvaluationsListProps): ReactNode {
  const { list, blockRef, retry, removeRow, markClosed } = useEvaluationsPage(
    evaluationListQuery(values, page),
  );

  return (
    <div ref={blockRef} className={BLOCK_CLASSES}>
      <h1 className="type-heading">{texts.heading}</h1>
      {resultCountText !== undefined ? (
        // Mounted in every state so each new total is announced (design.md D9).
        <ResultStatus
          text={
            list.state === "success"
              ? resultCountText.replace("{count}", String(list.meta.total ?? list.rows.length))
              : null
          }
        />
      ) : null}
      {list.state === "loading" ? <ListPlaceholder /> : null}
      {list.state === "error" ? (
        <div className={ERROR_CLASSES}>
          <p className="type-body">{texts.loadErrorMessage}</p>
          <Button onClick={retry}>{texts.retryLabel}</Button>
        </div>
      ) : null}
      {list.state === "success" && list.rows.length === 0 ? (
        <EmptyList texts={texts} emptyAction={emptyAction} />
      ) : null}
      {list.state === "success" && list.rows.length > 0 ? (
        <ListRows
          rows={list.rows}
          meta={list.meta}
          locale={locale}
          texts={texts}
          page={page}
          query={query}
          onDeleted={removeRow}
          onClosed={markClosed}
        />
      ) : null}
    </div>
  );
}
