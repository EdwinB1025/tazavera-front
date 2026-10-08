import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { toDetailTab } from "@/widgets/offering-detail/lib/tab";

/**
 * Detail tabs tests (add-offering-catalog design.md D7; spec "Detail tabs in
 * the address"). The tab value lives in the address: the selected tab comes
 * from the route's `tab` value and a selection pushes `?tab={value}` at the
 * same route. The app router hook is mocked — test infrastructure only.
 */

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
});

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

describe("toDetailTab with the provisional tab (add-public-evaluations D9)", () => {
  it("maps provisional to itself and an unknown value to inventory", () => {
    expect(toDetailTab("provisional")).toBe("provisional");
    expect(toDetailTab("baseline")).toBe("inventory");
  });
});
