/**
 * Public API of the `entities/taxonomy` slice (Feature-Sliced Design).
 *
 * Exports the taxonomy read, the lookup by `ulid` with its types, the flavor
 * wheel node mapping and the descriptor-row builder, so every consumer imports through this entry
 * point (design.md D1). The payload type stays in `@/shared/api` and is not
 * re-exported (design.md D2).
 */
export { fetchTaxonomies } from "./api/taxonomies";
export { buildTaxonomyLookup } from "./model/lookup";
export type { TaxonomyLookup, TaxonomyLookupEntry } from "./model/lookup";
export { buildFlavorWheelNodes } from "./model/flavor-wheel-nodes";
export { buildDescriptorRows } from "./model/descriptor-rows";
