import type { ReactNode } from "react";
import { fetchCoffeeshops } from "../api/coffeeshops";
import {
  CoffeeshopList,
  type CoffeeshopListMapTexts,
  type CoffeeshopListResult,
  type CoffeeshopListTexts,
} from "./CoffeeshopList";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopsProps = {
  locale: string;
  /** The kept and sanitized query the request carries (design.md D4). */
  query: Record<string, string>;
  /** At least one coffee shop filter is applied (design.md D6). */
  filtered?: boolean;
  view?: "map";
  focus?: string;
  texts: CoffeeshopListTexts;
  mapTexts?: CoffeeshopListMapTexts;
};

/**
 * The directory block as a thin async Server Component (design.md D7): the one
 * fetch and its mapping into success, empty or error; every branch is the sync
 * presentation's.
 */
export async function Coffeeshops({ query, ...props }: CoffeeshopsProps): Promise<ReactNode> {
  let result: CoffeeshopListResult;
  try {
    const page = await fetchCoffeeshops(query);
    result = page.data.length === 0 ? { state: "empty" } : { state: "success", items: page.data, meta: page.meta };
  } catch {
    result = { state: "error" };
  }
  return <CoffeeshopList {...props} result={result} query={query} />;
}
