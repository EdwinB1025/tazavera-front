import type { OfferingSummary, OfferingTaxonomyNode } from "@/shared/api";
import type { ResolvedTaxonomyBadge } from "@/entities/offering";
import type { TaxonomyLookup } from "@/entities/taxonomy";

/**
 * The card's taxonomy badges for an offering loaded on the client (the
 * landing spec "Taxonomy badges on the offering card"): each `ref` of the
 * offering's consensus, its `cataConcordance` with nested `children`, resolves
 * through the lookup built from `GET /taxonomies`, once per reference; the
 * per-attribute `sensoryTaxonomy` is never read (fix-production-aut-findings
 * design.md D1). The badge's row is the offering node's own `level`, and a
 * `ref` that finds no node yields no badge. The same rule as the internal
 * resolver of `src/widgets/offering-list`.
 */
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
          level: node.level === 1 || node.level === 2 ? node.level : 0,
        });
      }
      visit(node.children ?? []);
    }
  };
  visit(offering.cataConcordance ?? []);
  return badges;
}
