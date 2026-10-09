import { describe, expect, it } from "vitest";
import { splitFieldErrors, toFieldErrors } from "./validation";

describe("Server validation errors", () => {
  it("A 422 maps to its fields", () => {
    const body = {
      message: "m",
      errors: { email: ["e1", "e2"], postal_code: ["p1"], role: ["r1"] },
    };
    expect(
      splitFieldErrors(toFieldErrors(body), ["email", "postalCode"], { postal_code: "postalCode" }),
    ).toEqual({ fields: { email: "e1", postalCode: "p1" }, unmatched: true });
  });
});
