import { describe, it, expect } from "vitest";
import {
  OFFERING_SORT_OPTIONS,
  hasOfferingFilters,
  parseOfferingFilters,
  sanitizeOfferingQuery,
  scoreRangeChanges,
} from "./query";

/**
 * Offering filter state in the URL (design.md D4, D6; spec "Offering filter
 * state in the URL", "Offering sort").
 */

const EMPTY = {
  coffeeName: undefined,
  verified: undefined,
  cuppingAvgMin: undefined,
  cuppingAvgMax: undefined,
  cataRef: [],
  originCountry: undefined,
  originRegion: undefined,
  process: undefined,
  variety: undefined,
  producer: undefined,
  roasteryName: undefined,
  city: undefined,
  sort: "default",
};

const TEXT_KEYS = [
  ["coffeeName", 150],
  ["roasteryName", 150],
  ["producer", 150],
  ["originCountry", 90],
  ["originRegion", 90],
  ["process", 90],
  ["variety", 90],
  ["city", 90],
] as const;

describe("parseOfferingFilters (design.md D4)", () => {
  it("returns every value empty and the default sort with no key", () => {
    expect(parseOfferingFilters(new URLSearchParams())).toEqual(EMPTY);
    expect(parseOfferingFilters({})).toEqual(EMPTY);
  });

  it.each(TEXT_KEYS)("reads %s from URLSearchParams and from a record", (key) => {
    expect(parseOfferingFilters(new URLSearchParams({ [key]: "Huila" }))[key]).toBe("Huila");
    expect(parseOfferingFilters({ [key]: "Huila" })[key]).toBe("Huila");
  });

  it.each(TEXT_KEYS)("trims %s and drops it one character over its limit", (key, limit) => {
    expect(parseOfferingFilters({ [key]: "  Lima " })[key]).toBe("Lima");
    expect(parseOfferingFilters({ [key]: "a".repeat(limit) })[key]).toBe("a".repeat(limit));
    expect(parseOfferingFilters({ [key]: "a".repeat(limit + 1) })[key]).toBeUndefined();
  });

  it("drops blank text", () => {
    expect(parseOfferingFilters({ city: "   " }).city).toBeUndefined();
  });

  it("keeps the first value of a repeated single-value key", () => {
    expect(parseOfferingFilters({ process: ["washed", "natural"] }).process).toBe("washed");
    expect(parseOfferingFilters(new URLSearchParams("process=washed&process=natural")).process).toBe(
      "washed",
    );
  });

  it("reads verified 1 and 0 and drops any other value", () => {
    expect(parseOfferingFilters({ verified: "1" }).verified).toBe("1");
    expect(parseOfferingFilters({ verified: "0" }).verified).toBe("0");
    expect(parseOfferingFilters({ verified: "yes" }).verified).toBeUndefined();
  });

  it("reads cuppingAvgMin alone", () => {
    const values = parseOfferingFilters({ cuppingAvgMin: "80" });
    expect(values.cuppingAvgMin).toBe(80);
    expect(values.cuppingAvgMax).toBeUndefined();
  });

  it.each(["120", "-1", "abc", ""])("drops cuppingAvgMin=%s", (value) => {
    expect(parseOfferingFilters({ cuppingAvgMin: value }).cuppingAvgMin).toBeUndefined();
  });

  it("drops both bounds when the minimum is above the maximum", () => {
    const values = parseOfferingFilters({ cuppingAvgMin: "90", cuppingAvgMax: "80" });
    expect(values.cuppingAvgMin).toBeUndefined();
    expect(values.cuppingAvgMax).toBeUndefined();
  });

  it("keeps repeated cataRef values in order and drops empty ones", () => {
    expect(parseOfferingFilters(new URLSearchParams("cataRef=b&cataRef=&cataRef=a")).cataRef).toEqual([
      "b",
      "a",
    ]);
    expect(parseOfferingFilters({ cataRef: ["b", "a"] }).cataRef).toEqual(["b", "a"]);
    expect(parseOfferingFilters({ cataRef: "b" }).cataRef).toEqual(["b"]);
  });

  it("reads a sort pair of the options", () => {
    expect(parseOfferingFilters({ orderBy: "cupping_avg", orderDirection: "desc" }).sort).toBe(
      "score-desc",
    );
    expect(parseOfferingFilters({ orderBy: "created_at", orderDirection: "asc" }).sort).toBe("oldest");
  });

  it("falls back to the default sort for an incomplete or unknown pair", () => {
    expect(parseOfferingFilters({ orderBy: "cupping_avg" }).sort).toBe("default");
    expect(parseOfferingFilters({ orderBy: "name", orderDirection: "asc" }).sort).toBe("default");
  });
});

describe("OFFERING_SORT_OPTIONS (design.md D6)", () => {
  it("lists the six options in order with their keys", () => {
    expect(OFFERING_SORT_OPTIONS).toEqual([
      { id: "default", textKey: "sortDefault", orderBy: undefined, orderDirection: undefined },
      { id: "score-desc", textKey: "sortScoreDesc", orderBy: "cupping_avg", orderDirection: "desc" },
      { id: "score-asc", textKey: "sortScoreAsc", orderBy: "cupping_avg", orderDirection: "asc" },
      {
        id: "most-evaluated",
        textKey: "sortMostEvaluated",
        orderBy: "evaluation_count",
        orderDirection: "desc",
      },
      { id: "newest", textKey: "sortNewest", orderBy: "created_at", orderDirection: "desc" },
      { id: "oldest", textKey: "sortOldest", orderBy: "created_at", orderDirection: "asc" },
    ]);
  });
});

describe("sanitizeOfferingQuery (design.md D4)", () => {
  it("keeps page and the other contract keys and removes the dropped values", () => {
    expect(
      sanitizeOfferingQuery({
        page: "2",
        evaluationCountMin: "2",
        verified: "yes",
        cuppingAvgMin: "120",
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

  it("writes the parsed values of the kept keys", () => {
    expect(
      sanitizeOfferingQuery({
        city: " Lima ",
        cataRef: "a",
        orderBy: "cupping_avg",
        orderDirection: "desc",
      }),
    ).toEqual({ city: "Lima", cataRef: ["a"], orderBy: "cupping_avg", orderDirection: "desc" });
  });
});

describe("hasOfferingFilters (design.md D4)", () => {
  it("is false with no value or only a sort", () => {
    expect(hasOfferingFilters(parseOfferingFilters({}))).toBe(false);
    expect(
      hasOfferingFilters(parseOfferingFilters({ orderBy: "cupping_avg", orderDirection: "desc" })),
    ).toBe(false);
  });

  it("is true with one facet value", () => {
    expect(hasOfferingFilters(parseOfferingFilters({ process: "washed" }))).toBe(true);
    expect(hasOfferingFilters(parseOfferingFilters({ cuppingAvgMax: "90" }))).toBe(true);
  });

  it("is true with only cataRef", () => {
    expect(hasOfferingFilters(parseOfferingFilters({ cataRef: "a" }))).toBe(true);
  });
});

describe("scoreRangeChanges (design.md D4)", () => {
  it("writes neither bound for the full range", () => {
    expect(scoreRangeChanges([0, 100])).toEqual({ cuppingAvgMin: undefined, cuppingAvgMax: undefined });
  });

  it("writes only the bound that differs from its end", () => {
    expect(scoreRangeChanges([60, 100])).toEqual({ cuppingAvgMin: "60", cuppingAvgMax: undefined });
    expect(scoreRangeChanges([0, 90])).toEqual({ cuppingAvgMin: undefined, cuppingAvgMax: "90" });
  });
});
