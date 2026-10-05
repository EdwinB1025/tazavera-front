import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { OfferingSkeletonCard } from "./OfferingSkeletonCard";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests.
afterEach(() => {
  cleanup();
});

/**
 * Skeleton card tests (the landing spec "Loading"; design.md D9). Written
 * before the implementation (task 5.2): the import fails to resolve until
 * `src/widgets/offering-list/ui/OfferingSkeletonCard.tsx` exists, so the file
 * runs and fails as required.
 *
 * The skeleton is the loading placeholder in the list's place — the home
 * screen renders several of these as the `Suspense` fallback around
 * `VerifiedOfferings` (design.md D9, D10). It renders shapes only: placeholder
 * bars carrying `animate-pulse` on a card-shaped root (the build's classes,
 * asserted here as its choice), with no text at all, so neither the empty nor
 * the error message can render (spec: "Loading").
 */

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/** Every element below `root` that carries the given class token. */
function elementsWith(root: HTMLElement, token: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("*")).filter((el) =>
    classTokens(el).includes(token),
  );
}

describe("OfferingSkeletonCard", () => {
  it("renders card-shaped placeholders with no empty or error message (spec: Loading)", () => {
    const { container } = render(<OfferingSkeletonCard />);
    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    // The placeholder stands in the list's place as a card (spec: "Loading").
    expect(classTokens(root!).includes("bg-surface-card")).toBe(true);

    const placeholders = elementsWith(container, "animate-pulse");
    expect(placeholders.length).toBeGreaterThan(0);
    for (const placeholder of placeholders) {
      expect(placeholder.textContent).toBe("");
    }
    // Shapes only, so neither the empty nor the error message renders.
    expect(container.textContent).toBe("");
  });
});
