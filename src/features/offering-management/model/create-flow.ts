import { useState } from "react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { createOfferings } from "../api/management";

/**
 * The create form's state (design.md D5, D10; spec "Creating offerings"): the
 * chosen inventory item and the submit states. A submit with no item chosen
 * marks the item missing and sends nothing. A 201 reports the created count
 * and resets the choice; a failure or a 422 keeps every value with the
 * generic error; a 403 keeps every value with the step-up (the identity check
 * runs in a popup and the user submits again).
 */

// ─── State (declared before the hook) ───

export type CreateStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "created"; count: number }
  | { state: "failed" }
  | { state: "step-up" };

export type CreateFlow = {
  item: CoffeeInventoryItem | null;
  /** A submit found no item chosen; cleared by the next choice. */
  itemMissing: boolean;
  status: CreateStatus;
  choose: (item: CoffeeInventoryItem | null) => void;
  /** Sends the create call; `false` when no item is chosen and nothing was sent. */
  submit: () => boolean;
};

export function useCreateFlow(): CreateFlow {
  const [item, setItem] = useState<CoffeeInventoryItem | null>(null);
  const [itemMissing, setItemMissing] = useState(false);
  const [status, setStatus] = useState<CreateStatus>({ state: "idle" });

  const choose = (next: CoffeeInventoryItem | null) => {
    setItem(next);
    if (next !== null) setItemMissing(false);
  };

  const submit = () => {
    if (status.state === "pending") return true;
    if (item === null) {
      setItemMissing(true);
      return false;
    }
    setStatus({ state: "pending" });
    createOfferings(item.ulid ?? "", []).then((result) => {
      if (result.outcome === "ok") {
        setItem(null);
        setStatus({ state: "created", count: result.count });
      } else {
        setStatus({ state: result.outcome === "forbidden" ? "step-up" : "failed" });
      }
    });
    return true;
  };

  return { item, itemMissing, status, choose, submit };
}
