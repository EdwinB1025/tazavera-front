import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FacetTextField } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Text facet (spec filtering "Text facet", "Facet option data unavailable";
 * design.md D5): commits the trimmed draft on Enter or on blur when it
 * differs from the value it is given.
 */

describe("FacetTextField", () => {
  it("typing a padded value and Enter commits it trimmed once", () => {
    const onCommit = vi.fn();
    render(<FacetTextField label="Region" value="" onCommit={onCommit} maxLength={90} />);
    const input = screen.getByRole("textbox", { name: "Region" });
    fireEvent.change(input, { target: { value: " Huila " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("Huila");
  });

  it("changing and blurring commits once", () => {
    const onCommit = vi.fn();
    render(<FacetTextField label="Region" value="" onCommit={onCommit} maxLength={90} />);
    const input = screen.getByRole("textbox", { name: "Region" });
    fireEvent.change(input, { target: { value: "Huila" } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("Huila");
  });

  it("blurring unchanged commits nothing", () => {
    const onCommit = vi.fn();
    render(<FacetTextField label="Region" value="Huila" onCommit={onCommit} maxLength={90} />);
    fireEvent.blur(screen.getByRole("textbox", { name: "Region" }));
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("emptying and Enter commits the empty value", () => {
    const onCommit = vi.fn();
    render(<FacetTextField label="Region" value="Huila" onCommit={onCommit} maxLength={90} />);
    const input = screen.getByRole("textbox", { name: "Region" });
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("");
  });

  it("puts maxLength on the input", () => {
    render(<FacetTextField label="Region" value="" onCommit={() => {}} maxLength={90} />);
    expect(screen.getByRole("textbox", { name: "Region" }).getAttribute("maxlength")).toBe("90");
  });
});
