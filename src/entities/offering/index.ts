/**
 * Public API of the `entities/offering` slice (Feature-Sliced Design).
 *
 * Exports the offering card and its prop types and the rating rule, so every
 * consumer imports through this entry point. Importing a slice through its
 * public API keeps the internal structure free to change.
 */
export { OfferingCard } from "./ui/OfferingCard";
export type {
  OfferingCardProps,
  OfferingCardTexts,
  ResolvedTaxonomyBadge,
} from "./ui/OfferingCard";
export { ratingTierFor } from "./lib/rating";
export type { RatingTier } from "./lib/rating";
