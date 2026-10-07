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
  it("is a group named by its legend with two named sliders", () => {
    render(facet([0, 100]));
    expect(screen.getByRole("group", { name: "Score" })).toBeTruthy();
    const min = screen.getByRole("slider", { name: "Minimum score" });
    const max = screen.getByRole("slider", { name: "Maximum score" });
    expect(min.getAttribute("aria-valuenow")).toBe("0");
    expect(max.getAttribute("aria-valuenow")).toBe("100");
  });

  it("ArrowRight on the minimum thumb commits 1–100 and the From input shows 1", () => {
    const onCommit = vi.fn();
    render(facet([0, 100], onCommit));
    const min = screen.getByRole("slider", { name: "Minimum score" });
    min.focus();
    fireEvent.keyDown(min, { key: "ArrowRight" });
    expect(onCommit).toHaveBeenCalledWith([1, 100]);
    expect(input("From").value).toBe("1");
  });

  it("typing 60 in From and Enter commits 60–100 once and moves the thumb", () => {
    const onCommit = vi.fn();
    render(facet([0, 100], onCommit));
    fireEvent.change(input("From"), { target: { value: "60" } });
    fireEvent.keyDown(input("From"), { key: "Enter" });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith([60, 100]);
    expect(screen.getByRole("slider", { name: "Minimum score" }).getAttribute("aria-valuenow")).toBe(
      "60",
    );
  });

  it("typing 140 in To and blurring shows 100 and commits nothing", () => {
    const onCommit = vi.fn();
    render(facet([0, 100], onCommit));
    fireEvent.change(input("To"), { target: { value: "140" } });
    fireEvent.blur(input("To"));
    expect(input("To").value).toBe("100");
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("typing 80 in From with 20–50 shows 50 and commits 50–50", () => {
    const onCommit = vi.fn();
    render(facet([20, 50], onCommit));
    fireEvent.change(input("From"), { target: { value: "80" } });
    fireEvent.keyDown(input("From"), { key: "Enter" });
    expect(input("From").value).toBe("50");
    expect(onCommit).toHaveBeenCalledWith([50, 50]);
  });

  it("emptying From and blurring with 20–50 shows 0 and commits 0–50", () => {
    const onCommit = vi.fn();
    render(facet([20, 50], onCommit));
    fireEvent.change(input("From"), { target: { value: "" } });
    fireEvent.blur(input("From"));
    expect(input("From").value).toBe("0");
    expect(onCommit).toHaveBeenCalledWith([0, 50]);
  });

  it("renders no error message", () => {
    render(facet([20, 50]));
    fireEvent.change(input("To"), { target: { value: "140" } });
    fireEvent.blur(input("To"));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.querySelector(".type-error")).toBeNull();
    expect(input("To").getAttribute("aria-invalid")).toBeNull();
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
