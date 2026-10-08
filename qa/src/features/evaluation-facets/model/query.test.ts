import { describe, it, expect } from "vitest";
import {
  EVALUATION_SORT_OPTIONS,
  evaluationListQuery,
  parseEvaluationFilters,
  publicEvaluationsQuery,
} from "@/features/evaluation-facets/model/query";

/**
 * Evaluation filter state in the URL (design.md D4, D6; spec "Evaluation
 * filter state in the URL", "Evaluation sort").
 */

describe("parseEvaluationFilters (design.md D4)", () => {
  it.each([
    ["status=closed", { status: "closed" }],
    ["process=washed", { process: "washed" }],
    ["city=Barcelona", { city: "Barcelona" }],
    ["scoreMin=80", { scoreMin: 80 }],
    ["scoreMin=80&scoreMax=95", { scoreMin: 80, scoreMax: 95 }],
  ])("reads %s from URLSearchParams and from a record", (query, expected) => {
    const params = new URLSearchParams(query);
    const values = { sort: "default", ...expected };
    expect(parseEvaluationFilters(params)).toEqual(values);
    expect(parseEvaluationFilters(Object.fromEntries(params))).toEqual(values);
  });

  it("reads a sort pair of the options", () => {
    expect(parseEvaluationFilters({ orderBy: "cupping_score", orderDirection: "desc" }).sort).toBe(
      "score-desc",
    );
    expect(parseEvaluationFilters({ orderBy: "created_at", orderDirection: "asc" }).sort).toBe(
      "oldest",
    );
  });

  it("returns every value empty and the default sort with no key", () => {
    expect(parseEvaluationFilters(new URLSearchParams())).toEqual({ sort: "default" });
    expect(parseEvaluationFilters({})).toEqual({ sort: "default" });
  });

  it("keeps the first value of a repeated single-value key", () => {
    expect(parseEvaluationFilters(new URLSearchParams("process=washed&process=natural")).process).toBe(
      "washed",
    );
    expect(parseEvaluationFilters({ process: ["washed", "natural"] }).process).toBe("washed");
  });

  it.each(["city", "process"] as const)("drops %s one character over 90", (key) => {
    expect(parseEvaluationFilters({ [key]: "a".repeat(91) })[key]).toBeUndefined();
  });

  it("drops blank text", () => {
    expect(parseEvaluationFilters({ city: "   " }).city).toBeUndefined();
  });

  it("drops status=draft", () => {
    expect(parseEvaluationFilters({ status: "draft" }).status).toBeUndefined();
  });

  it.each(["120", "-1", "abc"])("drops scoreMin=%s", (value) => {
    expect(parseEvaluationFilters({ scoreMin: value }).scoreMin).toBeUndefined();
  });

  it("drops scoreMax=105", () => {
    expect(parseEvaluationFilters({ scoreMax: "105" }).scoreMax).toBeUndefined();
  });

  it("drops both bounds when the minimum is above the maximum", () => {
    const values = parseEvaluationFilters({ scoreMin: "90", scoreMax: "80" });
    expect(values.scoreMin).toBeUndefined();
    expect(values.scoreMax).toBeUndefined();
  });
});

describe("evaluationListQuery (design.md D4)", () => {
  it("sends the default order with no values", () => {
    expect(evaluationListQuery(parseEvaluationFilters({}), 2)).toBe(
      "orderBy=created_at&orderDirection=desc&page=2",
    );
  });

  it("writes the keys in contract order", () => {
    const values = parseEvaluationFilters({
      orderDirection: "desc",
      orderBy: "cupping_score",
      scoreMax: "95",
      scoreMin: "80",
      status: "open",
      process: "washed",
      city: "Barcelona",
    });
    expect(evaluationListQuery(values, 3)).toBe(
      "city=Barcelona&process=washed&status=open&scoreMin=80&scoreMax=95&orderBy=cupping_score&orderDirection=desc&page=3",
    );
  });

  it("writes neither bound for the full range", () => {
    const values = parseEvaluationFilters({ scoreMin: "0", scoreMax: "100" });
    expect(evaluationListQuery(values, 1)).toBe("orderBy=created_at&orderDirection=desc&page=1");
  });

  it("never sends a dropped or unknown key", () => {
    const values = parseEvaluationFilters({ status: "draft", evaluatorId: "x", scoreMin: "120" });
    expect(evaluationListQuery(values, 1)).toBe("orderBy=created_at&orderDirection=desc&page=1");
  });
});

describe("EVALUATION_SORT_OPTIONS (design.md D6)", () => {
  it("lists the five options in order with their pairs", () => {
    expect(EVALUATION_SORT_OPTIONS).toEqual([
      { id: "default", textKey: "sortDefault", orderBy: undefined, orderDirection: undefined },
      { id: "score-desc", textKey: "sortScoreDesc", orderBy: "cupping_score", orderDirection: "desc" },
      { id: "score-asc", textKey: "sortScoreAsc", orderBy: "cupping_score", orderDirection: "asc" },
      { id: "newest", textKey: "sortNewest", orderBy: "created_at", orderDirection: "desc" },
      { id: "oldest", textKey: "sortOldest", orderBy: "created_at", orderDirection: "asc" },
    ]);
  });
});

describe("the public facet set (add-public-evaluations design.md D4, D7)", () => {
  it("parses offeringId trimmed and ignores status", () => {
    expect(parseEvaluationFilters({ offeringId: " 01JOFFERA ", status: "open" }, "public")).toEqual({
      offeringId: "01JOFFERA",
      sort: "default",
    });
    expect(parseEvaluationFilters({ offeringId: "  " }, "public")).toEqual({ sort: "default" });
  });

  it("builds the request with the fixed keys whatever the URL held", () => {
    const values = parseEvaluationFilters(
      { offeringId: "01JOFFERA", status: "open", evaluationType: "baseline", process: "washed", scoreMin: "80" },
      "public",
    );
    expect(publicEvaluationsQuery(values, 2)).toEqual({
      offeringId: "01JOFFERA",
      evaluationType: "specialist",
      process: "washed",
      status: "closed",
      scoreMin: 80,
      orderBy: "created_at",
      orderDirection: "desc",
      page: 2,
    });
  });
});
