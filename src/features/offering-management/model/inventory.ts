"use client";

import { useEffect, useState } from "react";
import type { CoffeeInventoryItem, CoffeeInventoryQuery } from "@/shared/api";
import { listCoffeeInventory } from "../api/management";

// ─── State (declared before the hook) ───

export type InventoryState =
  | { state: "loading" }
  | { state: "error" }
  | { state: "success"; items: CoffeeInventoryItem[] };

export type CoffeeInventoryRead = {
  inventory: InventoryState;
  /** Reads again through the loading state. */
  retry: () => void;
};

/**
 * The coffee inventory read (add-coffee-inventory-explorer design.md D2):
 * `GET /coffeeInventory` with `query`, only while `enabled`. Each read is
 * keyed by the query and a retry count; a result of another key reads as
 * loading, so a new query or a retry shows the loading state and a
 * superseded answer is never shown.
 */
export function useCoffeeInventory(
  query: CoffeeInventoryQuery,
  enabled: boolean,
): CoffeeInventoryRead {
  const [attempt, setAttempt] = useState(0);
  // The query by value, so a new object with the same keys starts no read.
  const serialized = JSON.stringify(query);
  const key = `${serialized}:${attempt}`;
  const [settled, setSettled] = useState<{ key: string; inventory: InventoryState } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let current = true;
    listCoffeeInventory(JSON.parse(serialized) as CoffeeInventoryQuery).then((read) => {
      const inventory: InventoryState = read.ok
        ? { state: "success", items: read.data }
        : { state: "error" };
      if (current) setSettled({ key, inventory });
    });
    return () => {
      current = false;
    };
  }, [enabled, serialized, key]);

  const inventory: InventoryState =
    settled !== null && settled.key === key ? settled.inventory : { state: "loading" };
  return { inventory, retry: () => setAttempt((count) => count + 1) };
}
