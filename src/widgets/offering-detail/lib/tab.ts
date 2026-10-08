/**
 * The detail tab kept in the address (add-offering-catalog design.md D7; spec
 * "Detail tabs in the address"). `tab` is the only query key the detail reads.
 */

// ─── UI-specific types (declared before the function) ───

export type DetailTab = "inventory" | "consensus" | "provisional";

/** The route's raw `tab` value as a tab: inventory unless it names another tab. */
export function toDetailTab(value: string | string[] | undefined): DetailTab {
  return value === "consensus" || value === "provisional" ? value : "inventory";
}
