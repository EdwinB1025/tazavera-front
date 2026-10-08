import { describe, it, expect } from "vitest";
import { evaluationListQuery, parseEvaluationFilters } from "./query";

/**
 * Evaluation filter state in the URL (design.md D4, D6; spec "Evaluation
 * filter state in the URL", "Evaluation sort").
 */

describe("parseEvaluationFilters (design.md D4)", () => {

  it("falls back to the default sort for an incomplete or unknown pair", () => {
    expect(parseEvaluationFilters({ orderBy: "cupping_score" }).sort).toBe("default");
    expect(parseEvaluationFilters({ orderBy: "status", orderDirection: "asc" }).sort).toBe("default");
  });
});

describe("evaluationListQuery (design.md D4)", () => {

  it("sends no status or score bound for ?status=draft&scoreMin=120&scoreMax=80", () => {
    const values = parseEvaluationFilters(new URLSearchParams("status=draft&scoreMin=120&scoreMax=80"));
    expect(evaluationListQuery(values, 1)).toBe("orderBy=created_at&orderDirection=desc&page=1");
  });
});
