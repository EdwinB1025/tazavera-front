import type { OfferingTaxonomyNode } from "@/shared/api";
import type { ResolvedTaxonomyBadge } from "@/entities/offering";
import type { TaxonomyLookup } from "@/entities/taxonomy";

/**
 * Taxonomy resolution (design.md D5; the landing spec "Taxonomy badges on the
 * offering card" — "Names by locale", "Unresolved reference"). The lookup is
 * built once per route render from `GET /taxonomies` and shared by every card
 * of that render: the tree flattens (nested `children` recursively) into a map
 * by `ulid`, and each `ref` of an offering's `sensoryTaxonomy` — including its
 * own `children` — resolves through it. The badge's row comes from the
 * offering node's own `level`, not from the taxonomy node (design.md D5); a
 * `ref` that finds no node yields no badge.
 */

// The contract declares `level` as a number and the tree as 0–2; the badge
// rows are exactly those three levels (design.md D5).
function badgeLevel(level: number | undefined): 0 | 1 | 2 {
  return level === 1 || level === 2 ? level : 0;
}

/** The badge data of every resolvable `ref`, in tree order (D5). */
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
        level: badgeLevel(node.level),
      });
    }
    badges.push(...resolveTaxonomies(node.children ?? [], lookup));
  }
  return badges;
}
