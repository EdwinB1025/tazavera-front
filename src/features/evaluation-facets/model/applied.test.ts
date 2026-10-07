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

  it("lists one entry per applied value in facet order", () => {
    const list = applied({ city: "Barcelona", process: "washed", scoreMin: "80", status: "open" });
    expect(list.map((entry) => [entry.facet, entry.value])).toEqual([
      ["Status", "Open"],
      ["Score", "80–100"],
      ["Process", "washed"],
      ["City", "Barcelona"],
    ]);
  });

  it("names status open Open and closed Closed", () => {
    expect(applied({ status: "open" })[0]!.value).toBe("Open");
    expect(applied({ status: "closed" })[0]!.value).toBe("Closed");
  });

  it("shows the score pair as one entry that removes both bounds", () => {
    const list = applied({ scoreMin: "80", scoreMax: "100" });
    expect(list).toHaveLength(1);
    expect(list[0]!.value).toBe("80–100");
    expect(list[0]!.remove).toEqual({ scoreMin: undefined, scoreMax: undefined });
  });

  it("removes only its key for every other entry", () => {
    const list = applied({ status: "closed", process: "washed", city: "Barcelona" });
    expect(list.map((entry) => entry.remove)).toEqual([
      { status: undefined },
      { process: undefined },
      { city: undefined },
    ]);
  });

  it("never lists the sort", () => {
    expect(applied({ orderBy: "cupping_score", orderDirection: "desc" })).toEqual([]);
  });
});
