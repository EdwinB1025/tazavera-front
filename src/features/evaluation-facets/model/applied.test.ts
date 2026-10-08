import { describe, it, expect } from "vitest";
import { appliedEvaluationFilters, type AppliedEvaluationTexts } from "./applied";
import { parseEvaluationFilters } from "./query";

/** Applied evaluation filters (design.md D5; spec "Applied evaluation filters"). */

const TEXTS: AppliedEvaluationTexts = {
  status: "Status",
  statusOpen: "Open",
  statusClosed: "Closed",
  score: "Score",
  scoreRange: "{min}–{max}",
  process: "Process",
  city: "City",
};

function applied(query: Record<string, string>) {
  return appliedEvaluationFilters(parseEvaluationFilters(query), TEXTS);
}

describe("appliedEvaluationFilters (design.md D5)", () => {
  it("is empty with no value", () => {
    expect(applied({})).toEqual([]);
  });
});
