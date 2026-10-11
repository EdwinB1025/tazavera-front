"use client";

import type { ReactNode } from "react";
import type { CoffeeInventoryQuery } from "@/shared/api";
import { InventoryCard, type InventoryCardTexts } from "@/entities/coffee-inventory";
import { InventoryToolbar } from "@/features/inventory-facets";
import { useCoffeeInventory, type InventoryState } from "@/features/offering-management";
import { OfferingSkeletonCard } from "@/widgets/offering-list";
import { Button, ClearFiltersButton, ResultStatus } from "@/shared/ui";
import { InventoryCardActions } from "./InventoryCardActions";

// ─── UI-specific types (declared before the component) ───

export type InventoryResultsTexts = InventoryCardTexts & {
  empty: string;
  error: string;
  retry: string;
  view: string;
  createOffering: string;
  trigger: string;
  triggerWithCount: string;
  noMatches: string;
  clearAll: string;
  /** The polite result announcement, with a `{count}` placeholder. */
  resultCount: string;
};

export type InventoryResultsProps = {
  locale: string;
  /** The filters the address carries, sent as the read's query. */
  query: CoffeeInventoryQuery;
  /** The number of applied filters: the trigger's count; above 0 the empty state is "no matches". */
  count: number;
  texts: InventoryResultsTexts;
};

// The grid of My offerings: 1 column, 2 from `lg`, 3 from `2xl`, 1.5rem gap;
// grid items stretch, so a row shares its height (design.md D6).
const GRID_CLASSES = ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2", "2xl:grid-cols-3"].join(" ");
// The toolbar, then the results 1.5rem below it.
const BODY_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// Empty and error: a centred column 1rem apart, no box.
const MESSAGE_CLASSES = ["flex", "flex-col", "items-center", "gap-4", "text-center"].join(" ");

const SKELETON_CARD_KEYS = [0, 1, 2] as const;

/** Three skeleton cards in the list's grid, while the list or the session loads. */
export function InventorySkeletonGrid(): ReactNode {
  return (
    <div className={GRID_CLASSES}>
      {SKELETON_CARD_KEYS.map((key) => (
        <OfferingSkeletonCard key={key} />
      ))}
    </div>
  );
}

type InventoryBodyProps = Omit<InventoryResultsProps, "query"> & {
  inventory: InventoryState;
  retry: () => void;
};

/** The read's state: skeletons, the error, the (filtered) empty message or the cards. */
function InventoryBody({ locale, count, texts, inventory, retry }: InventoryBodyProps): ReactNode {
  if (inventory.state === "loading") return <InventorySkeletonGrid />;
  if (inventory.state === "error") {
    return (
      <div className={MESSAGE_CLASSES}>
        <p className="type-body">{texts.error}</p>
        <Button variant="primary" onClick={retry}>
          {texts.retry}
        </Button>
      </div>
    );
  }
  if (inventory.items.length === 0) {
    return count > 0 ? (
      <div className={MESSAGE_CLASSES}>
        <p className="type-body">{texts.noMatches}</p>
        <ClearFiltersButton label={texts.clearAll} keep={[]} />
      </div>
    ) : (
      <p className={["type-body", "text-center"].join(" ")}>{texts.empty}</p>
    );
  }
  return (
    <div className={GRID_CLASSES}>
      {inventory.items.map((item, index) => (
        <InventoryCard
          key={item.ulid ?? index}
          item={item}
          texts={texts}
          actions={<InventoryCardActions locale={locale} ulid={item.ulid ?? ""} texts={texts} />}
        />
      ))}
    </div>
  );
}

/**
 * The inventory read and its states (add-coffee-inventory-explorer design.md
 * D6; specs "Coffee inventory list" and "Filtered inventory results"): the
 * toolbar, then skeleton cards, the error with retry, the empty or "no
 * matches" message, or one card per returned item with no pagination; the
 * returned count is announced politely once the read succeeds.
 */
export function InventoryResults({ locale, query, count, texts }: InventoryResultsProps): ReactNode {
  const { inventory, retry } = useCoffeeInventory(query, true);
  const total = inventory.state === "success" ? inventory.items.length : null;
  return (
    <div className={BODY_CLASSES}>
      <InventoryToolbar count={count} texts={texts} />
      <ResultStatus text={total === null ? null : texts.resultCount.replace("{count}", String(total))} />
      <InventoryBody locale={locale} count={count} texts={texts} inventory={inventory} retry={retry} />
    </div>
  );
}
