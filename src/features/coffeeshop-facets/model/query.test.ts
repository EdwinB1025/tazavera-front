import { describe, it, expect } from "vitest";
import { parseCoffeeshopFilters, sanitizeCoffeeshopQuery } from "./query";

/**
 * Coffee shop filter state (add-coffeeshop-directory design.md D4; specs
 * "Coffee shop filter state in the URL" and "Coffee shop sort").
 */
describe("coffee shop query", () => {
  it("drops out-of-range values from the request and the facets (spec: Out-of-range value in the address)", () => {
    const query = { postalCode: "0801234567890", verified: "0", city: "Barcelona" };
    expect(sanitizeCoffeeshopQuery(query)).toEqual({ city: "Barcelona" });
    const values = parseCoffeeshopFilters(new URLSearchParams(query));
    expect(values.postalCode).toBeUndefined();
    expect(values.verified).toBeUndefined();
  });

  it("defaults to A–Z and sends no order keys (spec: Default order)", () => {
    expect(parseCoffeeshopFilters(new URLSearchParams("")).sort).toBe("name-asc");
    expect(sanitizeCoffeeshopQuery({ page: "2" })).toEqual({ page: "2" });
  });

  it("drops an order the directory does not offer (spec: Unknown order in the address)", () => {
    const query = { orderBy: "created_at", orderDirection: "desc" };
    expect(sanitizeCoffeeshopQuery(query)).toEqual({});
    expect(parseCoffeeshopFilters(new URLSearchParams(query)).sort).toBe("name-asc");
  });
});
