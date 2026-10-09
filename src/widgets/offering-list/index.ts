/**
 * Public API of the `offering-list` widget (Feature-Sliced Design).
 *
 * Exposes the verified-offerings block, the query-driven offerings block and
 * their parts so consumers import through this entry point only:
 * `@/widgets/offering-list`. The `api/` segment is internal to the block.
 */
export { VerifiedOfferings } from "./ui/VerifiedOfferings";
export type { VerifiedOfferingsProps } from "./ui/VerifiedOfferings";
export type { OfferingListTexts } from "./ui/OfferingList";
export { OfferingSkeletonCard } from "./ui/OfferingSkeletonCard";
export { OFFERING_GRID_CLASSES } from "./lib/grid";
export type { OfferingsQuery } from "./lib/query";
export { FilteredOfferingsResults } from "./ui/FilteredOfferingsResults";
export type {
  FilteredOfferingsResultsProps,
  FilteredOfferingsResultsTexts,
} from "./ui/FilteredOfferingsResults";
export { FilteredOfferingsToolbar } from "./ui/FilteredOfferingsToolbar";
export type { FilteredOfferingsToolbarProps } from "./ui/FilteredOfferingsToolbar";
export { FilteredOfferingsFacets } from "./ui/FilteredOfferingsFacets";
export type { FilteredOfferingsFacetsProps } from "./ui/FilteredOfferingsFacets";
