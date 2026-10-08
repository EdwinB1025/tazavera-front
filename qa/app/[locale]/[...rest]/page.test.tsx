import { describe, it, expect, vi } from "vitest";

// notFound() is the behaviour under test; it is replaced by a spy so the
// call can be observed without Next's runtime. Test infrastructure only.
const { notFound } = vi.hoisted(() => ({ notFound: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound }));

/**
 * The children-slot catch-all of the locale (design.md D7): an unknown path
 * under a locale reaches the not-found boundary on soft navigation too.
 */
describe("app/[locale]/[...rest]/page.tsx (design.md D7)", () => {
  it("calls Next's notFound() when its default export runs", async () => {
    const { default: LocaleCatchAllPage } = await import("../../../../app/[locale]/[...rest]/page");
    LocaleCatchAllPage();
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
