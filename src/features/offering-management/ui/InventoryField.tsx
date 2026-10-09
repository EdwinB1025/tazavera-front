"use client";

import { useCallback, useMemo, useRef, type ReactNode, type Ref } from "react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { Combobox, Field, type ComboboxOption, type ComboboxSearch } from "@/shared/ui";
import { searchCoffeeInventory } from "../api/management";

// ─── UI-specific types (declared before the component) ───

export type InventoryFieldTexts = {
  inventoryLabel: string;
  inventoryHelp: string;
  inventorySearching: string;
  inventoryNoMatches: string;
  inventorySearchError: string;
  inventoryLotCaption: string;
  inventoryProducedCaption: string;
  /** The combobox's option-count announcement, with a `{count}` placeholder. */
  optionCount: string;
};

export type InventoryFieldProps = {
  value: CoffeeInventoryItem | null;
  onChange: (item: CoffeeInventoryItem | null) => void;
  /** The field's error message; marks it invalid. */
  error?: string;
  disabled?: boolean;
  /** The field's wrapper, so the form can move focus to its input. */
  ref?: Ref<HTMLDivElement>;
  texts: InventoryFieldTexts;
};

/** The contract's `coffeeName` limit. */
const COFFEE_NAME_MAX_LENGTH = 150;

/** Joins the non-empty parts with " · ", so an empty part leaves no separator. */
function joinParts(parts: (string | null | undefined)[]): string {
  return parts.filter((part) => part != null && part !== "").join(" · ");
}

/** The two-line row of design.md D9: coffee name; roastery · country · process. */
function toOption(item: CoffeeInventoryItem): ComboboxOption {
  const detail = joinParts([item.roastery?.name, item.coffee?.country, item.coffee?.process]);
  return {
    value: item.ulid ?? "",
    label: item.coffee?.name ?? "",
    ...(detail !== "" && { detail }),
  };
}

/**
 * The inventory item field (design.md D4, D9, D14; spec "Creating
 * offerings"): the shared combobox in search mode inside a required `Field`.
 * Its search sends `GET /coffeeInventory?coffeeName={text}` and keeps the
 * returned items, so a chosen row maps back to its item. The help shows the
 * typing hint until a row is chosen, then the item's labelled `roastLot` and
 * `productionDate` joined by " · ".
 */
export function InventoryField({
  value,
  onChange,
  error,
  disabled,
  ref,
  texts,
}: InventoryFieldProps): ReactNode {
  const items = useRef(new Map<string, CoffeeInventoryItem>());
  const search = useCallback<ComboboxSearch>(async (term, signal) => {
    const read = await searchCoffeeInventory(term, signal);
    // A failure rejects the search: the combobox shows its failure row (design.md D3).
    if (!read.ok) throw new Error("coffeeInventory request failed");
    const found = read.data;
    for (const item of found) items.current.set(item.ulid ?? "", item);
    return found.map(toOption);
  }, []);
  // A stable option per chosen item: the combobox resets its text when the
  // option object changes.
  const option = useMemo(() => (value === null ? null : toOption(value)), [value]);

  const help =
    value === null
      ? texts.inventoryHelp
      : joinParts([
          value.roastLot ? `${texts.inventoryLotCaption} ${value.roastLot}` : null,
          value.productionDate
            ? `${texts.inventoryProducedCaption} ${value.productionDate}`
            : null,
        ]);

  return (
    <div ref={ref}>
      <Field label={texts.inventoryLabel} help={help} error={error} required>
        <Combobox
          label={texts.inventoryLabel}
          search={search}
          value={option}
          onChange={(chosen) =>
            onChange(chosen === null ? null : (items.current.get(chosen.value) ?? null))
          }
          maxLength={COFFEE_NAME_MAX_LENGTH}
          disabled={disabled}
          texts={{
            searching: texts.inventorySearching,
            noMatches: texts.inventoryNoMatches,
            loadError: texts.inventorySearchError,
            optionCount: texts.optionCount,
          }}
        />
      </Field>
    </div>
  );
}
