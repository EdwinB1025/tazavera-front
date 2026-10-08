import type { OfferingTaxonomyNode } from "@/shared/api";

/** `ref` → `count` of every node of the offering's tree of one `type`, descendants included. */
export function identifiedCounts(
  nodes: OfferingTaxonomyNode[],
  type: string,
): Map<string, number> {
  const counts = new Map<string, number>();
  function visit(node: OfferingTaxonomyNode) {
    counts.set(node.ref ?? "", node.count ?? 0);
    for (const child of node.children ?? []) {
      visit(child as OfferingTaxonomyNode);
    }
  }
  for (const node of nodes) {
    if (node.type === type) {
      visit(node);
    }
  }
  return counts;
}
