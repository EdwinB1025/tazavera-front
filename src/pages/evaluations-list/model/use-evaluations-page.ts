"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { EvaluationItem, EvaluationPageMeta, OfferingDetail } from "@/shared/api";
import { listMyEvaluations, loadEvaluationOfferings } from "@/entities/evaluation";
import { fetchOffering } from "@/entities/offering";

// ─── UI-specific types (declared before the hook) ───

export type ListRow = { evaluation: EvaluationItem; offering: OfferingDetail | null };

export type ListState =
  | { state: "loading" }
  | { state: "error" }
  | { state: "success"; rows: ListRow[]; meta: EvaluationPageMeta };

export type EvaluationsPage = {
  list: ListState;
  /** The list block, which keeps its height while a new query loads. */
  blockRef: RefObject<HTMLDivElement | null>;
  retry: () => void;
  removeRow: (ulid: string) => void;
  markClosed: (ulid: string) => void;
};

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
 * The page of "My evaluations" for a request query (design.md D1, endpoint 1):
 * its load, the retry, and the row updates after a deletion or a close.
 */
export function useEvaluationsPage(requestQuery: string): EvaluationsPage {
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

  // A deleted row leaves and a closed row shows its closed state in place
  // while the page reloads behind them (close-evaluation-only-when-saved).
  const updateRows = (change: (rows: ListRow[]) => ListRow[]) => {
    setLoaded((current) =>
      current && current.list.state === "success"
        ? { ...current, list: { ...current.list, rows: change(current.list.rows) } }
        : current,
    );
    setQuietKey(`${requestQuery}:${attempt + 1}`);
    setAttempt(attempt + 1);
  };
  const removeRow = (ulid: string) =>
    updateRows((rows) => rows.filter((row) => row.evaluation.ulid !== ulid));
  const markClosed = (ulid: string) =>
    updateRows((rows) =>
      rows.map((row) =>
        row.evaluation.ulid === ulid
          ? { ...row, evaluation: { ...row.evaluation, status: "closed" } }
          : row,
      ),
    );

  return { list, blockRef, retry, removeRow, markClosed };
}
