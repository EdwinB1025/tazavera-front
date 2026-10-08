import type { OfferingSummary, OfferingTaxonomyNode } from "@/shared/api";
import type { TaxonomyLookup } from "./lookup";

/**
 * Taste note tree (nest-card-taste-notes design.md D1; the landing spec
 * "Taxonomy badge trees on the offering card"). Pure: it turns the offering's
 * consensus, its `cataConcordance` with nested `children`, into the tree the
 * offering card renders, never reading the per-attribute `sensoryTaxonomy`.
 * The tree keeps the shape the API delivers; nothing is re-attached under a
 * taxonomy parent. Each reference renders once, at its first occurrence, with
 * the children of every occurrence under it; a reference the lookup does not
 * find renders no node and its resolved children take its place.
 */

// ─── Types (declared before the functions) ───

export type TasteNoteNode = {
  ref: string;
  label: string;
  color: string;
  level: 0 | 1 | 2;
  children: TasteNoteNode[];
};

// The contract declares `level` as a number and the tree as 0–2.
function noteLevel(level: number | undefined): 0 | 1 | 2 {
  return level === 1 || level === 2 ? level : 0;
}

/** The children of every occurrence of each reference, in tree order. */
function childrenByRef(
  nodes: OfferingTaxonomyNode[],
  merged: Map<string, OfferingTaxonomyNode[]>,
): Map<string, OfferingTaxonomyNode[]> {
  for (const node of nodes) {
    const ref = node.ref ?? "";
    const children = node.children ?? [];
    merged.set(ref, [...(merged.get(ref) ?? []), ...children]);
    childrenByRef(children, merged);
  }
  return merged;
}

/** The card's taste note tree of an offering's consensus (D1). */
export function buildTasteNoteTree(
  offering: OfferingSummary,
  lookup: TaxonomyLookup,
): TasteNoteNode[] {
  const concordance = offering.cataConcordance ?? [];
  const merged = childrenByRef(concordance, new Map());
  const seen = new Set<string>();

  function build(nodes: OfferingTaxonomyNode[]): TasteNoteNode[] {
    const result: TasteNoteNode[] = [];
    for (const node of nodes) {
      const ref = node.ref ?? "";
      const entry = lookup.get(ref);
      if (entry === undefined) {
        result.push(...build(node.children ?? []));
      } else if (!seen.has(ref)) {
        seen.add(ref);
        result.push({
          ref,
          label: entry.label,
          color: entry.color,
          level: noteLevel(node.level),
          children: build(merged.get(ref) ?? []),
        });
      }
    }
    return result;
  }

  return build(concordance);
}
