"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { EvaluationItem, EvaluationPageMeta, OfferingDetail } from "@/shared/api";
import { listMyEvaluations } from "@/entities/evaluation";
import { fetchOffering } from "@/entities/offering";
import { Button, Card, CardContent, Pagination } from "@/shared/ui";
import type { PaginationTexts } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { EvaluationRowCard } from "./EvaluationRowCard";
import type { EvaluationRowTexts } from "./EvaluationRowCard";

// ─── UI-specific types (declared before the component) ───

export type EvaluationsListTexts = EvaluationRowTexts &
  PaginationTexts & {
    heading: string;
    emptyMessage: string;
    loadErrorMessage: string;
    retryLabel: string;
  };

export type EvaluationsListProps = {
  locale: string;
  texts: EvaluationsListTexts;
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

/** The page of the route's `page` query; the first page when absent or invalid. */
function pageFrom(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** One page of evaluations with the offering of each distinct `offeringId`. */
async function loadPage(page: number): Promise<ListState> {
  const result = await listMyEvaluations(page);
  if (!result.ok) {
    return { state: "error" };
  }
  // A `null` id is a deleted offering: nothing to request (design.md D17).
  const ids = [...new Set(result.data.data.map((item) => item.offeringId ?? ""))].filter(Boolean);
  const offerings = new Map<string, OfferingDetail>();
  await Promise.all(
    ids.map(async (id) => {
      const offering = await fetchOffering(id);
      if (offering.status === "found") offerings.set(id, offering.offering);
    }),
  );
  return {
    state: "success",
    rows: result.data.data.map((evaluation) => ({
      evaluation,
      offering: offerings.get(evaluation.offeringId ?? "") ?? null,
    })),
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
export function EvaluationsList({ locale, texts }: EvaluationsListProps): ReactNode {
  const page = pageFrom(useSearchParams()?.get("page") ?? null);
  // Each load is keyed by the page and the retry count; a result of another
  // key reads as loading, so a new page or a retry shows the placeholder.
  const [attempt, setAttempt] = useState(0);
  const key = `${page}:${attempt}`;
  const [loaded, setLoaded] = useState<{ key: string; list: ListState } | null>(null);
  // After a deletion the list reloads behind the rows already shown, with the
  // deleted row removed, instead of the loading placeholder.
  const [quietKey, setQuietKey] = useState<string | null>(null);
  const list: ListState =
    loaded && (loaded.key === key || quietKey === key) ? loaded.list : { state: "loading" };

  useEffect(() => {
    let current = true;
    loadPage(page).then((next) => {
      if (current) setLoaded({ key, list: next });
    });
    return () => {
      current = false;
    };
  }, [page, key]);

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
    setQuietKey(`${page}:${attempt + 1}`);
    setAttempt(attempt + 1);
  };

  return (
    <div className={BLOCK_CLASSES}>
      <h2 className="type-heading">{texts.heading}</h2>
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
        <p className="type-body">{texts.emptyMessage}</p>
      ) : null}
      {list.state === "success" && list.rows.length > 0 ? (
        <>
          <ul className={ROWS_CLASSES}>
            {list.rows.map((row, index) => (
              <li key={row.evaluation.ulid ?? index}>
                <EvaluationRowCard
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
              texts={texts}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
