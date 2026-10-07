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
  it("returns rating-exceptional at 90 (spec: Score and rating tier)", () => {
    expect(ratingTierFor("90")).toBe("rating-exceptional");
  });

  it("returns rating-excellent at 85 (spec: Score and rating tier)", () => {
    expect(ratingTierFor("85")).toBe("rating-excellent");
  });

  it("returns rating-good at 80 (spec: Score and rating tier)", () => {
    expect(ratingTierFor("80")).toBe("rating-good");
  });
});
