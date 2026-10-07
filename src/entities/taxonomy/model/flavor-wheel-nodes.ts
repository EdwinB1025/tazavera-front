import type { OfferingTaxonomyNode } from "@/shared/api";
import type { FlavorWheelNode } from "@/shared/ui";
import type { TaxonomyLookup } from "./lookup";

/**
 * Flavor wheel node mapping (design.md D1, D3). Pure: it turns the offering's
 * `cataConcordance` into the UI-only `FlavorWheelNode` tree the wheel takes as
 * props. It keeps the roots whose `type` is `aromatics`, resolves each `ref`
 * through the lookup, skips a node with its subtree when its ref resolves
 * nothing or its lookup colour is empty (spec: "Unresolved or colourless notes
 * are skipped"), orders siblings by the lookup's insertion order (the order of
 * `GET /taxonomies`), takes `level` from the offering node's own level and
 * fills `countLabel` with `countLabel(count, total)` (design.md D3).
 */
export function buildFlavorWheelNodes(
  cataConcordance: OfferingTaxonomyNode[],
  lookup: TaxonomyLookup,
  total: number,
  countLabel: (count: number, total: number) => string,
): FlavorWheelNode[] {
  // The lookup's insertion order is the order of `GET /taxonomies` (design.md
  // D3): every sibling list comes out in it, whatever the concordance order.
  const taxonomyOrder = new Map<string, number>();
  for (const ulid of lookup.keys()) {
    taxonomyOrder.set(ulid, taxonomyOrder.size);
  }

  function buildNode(node: OfferingTaxonomyNode): FlavorWheelNode | null {
    const id = node.ref ?? "";
    const entry = lookup.get(id);
    if (entry === undefined || entry.color === "") return null;
    const count = node.count ?? 0;
    return {
      id,
      name: entry.label,
      description: entry.description,
      color: entry.color,
      level: node.level as 0 | 1 | 2,
      count,
      countLabel: countLabel(count, total),
      children: buildNodes(node.children ?? []),
    };
  }

  function buildNodes(nodes: OfferingTaxonomyNode[]): FlavorWheelNode[] {
    return nodes
      .map(buildNode)
      .filter((node): node is FlavorWheelNode => node !== null)
      .sort(
        (a, b) => (taxonomyOrder.get(a.id) ?? 0) - (taxonomyOrder.get(b.id) ?? 0),
      );
  }

  return buildNodes(cataConcordance.filter((root) => root.type === "aromatics"));
}
