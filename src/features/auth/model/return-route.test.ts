import { describe, it, expect } from "vitest";
import { toAppRoute } from "./return-route";

/**
 * Return-route validation (fix-auth-return-query design.md D2; spec "Return
 * through the callback"): the return destination is path plus query and is
 * opened only when it is a route of the application.
 */
describe("toAppRoute", () => {
  it.each([
    "//evil.example/es",
    "/\\evil.example",
    "/es?next=\\evil.example",
    "/\t/evil.example",
    "/xx/offerings",
    "/es/../evil",
  ])("rejects %j", (route) => {
    expect(toAppRoute(route)).toBeNull();
  });
});
