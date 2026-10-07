/**
 * Public API of the `offering-detail` widget (Feature-Sliced Design).
 *
 * Exposes the offering detail block, its presentation and the tab mapping, so
 * consumers import through this entry point only: `@/widgets/offering-detail`.
 */
export { OfferingDetail } from "./ui/OfferingDetail";
export type { OfferingDetailProps } from "./ui/OfferingDetail";
export { OfferingDetailContent } from "./ui/OfferingDetailContent";
export type {
  OfferingDetailContentProps,
  OfferingDetailResult,
  OfferingDetailTexts,
} from "./ui/OfferingDetailContent";
export { toDetailTab } from "./lib/tab";
export type { DetailTab } from "./lib/tab";
