import { describe, it, expect, vi } from "vitest";

// notFound() is the behaviour under test; it is replaced by a spy so the
// call can be observed without Next's runtime. Test infrastructure only.
const { notFound } = vi.hoisted(() => ({ notFound: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound }));

/**
 * The locale default route file (design.md D2): an unknown route under a
 * locale stays not found.
 */
describe("app/[locale]/default.tsx (design.md D2)", () => {
  it("calls Next's notFound() when its default export runs", async () => {
    const { default: LocaleDefault } = await import("./default");
    LocaleDefault();
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
