import type { OfferingSummary, OfferingTaxonomyNode } from "@/shared/api";
import type { ResolvedTaxonomyBadge } from "@/entities/offering";
import type { TaxonomyLookup } from "@/entities/taxonomy";

/**
 * Taxonomy resolution (design.md D5; the landing spec "Taxonomy badges on the
 * offering card" — "Names by locale", "Unresolved reference", "Values from the
 * consensus", "Each value once", "No consensus"). The lookup is built once per
 * route render from `GET /taxonomies` and shared by every card of that render.
 * The badges come from the offering's consensus, its `cataConcordance` with
 * nested `children`, never from the per-attribute `sensoryTaxonomy`, which
 * repeats a note once per attribute (fix-production-aut-findings design.md
 * D1). A reference already seen is skipped, so each value shows once with the
 * level of its first occurrence. The badge's row comes from the offering
 * node's own `level`; a `ref` that finds no node yields no badge.
 */

// The contract declares `level` as a number and the tree as 0–2; the badge
// rows are exactly those three levels (design.md D5).
function badgeLevel(level: number | undefined): 0 | 1 | 2 {
  return level === 1 || level === 2 ? level : 0;
}

/** The badge data of every resolvable consensus `ref`, once each, in tree order (D1). */
export function resolveTaxonomies(
  offering: OfferingSummary,
  lookup: TaxonomyLookup,
): ResolvedTaxonomyBadge[] {
  const badges: ResolvedTaxonomyBadge[] = [];
  const seen = new Set<string>();
  const visit = (nodes: OfferingTaxonomyNode[]) => {
    for (const node of nodes) {
      const ref = node.ref ?? "";
      const entry = lookup.get(ref);
      if (entry !== undefined && !seen.has(ref)) {
        seen.add(ref);
        badges.push({
          label: entry.label,
          color: entry.color,
          level: badgeLevel(node.level),
        });
      }
      visit(node.children ?? []);
    }
  };
  visit(offering.cataConcordance ?? []);
  return badges;
}
