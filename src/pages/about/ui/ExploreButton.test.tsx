import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ExploreButton } from "@/pages/about";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see buttons left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * ExploreButton tests (design.md D10; the landing spec "About us page" —
 * "Closing action"). Written before the implementation (task 7.2): the import
 * fails to resolve until `src/pages/about/index.ts` (the about screen's public
 * API) and `ExploreButton.tsx` exist, so the file runs and fails as required.
 *
 * The closing action is the primary Button of the about page whose activation
 * opens the entry page of the active locale through the app router
 * (`useRouter().push(\`/${locale}\`)`, design.md D10). The app router hook is
 * mocked so the pushed target shows (test infrastructure only, exactly as
 * `src/pages/home/ui/ExploreButton.test.tsx` does).
 */

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
});

// The label arrives as a prop (design.md D11); the sentinel would not render
// if the component carried literal text of its own.
const LABEL = "texts.closingLabel";

describe("ExploreButton", () => {
  it("pushes /{locale} through useRouter when the closing action is activated (spec: 'Closing action'; design.md D10)", () => {
    // A locale whose value differs from any hardcoded route: the target must
    // be built from the `locale` prop.
    render(<ExploreButton locale="ca" label={LABEL} />);
    fireEvent.click(screen.getByRole("button", { name: LABEL }));
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith("/ca");
  });
});
