"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { QueryRecord } from "@/shared/lib/filter-query";
import type { EvaluationItem, EvaluationPageMeta, OfferingDetail } from "@/shared/api";
import { listMyEvaluations, loadEvaluationOfferings } from "@/entities/evaluation";
import { evaluationListQuery, type EvaluationFilterValues } from "@/features/evaluation-facets";
import { fetchOffering } from "@/entities/offering";
import { Button, Card, CardContent, Pagination, ResultStatus } from "@/shared/ui";
import type { PaginationTexts } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
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

type ListRow = { evaluation: EvaluationItem; offering: OfferingDetail | null };

type ListState =
  | { state: "loading" }
  | { state: "error" }
  | { state: "success"; rows: ListRow[]; meta: EvaluationPageMeta };

const BLOCK_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
const ROWS_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
const ERROR_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");
const PLACEHOLDER_CLASSES = ["animate-pulse", "bg-surface-section", "rounded-field"].join(" ");
const SKELETON_KEYS = [0, 1, 2] as const;

/** One page of evaluations with the offering of each distinct `offeringId`. */
async function loadPage(requestQuery: string): Promise<ListState> {
  const result = await listMyEvaluations(requestQuery);
  if (!result.ok) {
    return { state: "error" };
  }
  return {
    state: "success",
    rows: await loadEvaluationOfferings(result.data.data, fetchOffering),
    meta: result.data.meta,
  };
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
  const requestQuery = evaluationListQuery(values, page);
  // Each load is keyed by the request query and the retry count; a result of
  // another key reads as loading, so a new query or a retry shows the
  // placeholder.
  const [attempt, setAttempt] = useState(0);
  const key = `${requestQuery}:${attempt}`;
  const [loaded, setLoaded] = useState<{ key: string; list: ListState } | null>(null);
  // After a deletion the list reloads behind the rows already shown, with the
  // deleted row removed, instead of the loading placeholder.
  const [quietKey, setQuietKey] = useState<string | null>(null);
  const list: ListState =
    loaded && (loaded.key === key || quietKey === key) ? loaded.list : { state: "loading" };

  useEffect(() => {
    let current = true;
    loadPage(requestQuery).then((next) => {
      if (current) setLoaded({ key, list: next });
    });
    return () => {
      current = false;
    };
  }, [requestQuery, key]);

  // While a new query loads, the block keeps the height of the list it
  // replaces, so the document does not shrink to the placeholder and the
  // browser does not clamp the scroll position (spec "Evaluation filter state
  // in the URL", keep the scroll position; design.md D4).
  const blockRef = useRef<HTMLDivElement>(null);
  const lastHeight = useRef(0);
  useLayoutEffect(() => {
    const block = blockRef.current;
    if (!block) return;
    if (list.state === "loading") {
      if (lastHeight.current > 0) block.style.minHeight = `${lastHeight.current}px`;
    } else {
      block.style.minHeight = "";
      lastHeight.current = block.offsetHeight;
    }
  });

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  const removeRow = (ulid: string) => {
    setLoaded((current) =>
      current && current.list.state === "success"
        ? {
            ...current,
            list: {
              ...current.list,
              rows: current.list.rows.filter((row) => row.evaluation.ulid !== ulid),
            },
          }
        : current,
    );
    setQuietKey(`${requestQuery}:${attempt + 1}`);
    setAttempt(attempt + 1);
  };

  return (
    <div ref={blockRef} className={BLOCK_CLASSES}>
      <h2 className="type-heading">{texts.heading}</h2>
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
      {list.state === "loading" ? (
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
      ) : null}
      {list.state === "error" ? (
        <div className={ERROR_CLASSES}>
          <p className="type-body">{texts.loadErrorMessage}</p>
          <Button onClick={retry}>{texts.retryLabel}</Button>
        </div>
      ) : null}
      {list.state === "success" && list.rows.length === 0 ? (
        emptyAction ? (
          <div className={ERROR_CLASSES}>
            <p className="type-body">{texts.noMatches}</p>
            {emptyAction}
          </div>
        ) : (
          <p className="type-body">{texts.emptyMessage}</p>
        )
      ) : null}
      {list.state === "success" && list.rows.length > 0 ? (
        <>
          <ul className={ROWS_CLASSES}>
            {list.rows.map((row, index) => (
              <li key={row.evaluation.ulid ?? index}>
                <SpecialistEvaluationRow
                  evaluation={row.evaluation}
                  offering={row.offering}
                  locale={locale}
                  texts={texts}
                  onDeleted={removeRow}
                />
              </li>
            ))}
          </ul>
          {(list.meta.last_page ?? 1) > 1 ? (
            <Pagination
              currentPage={list.meta.current_page ?? page}
              lastPage={list.meta.last_page ?? 1}
              path={`/${locale}/manage/evaluations`}
              query={query}
              texts={texts}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
