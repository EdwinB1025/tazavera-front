import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ScoreRangeFacet, type ScoreRange } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

// jsdom has no ResizeObserver; Radix Slider measures its thumbs with one.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
});

/**
 * Score range facet (spec filtering "Score range facet"; design.md D8): a
 * two-thumb slider and "From" / "To" inputs kept in sync, clamped with no
 * error message.
 */

const TEXTS = {
  minThumb: "Minimum score",
  maxThumb: "Maximum score",
  from: "From",
  to: "To",
};

function facet(value: ScoreRange, onCommit: (range: ScoreRange) => void = () => {}) {
  return (
    <ScoreRangeFacet legend="Score" min={0} max={100} value={value} onCommit={onCommit} texts={TEXTS} />
  );
}

function input(name: string): HTMLInputElement {
  return screen.getByRole("spinbutton", { name }) as HTMLInputElement;
}

describe("ScoreRangeFacet", () => {
  it("emptying From and blurring with 20–50 shows 0 and commits 0–50", () => {
    const onCommit = vi.fn();
    render(facet([20, 50], onCommit));
    fireEvent.change(input("From"), { target: { value: "" } });
    fireEvent.blur(input("From"));
    expect(input("From").value).toBe("0");
    expect(onCommit).toHaveBeenCalledWith([0, 50]);
  });

  it("a new value prop updates both inputs and thumbs", () => {
    const { rerender } = render(facet([0, 100]));
    rerender(facet([30, 70]));
    expect(input("From").value).toBe("30");
    expect(input("To").value).toBe("70");
    expect(screen.getByRole("slider", { name: "Minimum score" }).getAttribute("aria-valuenow")).toBe(
      "30",
    );
    expect(screen.getByRole("slider", { name: "Maximum score" }).getAttribute("aria-valuenow")).toBe(
      "70",
    );
  });
});
