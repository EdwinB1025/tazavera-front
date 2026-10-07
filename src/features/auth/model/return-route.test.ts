import { describe, it, expect } from "vitest";
import { toAppRoute } from "./return-route";

/**
 * Return-route validation (fix-auth-return-query design.md D2; spec "Return
 * through the callback"): the return destination is path plus query and is
 * opened only when it is a route of the application.
 */
describe("toAppRoute", () => {
  it.each([
    "/es",
    "/en/offerings",
    "/es/manage/evaluations/new?offering=01J0",
    "/ca/offerings?tab=evaluations&page=2",
    "/es/offerings?next=https://evil.example",
  ])("keeps the application route %s unchanged", (route) => {
    expect(toAppRoute(route)).toBe(route);
  });

  it("resolves dot segments before checking the prefix", () => {
    expect(toAppRoute("/es/x/../offerings")).toBe("/es/offerings");
  });

  it.each([
    undefined,
    "",
    "https://evil.example/es",
    "//evil.example/es",
    "/\\evil.example",
    "/es?next=\\evil.example",
    "/es\\offerings",
    "/\t/evil.example",
    "/es/offerings#top",
    "es/offerings",
    "/xx/offerings",
    "/callback",
    "/es/../evil",
    "/es/..//evil.example",
  ])("rejects %j", (route) => {
    expect(toAppRoute(route)).toBeNull();
  });
});
