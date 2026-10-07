import { distinctCoffeeValues } from "@/shared/api";
import type { CoffeeSummary, TaxonomiesPayload, TaxonomyNode } from "@/shared/api";
import type { CascadeOption } from "@/shared/ui";

/**
 * Option data of the offering facets (design.md D1, D7). A failed read gives
 * `null` for the facets it feeds, which then render disabled with "Options
 * unavailable"; the other read is unaffected.
 */

// ─── UI-specific types (design.md D11) ───

/** A level-0 taste note with its level-1 children. */
export type TasteNoteOption = CascadeOption;

/** `null` = unavailable. */
export type OfferingFacetOptions = {
  countries: string[] | null;
  regions: string[] | null;
  processes: string[] | null;
  varieties: string[] | null;
  producers: string[] | null;
  tasteNotes: TasteNoteOption[] | null;
};

function nodeName(node: TaxonomyNode, locale: string): string {
  const name = locale === "ca" ? node.nameCa : locale === "es" ? node.nameEs : node.nameEn;
  return name ?? "";
}

/** Level-0 nodes in API order, each with its level-1 children; level 2 is not offered. */
export function tasteNoteOptions(tree: readonly TaxonomyNode[], locale: string): TasteNoteOption[] {
  return tree
    .filter((node) => node.level === 0)
    .map((node) => ({
      value: node.ulid ?? "",
      label: nodeName(node, locale),
      children: ((node.children ?? []) as TaxonomyNode[])
        .filter((child) => child.level === 1)
        .map((child) => ({ value: child.ulid ?? "", label: nodeName(child, locale) })),
    }));
}

/** The options of every facet from the settled coffees and taxonomy reads. */
export function offeringFacetOptions(
  coffees: PromiseSettledResult<CoffeeSummary[]>,
  taxonomies: PromiseSettledResult<TaxonomiesPayload>,
  locale: string,
): OfferingFacetOptions {
  const list = coffees.status === "fulfilled" ? coffees.value : null;
  return {
    countries: list && distinctCoffeeValues(list, "country"),
    regions: list && distinctCoffeeValues(list, "region"),
    processes: list && distinctCoffeeValues(list, "process"),
    varieties: list && distinctCoffeeValues(list, "variety"),
    producers: list && distinctCoffeeValues(list, "producer"),
    tasteNotes:
      taxonomies.status === "fulfilled" ? tasteNoteOptions(taxonomies.value.data, locale) : null,
  };
}
