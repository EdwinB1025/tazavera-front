import { describe, it, expect } from "vitest";
import { distinctCoffeeValues, type CoffeeSummary } from "@/shared/api";

describe("distinctCoffeeValues (spec: Offering facet options)", () => {
  it("removes duplicates, null and empty values and sorts alphabetically", () => {
    const coffees = [
      { process: "washed" },
      { process: "natural" },
      { process: "washed" },
      { process: "" },
      { process: null },
      {},
      { process: "Anaerobic" },
    ] as CoffeeSummary[];
    expect(distinctCoffeeValues(coffees, "process")).toEqual(["Anaerobic", "natural", "washed"]);
  });
});
