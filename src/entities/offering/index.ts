/**
 * Public API of the `entities/offering` slice (Feature-Sliced Design).
 *
 * Exports the offering card and its prop types, its View action, the rating rule and the
 * single-offering read, so every consumer imports through this entry point.
 * Importing a slice through its public API keeps the internal structure free
 * to change.
 */
export { OfferingCard } from "./ui/OfferingCard";
export { OfferingViewButton } from "./ui/OfferingViewButton";
export type {
  OfferingCardTexts,
  ResolvedTaxonomyBadge,
} from "./ui/OfferingCard";
export { ratingTierFor } from "./lib/rating";
export type { RatingTier } from "./lib/rating";
export { fetchOffering } from "./api/offering";
export type { OfferingResult } from "./api/offering";
