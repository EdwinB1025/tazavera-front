"use client";

import type { ReactNode } from "react";
import { useFilterNavigation } from "@/shared/lib/filter-query";
import { Field, FiltersTrigger, Select } from "@/shared/ui";
import { OFFERING_SORT_OPTIONS, type OfferingSortId } from "../model/query";
import type { OfferingFilterTexts } from "../model/texts";

// ─── UI-specific types (declared before the component) ───

export type OfferingsToolbarProps = {
  /** Number of applied filter values (design.md D5). */
  count: number;
  sort: OfferingSortId;
  texts: OfferingFilterTexts;
};

// A wrapping row aligned to the bottom, the trigger at the start and the
// sort field at the end; no padding, border or radius (summary §6.4).
const TOOLBAR_CLASSES = "flex flex-wrap items-end justify-between gap-x-4 gap-y-3";

// The sort field starts at 12rem (`basis-48`, not its content width), grows up
// to 16rem and stays at the end when the trigger is hidden, so the trigger and
// the sort field share one row at 375px.
const SORT_CLASSES = "ml-auto min-w-48 max-w-64 grow basis-48";

/**
 * The offerings body toolbar (design.md D6, D8; spec "Offering sort",
 * "Offerings filter toolbar"): the "Filters" trigger with the applied count
 * and the "Sort by" select, which writes both sort keys at once.
 */
export function OfferingsToolbar({ count, sort, texts }: OfferingsToolbarProps): ReactNode {
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
              const option = OFFERING_SORT_OPTIONS.find((item) => item.id === event.target.value);
              if (option) {
                navigate({ orderBy: option.orderBy, orderDirection: option.orderDirection });
              }
            }}
          >
            {OFFERING_SORT_OPTIONS.map((option) => (
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
