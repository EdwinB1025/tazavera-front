/**
 * Public API of the `offering-list` widget (Feature-Sliced Design).
 *
 * Exposes the verified-offerings block and its parts so consumers import
 * through this entry point only: `@/widgets/offering-list`. The `api/` and
 * `lib/` segments are internal to the block.
 */
export { VerifiedOfferings } from "./ui/VerifiedOfferings";
export type { VerifiedOfferingsProps } from "./ui/VerifiedOfferings";
export { OfferingList } from "./ui/OfferingList";
export type {
  OfferingListItem,
  OfferingListProps,
  OfferingListResult,
  OfferingListTexts,
} from "./ui/OfferingList";
export { RetryButton } from "./ui/RetryButton";
export type { RetryButtonProps } from "./ui/RetryButton";
export { OfferingSkeletonCard } from "./ui/OfferingSkeletonCard";
export { OFFERING_GRID_CLASSES } from "./lib/grid";
