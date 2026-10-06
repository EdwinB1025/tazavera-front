import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FacetPanel, type AppliedFilter } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Facet panel (spec filtering "Facet panel", "Applied-filter chips";
 * design.md D4): search region named by its title, chips block with
 * "Clear all", no native submit, focus after removal.
 */

const TEXTS = { clearAll: "Clear all", removeFilter: "Remove filter: {facet}: {value}" };

const A: AppliedFilter = { id: "process", facet: "Process", value: "Washed" };
const B: AppliedFilter = { id: "origin", facet: "Origin", value: "Huila" };
const C: AppliedFilter = { id: "variety", facet: "Variety", value: "Geisha" };

function panel(applied: AppliedFilter[], handlers: { onRemove?: (id: string) => void; onClearAll?: () => void } = {}) {
  return (
    <FacetPanel
      title="Filters"
      applied={applied}
      onRemove={handlers.onRemove ?? (() => {})}
      onClearAll={handlers.onClearAll ?? (() => {})}
      texts={TEXTS}
    >
      <input aria-label="Origin" />
    </FacetPanel>
  );
}

describe("FacetPanel", () => {
  it("is a form with role search named by the title", () => {
    render(panel([]));
    const region = screen.getByRole("search", { name: "Filters" });
    expect(region.tagName).toBe("FORM");
  });

  it("renders no chip and no Clear all with nothing applied", () => {
    render(panel([]));
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryByText("Clear all")).toBeNull();
  });

  it("renders one named chip per applied value and Clear all", () => {
    const onRemove = vi.fn();
    const onClearAll = vi.fn();
    render(panel([A, B], { onRemove, onClearAll }));
    const washed = screen.getByRole("button", { name: "Remove filter: Process: Washed" });
    const huila = screen.getByRole("button", { name: "Remove filter: Origin: Huila" });
    expect(washed.textContent).toBe("Washed");
    expect(huila.textContent).toBe("Huila");
    fireEvent.click(washed);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("process");
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("Enter in a child input does not trigger a native submit", () => {
    render(panel([]));
    const form = screen.getByRole("search", { name: "Filters" });
    let prevented: boolean | undefined;
    form.addEventListener("submit", (event) => {
      prevented = event.defaultPrevented;
    });
    fireEvent.submit(screen.getByRole("textbox", { name: "Origin" }));
    expect(prevented).toBe(true);
  });

  it("after removing the first of three chips, the first remaining chip has focus", () => {
    const { rerender } = render(panel([A, B, C]));
    fireEvent.click(screen.getByRole("button", { name: "Remove filter: Process: Washed" }));
    rerender(panel([B, C]));
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Remove filter: Origin: Huila" }),
    );
  });

  it("after removing the last of two chips, the remaining chip has focus", () => {
    const { rerender } = render(panel([A, B]));
    fireEvent.click(screen.getByRole("button", { name: "Remove filter: Origin: Huila" }));
    rerender(panel([A]));
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Remove filter: Process: Washed" }),
    );
  });

  it("after removing the only chip, the title has focus", () => {
    const { rerender } = render(panel([A]));
    fireEvent.click(screen.getByRole("button", { name: "Remove filter: Process: Washed" }));
    rerender(panel([]));
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Filters" }));
  });

  it("after Clear all, the title has focus", () => {
    const { rerender } = render(panel([A, B]));
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    rerender(panel([]));
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Filters" }));
  });
});
