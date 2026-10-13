/**
 * Public API of the `entities/taxonomy` slice (Feature-Sliced Design).
 *
 * Exports the taxonomy read, the lookup by `ulid` with its types, the flavor
 * wheel node mapping with its group assignment, the descriptor tree builder,
 * the offering card's taste note tree, the tree of chosen notes, and the reference collector with the
 * read that refreshes a stale cache, so every consumer imports through this entry
 * point (design.md D1). The payload type stays in `@/shared/api` and is not
 * re-exported (design.md D2).
 */
export { fetchTaxonomies, fetchTaxonomiesCovering } from "./api/taxonomies";
export { collectTaxonomyRefs } from "./model/refs";
export { buildTaxonomyLookup } from "./model/lookup";
export type { TaxonomyLookup } from "./model/lookup";
export { buildFlavorWheelNodes } from "./model/flavor-wheel-nodes";
export { assignWheelGroups } from "./model/flavor-wheel-groups";
export { buildDescriptorTree } from "./model/descriptor-tree";
export {
  buildChosenNoteTree,
  buildConsensusNoteTree,
  buildTasteNoteTree,
} from "./model/taste-note-tree";
