import type { TaxonomyNode } from "@/shared/api";

/**
 * Taxonomy lookup (design.md D1). Built once per route render from
 * `GET /taxonomies`: the tree flattens (nested `children` recursively) into a
 * map by `ulid` whose entries carry the name of the given locale and the data
 * color of the node.
 */

// ─── Types (declared before the functions) ───

export type TaxonomyLookupEntry = {
  label: string;
  color: string;
};

export type TaxonomyLookup = Map<string, TaxonomyLookupEntry>;

/** `ulid` → the localized name and the data color of the node (D5). */
export function buildTaxonomyLookup(
  nodes: TaxonomyNode[],
  locale: string,
): TaxonomyLookup {
  const lookup: TaxonomyLookup = new Map();
  for (const node of nodes) {
    lookup.set(node.ulid ?? "", {
      label:
        (locale === "ca"
          ? node.nameCa
          : locale === "es"
            ? node.nameEs
            : node.nameEn) ?? "",
      color: node.color ?? "",
    });
    for (const [ulid, entry] of buildTaxonomyLookup(
      node.children ?? [],
      locale,
    )) {
      lookup.set(ulid, entry);
    }
  }
  return lookup;
}
