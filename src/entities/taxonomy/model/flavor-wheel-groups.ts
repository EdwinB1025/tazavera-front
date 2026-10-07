import type { TaxonomyNode } from "@/shared/api";
import type { FlavorWheelNode } from "@/shared/ui";

/**
 * Wheel group assignment (add-offering-catalog design.md D19). Pure: it sets
 * the group of each root of the wheel — `mouthfeel` when its taxonomy node in
 * `GET /taxonomies` has `mouthfeel` among its `categories`, `aromatics`
 * otherwise. Only roots carry a group; descendants follow their root.
 */

export type WheelGroupId = "aromatics" | "mouthfeel";

function mouthfeelUlids(
  nodes: TaxonomyNode[],
  into = new Set<string>(),
): Set<string> {
  for (const node of nodes) {
    if (node.categories?.includes("mouthfeel")) into.add(node.ulid ?? "");
    mouthfeelUlids(node.children ?? [], into);
  }
  return into;
}

/** The wheel's roots, each with its group. */
export function assignWheelGroups(
  roots: FlavorWheelNode[],
  taxonomies: TaxonomyNode[],
): FlavorWheelNode[] {
  const mouthfeel = mouthfeelUlids(taxonomies);
  return roots.map((root) => ({
    ...root,
    group: mouthfeel.has(root.id) ? "mouthfeel" : "aromatics",
  }));
}
