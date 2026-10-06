import { useCallback, useEffect, useState } from "react";
import type { OfferingsPageMeta, OfferingSummary } from "@/shared/api";
import { fetchOwnOfferings, type OwnOfferingsResult } from "../api/management";

/**
 * The own-list state (design.md D1, D7; spec "My offerings list"): it loads
 * the requested page of the coffeeshop's offerings on the client and reloads
 * it on demand, going through the loading state each time.
 */

// ─── State (declared before the hook) ───

export type OwnOfferingsState =
  | { state: "loading" }
  | { state: "success"; data: OfferingSummary[]; meta: OfferingsPageMeta }
  | { state: "empty" }
  | { state: "error" };

export type OwnOfferings = {
  list: OwnOfferingsState;
  /** Loads the current page again through the loading state. */
  reload: () => void;
};

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
  return { list, reload };
}
