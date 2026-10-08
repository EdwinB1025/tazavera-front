import { describe, it, expect } from "vitest";
import { buildOfferingsQuery } from "./query";

/**
 * Catalog query pass-through (add-offering-catalog design.md D1; spec
 * "Catalog query pass-through"). Only the 41 names the contract declares for
 * `listOfferings`, plus `page`, are kept; repeated values stay repeated and
 * every other key is dropped.
 */

/** The 41 query names of `listOfferings` in `contracts/openapi.yaml`. */
const CONTRACT_NAMES = [
  "coffeeName",
  "roasteryName",
  "originCountry",
  "originRegion",
  "process",
  "producer",
  "variety",
  "city",
  "coffeeshopUlid",
  "locationUlid",
  "verified",
  "cuppingAvgMin",
  "cuppingAvgMax",
  "evaluationCountMin",
  "evaluationCountMax",
  "defectiveCountMin",
  "defectiveCountMax",
  "fragranceMin",
  "fragranceMax",
  "aromaMin",
  "aromaMax",
  "flavorMin",
  "flavorMax",
  "aftertasteMin",
  "aftertasteMax",
  "acidityMin",
  "acidityMax",
  "sweetnessMin",
  "sweetnessMax",
  "mouthfeelMin",
  "mouthfeelMax",
  "overallMin",
  "overallMax",
  "cataRef",
  "fragranceCata",
  "aromaCata",
  "flavorCata",
  "aftertasteCata",
  "mouthfeelCata",
  "orderBy",
  "orderDirection",
];

describe("buildOfferingsQuery (design.md D1)", () => {
  it("keeps every name the contract declares for listOfferings plus page", () => {
    expect(CONTRACT_NAMES).toHaveLength(41);
    const searchParams = Object.fromEntries(
      [...CONTRACT_NAMES, "page"].map((name) => [name, `${name}-value`]),
    );
    expect(buildOfferingsQuery(searchParams)).toEqual(searchParams);
  });

  it("drops a key the contract does not declare and keeps the rest", () => {
    expect(
      buildOfferingsQuery({
        foo: "1",
        verified: "1",
        orderBy: "cupping_avg",
        page: "2",
      }),
    ).toEqual({ verified: "1", orderBy: "cupping_avg", page: "2" });
  });
});
