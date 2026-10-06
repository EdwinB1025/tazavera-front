import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ExploreButton } from "./ExploreButton";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see buttons left by previous renders.
afterEach(() => {
  cleanup();
  document.getElementById("offerings")?.remove();
});

/**
 * ExploreButton tests (design.md D10; the landing spec "Entry page hero" —
 * "Explore scrolls to the offerings"). Written before the implementation
 * (task 6.2): the import fails to resolve until
 * `src/pages/home/ui/ExploreButton.tsx` exists, so the file runs and fails as
 * required.
 *
 * Activation scrolls the `offerings` element into view with
 * `scrollIntoView({ behavior: "smooth", block: "start" })` and pushes no
 * route. The scroll target is a real `#offerings` element (the block's root
 * id, design.md D9) carrying a `scrollIntoView` spy — jsdom implements no
 * scrolling — and the app router hook is mocked so a navigation would show
 * (test infrastructure only, exactly as `Pagination.test.tsx` does).
 */

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
});

const LABEL = "texts.exploreLabel";

/** The offerings list element (design.md D9) carrying a `scrollIntoView` spy. */
function mountOfferingsTarget(): ReturnType<typeof vi.fn> {
  const offerings = document.createElement("div");
  offerings.id = "offerings";
  const scrollIntoView = vi.fn();
  offerings.scrollIntoView = scrollIntoView;
  document.body.appendChild(offerings);
  return scrollIntoView;
}

describe("ExploreButton", () => {
  it("scrolls the offerings element into view on activation (spec: 'Explore scrolls to the offerings')", () => {
    const scrollIntoView = mountOfferingsTarget();
    render(<ExploreButton label={LABEL} />);
    fireEvent.click(screen.getByRole("button", { name: LABEL }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("changes no route when the explore action is activated (spec: 'Explore scrolls to the offerings')", () => {
    mountOfferingsTarget();
    render(<ExploreButton label={LABEL} />);
    fireEvent.click(screen.getByRole("button", { name: LABEL }));
    expect(router.push).not.toHaveBeenCalled();
    expect(router.refresh).not.toHaveBeenCalled();
  });
});
