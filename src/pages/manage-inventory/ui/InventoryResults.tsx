"use client";

import type { ReactNode } from "react";
import type { CoffeeInventoryQuery } from "@/shared/api";
import { InventoryCard, type InventoryCardTexts } from "@/entities/coffee-inventory";
import { useCoffeeInventory } from "@/features/offering-management";
import { OfferingSkeletonCard } from "@/widgets/offering-list";
import { Button } from "@/shared/ui";
import { InventoryCardActions } from "./InventoryCardActions";

// ─── UI-specific types (declared before the component) ───

export type InventoryResultsTexts = InventoryCardTexts & {
  empty: string;
  error: string;
  retry: string;
  view: string;
  createOffering: string;
};

export type InventoryResultsProps = {
  locale: string;
  /** The filters the address carries, sent as the read's query. */
  query: CoffeeInventoryQuery;
  texts: InventoryResultsTexts;
};

// The grid of My offerings: 1 column, 2 from `lg`, 3 from `2xl`, 1.5rem gap;
// grid items stretch, so a row shares its height (design.md D6).
const GRID_CLASSES = ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2", "2xl:grid-cols-3"].join(" ");
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

/**
 * The inventory read and its states (add-coffee-inventory-explorer design.md
 * D6; spec "Coffee inventory list"): skeleton cards, the error with retry,
 * the empty message, or one card per returned item with no pagination.
 */
export function InventoryResults({ locale, query, texts }: InventoryResultsProps): ReactNode {
  const { inventory, retry } = useCoffeeInventory(query, true);
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
    return <p className={["type-body", "text-center"].join(" ")}>{texts.empty}</p>;
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
