"use client";

import { useEffect, useState } from "react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { createOfferings, fetchMyLocations, type LocationsResult } from "../api/management";

/**
 * The create form's state (design.md D5, D10; spec "Creating offerings"): the
 * chosen inventory item, the coffeeshop's locations with their selection, and
 * the submit states. The only location of a coffeeshop with exactly one starts
 * selected; with none the submit is unavailable. An empty selection is sent
 * as is: the contract does not require `locations` (M2). A submit with no item chosen
 * marks the item missing and sends nothing. A 201 reports the created count
 * and resets the choice and the selection; a failure or a 422 keeps every value with the
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

export type LocationsState = { state: "loading" } | LocationsResult;

export type CreateFlow = {
  locations: LocationsState;
  /** The selected location ulids. */
  selectedLocations: string[];
  toggleLocation: (ulid: string) => void;
  /** Loads the locations again through the loading state. */
  reloadLocations: () => void;
  /** The coffeeshop has no locations: the submit is unavailable. */
  submitBlocked: boolean;
  item: CoffeeInventoryItem | null;
  /** A submit found no item chosen; cleared by the next choice. */
  itemMissing: boolean;
  status: CreateStatus;
  choose: (item: CoffeeInventoryItem | null) => void;
  /** Sends the create call; `false` when no item is chosen and nothing was sent. */
  submit: () => boolean;
};

export type CreateFlowOptions = {
  /** Off while the session resolves: nothing loads. */
  enabled: boolean;
};

export function useCreateFlow({ enabled }: CreateFlowOptions): CreateFlow {
  const [item, setItem] = useState<CoffeeInventoryItem | null>(null);
  const [itemMissing, setItemMissing] = useState(false);
  const [status, setStatus] = useState<CreateStatus>({ state: "idle" });

  // Bumped by `reloadLocations`; a result for an older attempt reads as
  // loading.
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<{
    attempt: number;
    result: LocationsResult;
  } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let current = true;
    fetchMyLocations().then((result) => {
      if (current) setSettled({ attempt, result });
    });
    return () => {
      current = false;
    };
  }, [enabled, attempt]);
  const locations: LocationsState =
    settled !== null && settled.attempt === attempt ? settled.result : { state: "loading" };

  // `null` keeps the initial selection: the only location when there is one.
  const [picked, setPicked] = useState<string[] | null>(null);
  const initial =
    locations.state === "success" && locations.data.length === 1
      ? [locations.data[0]!.ulid ?? ""]
      : [];
  const selectedLocations = picked ?? initial;
  const toggleLocation = (ulid: string) => {
    setPicked(
      selectedLocations.includes(ulid)
        ? selectedLocations.filter((id) => id !== ulid)
        : [...selectedLocations, ulid],
    );
  };
  const reloadLocations = () => {
    setPicked(null);
    setAttempt((value) => value + 1);
  };
  const submitBlocked = locations.state === "success" && locations.data.length === 0;

  const choose = (next: CoffeeInventoryItem | null) => {
    setItem(next);
    if (next !== null) setItemMissing(false);
  };

  const submit = () => {
    if (status.state === "pending" || submitBlocked) return true;
    if (item === null) {
      setItemMissing(true);
      return false;
    }
    setStatus({ state: "pending" });
    createOfferings(item.ulid ?? "", selectedLocations).then((result) => {
      if (result.outcome === "ok") {
        setItem(null);
        setPicked(null);
        setStatus({ state: "created", count: result.count });
      } else {
        setStatus({ state: result.outcome === "forbidden" ? "step-up" : "failed" });
      }
    });
    return true;
  };

  return {
    locations,
    selectedLocations,
    toggleLocation,
    reloadLocations,
    submitBlocked,
    item,
    itemMissing,
    status,
    choose,
    submit,
  };
}
