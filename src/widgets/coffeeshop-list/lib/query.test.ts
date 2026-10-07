import { describe, it, expect } from "vitest";
import { buildCoffeeshopsQuery } from "./query";

/**
 * Directory query pass-through (add-coffeeshop-directory design.md D4; spec
 * "Directory query pass-through").
 */
describe("buildCoffeeshopsQuery", () => {
  it("keeps the contract names with their values (spec: Contract names kept)", () => {
    expect(
      buildCoffeeshopsQuery({ name: "nomad", postalCode: "08012", orderDirection: "desc", page: "2" }),
    ).toEqual({ name: "nomad", postalCode: "08012", orderDirection: "desc", page: "2" });
  });

  it("drops the view, focus and unknown keys (spec: Directory keys not sent)", () => {
    expect(
      buildCoffeeshopsQuery({ city: "Barcelona", view: "map", focus: "01SHOP", foo: "1" }),
    ).toEqual({ city: "Barcelona" });
  });
});
