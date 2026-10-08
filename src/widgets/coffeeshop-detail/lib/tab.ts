/**
 * The detail tab kept in the address (add-coffeeshop-directory design.md D8;
 * spec "Coffee shop detail tabs in the address").
 */

// ─── UI-specific types (declared before the function) ───

export type CoffeeshopTab = "offerings" | "locations";

/** The route's raw `tab` value as a tab: offerings unless it names locations. */
export function toCoffeeshopTab(value: string | string[] | undefined): CoffeeshopTab {
  return value === "locations" ? "locations" : "offerings";
}
