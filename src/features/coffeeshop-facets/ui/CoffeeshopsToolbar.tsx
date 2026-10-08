"use client";

import type { ReactNode } from "react";
import { useFilterNavigation } from "@/shared/lib/filter-query";
import { Field, FiltersTrigger, Select } from "@/shared/ui";
import { COFFEESHOP_SORT_OPTIONS, type CoffeeshopSortId } from "../model/query";
import type { CoffeeshopFilterTexts } from "../model/texts";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopsToolbarProps = {
  /** Number of applied coffee shop filters (design.md D5). */
  count: number;
  sort: CoffeeshopSortId;
  texts: CoffeeshopFilterTexts;
  /** The view control, after the trigger (design.md D6, D13). */
  viewSlot?: ReactNode;
};

// A wrapping row aligned to the bottom: the start group, then the sort field.
const TOOLBAR_CLASSES = "flex flex-wrap items-end justify-between gap-x-4 gap-y-3";
const START_CLASSES = "flex items-end gap-4";
// The sort field grows between 12rem and 16rem, full width below `md`.
const SORT_CLASSES = "w-full md:w-auto md:ml-auto md:min-w-48 md:max-w-64 md:grow md:basis-48";

/**
 * The directory's body toolbar (add-coffeeshop-directory design.md D6; specs
 * "Coffee shop filter toolbar" and "Coffee shop sort"): the "Filters" trigger
 * with the applied count and the view slot at the start, the "Sort by" select
 * at the end, which writes the name order or removes it for A–Z.
 */
export function CoffeeshopsToolbar({ count, sort, texts, viewSlot }: CoffeeshopsToolbarProps): ReactNode {
  const { navigate } = useFilterNavigation();
  const label = count > 0 ? texts.triggerWithCount.replace("{count}", String(count)) : texts.trigger;

  return (
    <div className={TOOLBAR_CLASSES}>
      <div className={START_CLASSES}>
        <FiltersTrigger label={label} />
        {viewSlot}
      </div>
      <div className={SORT_CLASSES}>
        <Field label={texts.sortBy}>
          <Select
            value={sort}
            onChange={(event) => {
              const option = COFFEESHOP_SORT_OPTIONS.find((item) => item.id === event.target.value);
              if (option) {
                navigate({ orderBy: option.orderBy, orderDirection: option.orderDirection });
              }
            }}
          >
            {COFFEESHOP_SORT_OPTIONS.map((option) => (
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
