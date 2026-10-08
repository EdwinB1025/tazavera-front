import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
  it('type="search" renders a searchbox', () => {
    render(
      <FacetTextField label="Coffee" type="search" value="" onCommit={() => {}} maxLength={90} />,
    );
    expect(screen.getByRole("searchbox", { name: "Coffee" })).toBeTruthy();
  });

  it("a new value prop replaces the shown text", () => {
    const { rerender } = render(
      <FacetTextField label="Region" value="Huila" onCommit={() => {}} maxLength={90} />,
    );
    const input = screen.getByRole("textbox", { name: "Region" }) as HTMLInputElement;
    expect(input.value).toBe("Huila");
    rerender(<FacetTextField label="Region" value="Nariño" onCommit={() => {}} maxLength={90} />);
    expect(input.value).toBe("Nariño");
  });

  it("disabled with help disables the input and shows the help", () => {
    render(
      <FacetTextField
        label="Region"
        value=""
        onCommit={() => {}}
        maxLength={90}
        disabled
        help="Options unavailable"
      />,
    );
    const input = screen.getByRole("textbox", { name: "Region" }) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(screen.getByText("Options unavailable")).toBeTruthy();
  });
});
