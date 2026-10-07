"use client";

import { useCallback, useEffect, useState } from "react";
import type { OfferingsPageMeta, OfferingSummary } from "@/shared/api";
import { fetchOwnOfferings, type OwnOfferingsResult } from "../api/management";

/**
 * The own-list state (design.md D1, D7; specs "My offerings list" and
 * "Offering selection"): it loads the requested page of the coffeeshop's
 * offerings on the client and reloads it on demand, going through the loading
 * state each time. The selection is a set of offering `ulid`s of the loaded
 * page only: it belongs to one request, so a page change and a reload (after a
 * successful delete) empty it.
 */

// ─── State (declared before the hook) ───

export type OwnOfferingsState =
  | { state: "loading" }
  | { state: "success"; data: OfferingSummary[]; meta: OfferingsPageMeta }
  | { state: "empty" }
  | { state: "error" };

export type OfferingSelection = {
  selected: ReadonlySet<string>;
  /** Every offering of the loaded page is selected (none on an empty page). */
  allSelected: boolean;
  toggle: (ulid: string) => void;
  /** Selects the whole page, or clears it when the whole page is selected. */
  toggleAll: () => void;
};

export type OwnOfferings = {
  list: OwnOfferingsState;
  /** Loads the current page again through the loading state. */
  reload: () => void;
  selection: OfferingSelection;
};

const NONE: ReadonlySet<string> = new Set();

export function useOwnOfferings(coffeeshopUlid: string, page: number): OwnOfferings {
  // Bumped by `reload`, so the same page loads again.
  const [attempt, setAttempt] = useState(0);
  // The settled result with the request it answers: a result for another
  // request (another page, or before a reload) reads as loading.
  const [settled, setSettled] = useState<{
    key: string;
    result: OwnOfferingsResult;
  } | null>(null);
  const key = `${coffeeshopUlid}|${page}|${attempt}`;

  useEffect(() => {
    let current = true;
    fetchOwnOfferings(coffeeshopUlid, page).then((result) => {
      if (current) setSettled({ key: `${coffeeshopUlid}|${page}|${attempt}`, result });
    });
    return () => {
      current = false;
    };
  }, [coffeeshopUlid, page, attempt]);

  const reload = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  const list: OwnOfferingsState =
    settled !== null && settled.key === key ? settled.result : { state: "loading" };

  // The selection of the request it was made on; any other request reads it
  // as empty.
  const [picked, setPicked] = useState<{ key: string; ids: ReadonlySet<string> }>({
    key,
    ids: NONE,
  });
  const selected = picked.key === key ? picked.ids : NONE;
  const pageIds =
    list.state === "success"
      ? list.data.flatMap((offering) => (offering.ulid ? [offering.ulid] : []))
      : [];
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggle = (ulid: string) => {
    const next = new Set(selected);
    if (next.has(ulid)) {
      next.delete(ulid);
    } else {
      next.add(ulid);
    }
    setPicked({ key, ids: next });
  };
  const toggleAll = () => {
    setPicked({ key, ids: allSelected ? NONE : new Set(pageIds) });
  };

  return { list, reload, selection: { selected, allSelected, toggle, toggleAll } };
}
