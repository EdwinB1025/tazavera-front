import type { FilterChanges } from "@/shared/lib/filter-query";
import type { AppliedFilter } from "@/shared/ui";
import { SCORE_MAX, SCORE_MIN, type EvaluationFilterValues } from "./query";

/**
 * Applied evaluation filters (design.md D5): one entry per applied value, in
 * facet order, each with the changes that remove only it. The chips of the
 * panel and the count of the trigger read the same list; the sort is never
 * an entry.
 */

// ─── UI-specific types (design.md D11) ───

export type EvaluationAppliedFilter = AppliedFilter & { remove: FilterChanges };

/** The `filters` texts the entries are named with. */
export type AppliedEvaluationTexts = {
  status: string;
  statusOpen: string;
  statusClosed: string;
  score: string;
  /** Holds `{min}` and `{max}`. */
  scoreRange: string;
  process: string;
  city: string;
  /** The public set's Offering facet (add-public-evaluations design.md D7). */
  offering?: string;
  /** The Offering chip's value when the offering read failed. */
  offeringFilterFallback?: string;
};

export function appliedEvaluationFilters(
  values: EvaluationFilterValues,
  texts: AppliedEvaluationTexts,
  /** The active offering's coffee name; `null` when its read failed. */
  offeringName?: string | null,
): EvaluationAppliedFilter[] {
  const list: EvaluationAppliedFilter[] = [];
  if (values.offeringId !== undefined) {
    list.push({
      id: "offeringId",
      facet: texts.offering ?? "",
      value: offeringName ?? texts.offeringFilterFallback ?? "",
      remove: { offeringId: undefined },
    });
  }
  const single = (key: "status" | "process" | "city", facet: string, value: string | undefined) => {
    if (value !== undefined) list.push({ id: key, facet, value, remove: { [key]: undefined } });
  };

  single(
    "status",
    texts.status,
    values.status === undefined
      ? undefined
      : values.status === "open"
        ? texts.statusOpen
        : texts.statusClosed,
  );
  if (values.scoreMin !== undefined || values.scoreMax !== undefined) {
    list.push({
      id: "score",
      facet: texts.score,
      value: texts.scoreRange
        .replace("{min}", String(values.scoreMin ?? SCORE_MIN))
        .replace("{max}", String(values.scoreMax ?? SCORE_MAX)),
      remove: { scoreMin: undefined, scoreMax: undefined },
    });
  }
  single("process", texts.process, values.process);
  single("city", texts.city, values.city);
  return list;
}
