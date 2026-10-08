import { describe, it, expect } from "vitest";
import { buildOfferingsQuery } from "@/widgets/offering-list/lib/query";

describe("buildOfferingsQuery (design.md D1)", () => {
  it("keeps every value of a repeated key", () => {
    expect(
      buildOfferingsQuery({ cataRef: ["01JREFA", "01JREFB"], verified: "1" }),
    ).toEqual({ cataRef: ["01JREFA", "01JREFB"], verified: "1" });
  });

  it("returns an empty record for an empty query", () => {
    expect(buildOfferingsQuery({})).toEqual({});
  });
});
