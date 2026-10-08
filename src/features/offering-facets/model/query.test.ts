import { describe, it, expect } from "vitest";
import { sanitizeOfferingQuery, scoreRangeChanges } from "./query";

describe("sanitizeOfferingQuery (design.md D4)", () => {
  it("keeps page and the other contract keys and removes the dropped values", () => {
    expect(
      sanitizeOfferingQuery({
        page: "2",
        evaluationCountMin: "2",
        verified: "yes",
        cuppingAvgMin: "50",
        process: "washed",
        cataRef: ["a", "b"],
        orderBy: "cupping_avg",
      }),
    ).toEqual({
      page: "2",
      evaluationCountMin: "2",
      process: "washed",
      cataRef: ["a", "b"],
    });
  });
});

describe("scoreRangeChanges (design.md D4)", () => {
  it("writes neither bound for the full range", () => {
    expect(scoreRangeChanges([60, 100])).toEqual({ cuppingAvgMin: undefined, cuppingAvgMax: undefined });
  });
});
