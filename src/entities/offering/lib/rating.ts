/**
 * Rating rule (design.md D8; the landing spec "Score and rating tier" and
 * "No score"). The range logic lives here, not in the component (design
 * summary §4). The tier names are the `Badge` variant names of the rating
 * family (design.md D7).
 */

export type RatingTier =
  | "rating-exceptional"
  | "rating-excellent"
  | "rating-good"
  | "rating-commercial";

/**
 * The tier of a `cuppingAvg` decimal string like `'84.25'`:
 * `rating-exceptional` at ≥ 90, `rating-excellent` at ≥ 85 and below 90,
 * `rating-good` at ≥ 80 and below 85 and `rating-commercial` below 80. An
 * absent or unparsable score yields `null`, which the card reads as no score
 * and no rating badge (spec: "No score").
 */
export function ratingTierFor(
  score: string | null | undefined,
): RatingTier | null {
  if (score == null || score.trim() === "") {
    return null;
  }
  const value = Number(score);
  if (!Number.isFinite(value)) {
    return null;
  }
  if (value >= 90) {
    return "rating-exceptional";
  }
  if (value >= 85) {
    return "rating-excellent";
  }
  if (value >= 80) {
    return "rating-good";
  }
  return "rating-commercial";
}
