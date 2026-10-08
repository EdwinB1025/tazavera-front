"use client";

import type { ReactNode } from "react";
import { useFilterNavigation } from "@/shared/lib/filter-query";
import { Field, FiltersTrigger, Select } from "@/shared/ui";
import { EVALUATION_SORT_OPTIONS, type EvaluationSortId } from "../model/query";

// ─── UI-specific types (declared before the component) ───

/** The `filters` texts the toolbar reads (design.md D8, D10). */
export type EvaluationsToolbarTexts = {
  trigger: string;
  /** Holds `{count}`. */
  triggerWithCount: string;
  sortBy: string;
  sortDefault: string;
  sortScoreDesc: string;
  sortScoreAsc: string;
  sortNewest: string;
  sortOldest: string;
};

export type EvaluationsToolbarProps = {
  /** Number of applied filter values (design.md D5). */
  count: number;
  sort: EvaluationSortId;
  texts: EvaluationsToolbarTexts;
};

// A wrapping row aligned to the bottom, the trigger at the start and the
// sort field at the end; no padding, border or radius (design.md D8).
const TOOLBAR_CLASSES = "flex flex-wrap items-end justify-between gap-x-4 gap-y-3";

// The sort field grows between 12rem and 16rem and stays at the end when the
// trigger is hidden.
const SORT_CLASSES = "ml-auto min-w-48 max-w-64 grow basis-48";

/**
 * The evaluations body toolbar (design.md D6, D8; spec "Evaluation sort",
 * "Evaluations filter toolbar"): the "Filters" trigger with the applied count
 * and the "Sort by" select, which writes both sort keys at once.
 */
export function EvaluationsToolbar({ count, sort, texts }: EvaluationsToolbarProps): ReactNode {
  const { navigate } = useFilterNavigation();
  const label = count > 0 ? texts.triggerWithCount.replace("{count}", String(count)) : texts.trigger;

  return (
    <div className={TOOLBAR_CLASSES}>
      <FiltersTrigger label={label} />
      <div className={SORT_CLASSES}>
        <Field label={texts.sortBy}>
          <Select
            value={sort}
            onChange={(event) => {
              const option = EVALUATION_SORT_OPTIONS.find((item) => item.id === event.target.value);
              if (option) {
                navigate({ orderBy: option.orderBy, orderDirection: option.orderDirection });
              }
            }}
          >
            {EVALUATION_SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {texts[option.textKey]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  );
}
