import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { HomeScreen } from "@/pages/home";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Home screen tests (spec: "Root of a supported locale"; design.md D13 — the
 * home screen has an empty main area until `add-landing` fills it). Written
 * before the screen exists (task 6.4); the import fails to resolve until
 * then, so the file runs and fails as required.
 */
describe("HomeScreen", () => {
  it("fills the main area with no content", () => {
    const { container } = render(<HomeScreen />);
    expect(container.textContent).toBe("");
    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    expect(root!.className).toContain("flex-1");
  });
});
