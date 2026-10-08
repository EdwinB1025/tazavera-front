import { describe, it, expect } from "vitest";
import { ratingTierFor } from "@/entities/offering";

/**
 * Rating rule tests (design.md D8; the landing spec: "Score and rating tier",
 * "No score"). Written before the implementation (task 4.2): the import goes
 * through the slice's public API, which fails to resolve until
 * `src/entities/offering/` exists (`lib/rating.ts`, `ui/OfferingCard.tsx` and
 * the entity entry `index.ts`), so the file runs and fails as required.
 *
 * `ratingTierFor` parses the `cuppingAvg` decimal string and returns the tier
 * name of its range: `rating-exceptional` at ≥ 90, `rating-excellent` at ≥ 85
 * and below 90, `rating-good` at ≥ 80 and below 85 and `rating-commercial`
 * below 80 (design.md D8). An absent or unparsable score yields `null`, which
 * the card reads as no score and no rating badge (spec: "No score").
 */

describe("ratingTierFor (design.md D8)", () => {
  it("returns rating-excellent just below 90 (spec: Score and rating tier)", () => {
    expect(ratingTierFor("89.99")).toBe("rating-excellent");
  });

  it("returns rating-good just below 85 (spec: Score and rating tier)", () => {
    expect(ratingTierFor("84.99")).toBe("rating-good");
  });

  it("returns rating-commercial below 80 (spec: Score and rating tier)", () => {
    expect(ratingTierFor("79.99")).toBe("rating-commercial");
  });

  it("returns null when the score is absent (spec: No score)", () => {
    expect(ratingTierFor(undefined)).toBeNull();
  });

  it("returns null when the score is unparsable (spec: No score)", () => {
    expect(ratingTierFor("not a score")).toBeNull();
  });
});
