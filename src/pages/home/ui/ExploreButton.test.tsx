import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ExploreButton } from "./ExploreButton";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see links left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * ExploreButton tests (open-directory-from-hero design.md D2; the landing
 * spec "Entry page hero" — "Explore scrolls to the offerings", a name kept
 * because a MODIFIED block cannot drop a scenario). The hero's explore action
 * is a link to the coffee shop directory of the active locale.
 */

const LABEL = "texts.exploreLabel";

describe("ExploreButton", () => {
  it("is a link to the coffee shop directory of the active locale (spec: 'Explore scrolls to the offerings')", () => {
    render(<ExploreButton label={LABEL} locale="es" />);
    expect(screen.getByRole("link", { name: LABEL }).getAttribute("href")).toBe("/es/coffeeshops");
  });
});
