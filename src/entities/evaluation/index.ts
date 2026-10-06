/**
 * Public API of the `entities/evaluation` slice (Feature-Sliced Design).
 *
 * Exports the evaluation calls and the pure model of the CVA form (design.md
 * D2, D3), so every consumer imports through this entry point.
 */
export { EVALUATION_GROUPS } from "./model/groups";
export type {
  AxisKey,
  DescriptiveAxisKey,
  DescriptorBlock,
  DescriptorBlockKey,
  DescriptorSelectionKey,
  GroupDefinition,
  GroupKey,
  GroupPart,
  PartKey,
} from "./model/groups";
