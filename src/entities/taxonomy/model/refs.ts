/**
 * Taxonomy references of a response (refresh-stale-taxonomies). Pure: every
 * `ref` of a node list and of its nested `children`, in tree order — the
 * consensus and sensory trees of an offering, or an evaluation's `tastes`.
 */

// ─── Types (declared before the functions) ───

export type TaxonomyRefNode = {
  ref?: string | null;
  children?: TaxonomyRefNode[] | null;
};

/** Every `ref` of the nodes, children included. */
export function collectTaxonomyRefs(nodes: readonly TaxonomyRefNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.ref ? [node.ref] : []),
    ...collectTaxonomyRefs(node.children ?? []),
  ]);
}
