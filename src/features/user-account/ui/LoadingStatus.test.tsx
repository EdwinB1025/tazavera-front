import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LoadingStatus } from "@/features/user-account";

/**
 * Loading status (design.md D9 and D10): a `role="status"` region holding an
 * `aria-hidden` `Loader2` that spins only without `prefers-reduced-motion`,
 * and the text it receives.
 */

afterEach(() => {
  cleanup();
});

describe("LoadingStatus", () => {
  it("is a status region with its text and a hidden spinner that respects reduced motion", () => {
    render(<LoadingStatus text="fx-loading" />);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("fx-loading");
    const icon = status.querySelector("svg")!;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")).toContain("motion-safe:animate-spin");
    expect(icon.getAttribute("class")).not.toMatch(/(^|\s)animate-spin/);
  });
});
