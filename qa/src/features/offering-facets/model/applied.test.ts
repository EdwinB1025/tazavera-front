import { describe, it, expect } from "vitest";
import { appliedOfferingFilters, type AppliedOfferingTexts } from "@/features/offering-facets/model/applied";
import { parseOfferingFilters } from "@/features/offering-facets/model/query";
import type { TasteNoteOption } from "@/features/offering-facets/model/options";

/** Applied offering filters (design.md D5; spec "Applied offering filters"). */

const TEXTS: AppliedOfferingTexts = {
  coffeeName: "Coffee",
  verification: "Verification",
  verified: "Verified",
  provisional: "Provisional",
  averageScore: "Average score",
  scoreRange: "{min}–{max}",
  tasteNotes: "Taste notes",
  originCountry: "Origin country",
  originRegion: "Origin region",
  process: "Process",
  variety: "Variety",
  producer: "Producer",
  roastery: "Roastery",
  city: "City",
};

const TASTE_NOTES: TasteNoteOption[] = [
  { value: "F", label: "Fruity", children: [{ value: "B", label: "Berry" }] },
  { value: "N", label: "Nutty", children: [] },
];

const context = { tasteNotes: TASTE_NOTES, texts: TEXTS };

function applied(
  query: Record<string, string | string[]>,
  tasteNotes: TasteNoteOption[] | null = TASTE_NOTES,
) {
  return appliedOfferingFilters(parseOfferingFilters(query), { tasteNotes, texts: TEXTS });
}

describe("appliedOfferingFilters (design.md D5)", () => {
  it("is empty with no value", () => {
    expect(appliedOfferingFilters(parseOfferingFilters({}), context)).toEqual([]);
  });

  it("lists one entry per applied value in facet order, each with a distinct id", () => {
    const list = applied({
      city: "Lima",
      roasteryName: "Nómada",
      producer: "Bensa",
      variety: "Caturra",
      process: "washed",
      originRegion: "Huila",
      originCountry: "Colombia",
      cataRef: ["B", "F"],
      cuppingAvgMin: "60",
      verified: "1",
      coffeeName: "Huila",
    });
    expect(list.map((entry) => [entry.facet, entry.value])).toEqual([
      ["Coffee", "Huila"],
      ["Verification", "Verified"],
      ["Average score", "60–100"],
      ["Taste notes", "Berry"],
      ["Taste notes", "Fruity"],
      ["Origin country", "Colombia"],
      ["Origin region", "Huila"],
      ["Process", "washed"],
      ["Variety", "Caturra"],
      ["Producer", "Bensa"],
      ["Roastery", "Nómada"],
      ["City", "Lima"],
    ]);
    expect(new Set(list.map((entry) => entry.id)).size).toBe(list.length);
  });

  it("names verified 1 Verified and 0 Provisional", () => {
    expect(applied({ verified: "1" })[0]!.value).toBe("Verified");
    expect(applied({ verified: "0" })[0]!.value).toBe("Provisional");
  });

  it("shows the score pair as one entry that removes both bounds", () => {
    const list = applied({ cuppingAvgMin: "60", cuppingAvgMax: "90" });
    expect(list).toHaveLength(1);
    expect(list[0]!.value).toBe("60–90");
    expect(list[0]!.remove).toEqual({ cuppingAvgMin: undefined, cuppingAvgMax: undefined });
  });

  it("names a listed taste note and removes only its own value", () => {
    const list = applied({ cataRef: ["F", "B", "N"] });
    expect(list.map((entry) => entry.value)).toEqual(["Fruity", "Berry", "Nutty"]);
    expect(list[1]!.remove).toEqual({ cataRef: ["F", "N"] });
  });

  it("gives no entry for an unlisted cataRef and keeps it out of the others' remove", () => {
    const list = applied({ cataRef: ["X", "F"] });
    expect(list.map((entry) => entry.value)).toEqual(["Fruity"]);
    expect(list[0]!.remove).toEqual({ cataRef: ["X"] });
  });

  it("gives no cataRef entry when the taste notes are unavailable", () => {
    expect(applied({ cataRef: ["F"] }, null)).toEqual([]);
  });

  it("removes only its key for every other entry", () => {
    const list = applied({ process: "washed", city: "Lima", verified: "0", coffeeName: "Huila" });
    expect(list.map((entry) => entry.remove)).toEqual([
      { coffeeName: undefined },
      { verified: undefined },
      { process: undefined },
      { city: undefined },
    ]);
  });

  it("never lists the sort", () => {
    expect(applied({ orderBy: "cupping_avg", orderDirection: "desc" })).toEqual([]);
  });
});
