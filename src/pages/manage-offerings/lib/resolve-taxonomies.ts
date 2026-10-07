import type { OfferingTaxonomyNode } from "@/shared/api";
import type { ResolvedTaxonomyBadge } from "@/entities/offering";
import type { TaxonomyLookup } from "@/entities/taxonomy";

/**
 * The card's taxonomy badges for an offering loaded on the client (the
 * landing spec "Taxonomy badges on the offering card"): each `ref` of the
 * offering's `sensoryTaxonomy`, its `children` included, resolves through the
 * lookup built from `GET /taxonomies`; the badge's row is the offering node's
 * own `level`, and a `ref` that finds no node yields no badge. The same rule
 * as the internal resolver of `src/widgets/offering-list`, which this change
 * leaves unchanged (design.md D2).
 */
export function resolveTaxonomies(
  nodes: OfferingTaxonomyNode[],
  lookup: TaxonomyLookup,
): ResolvedTaxonomyBadge[] {
  const badges: ResolvedTaxonomyBadge[] = [];
  for (const node of nodes) {
    const entry = lookup.get(node.ref ?? "");
    if (entry !== undefined) {
      badges.push({
        label: entry.label,
        color: entry.color,
        level: node.level === 1 || node.level === 2 ? node.level : 0,
      });
    }
    badges.push(...resolveTaxonomies(node.children ?? [], lookup));
  }
  return badges;
}
