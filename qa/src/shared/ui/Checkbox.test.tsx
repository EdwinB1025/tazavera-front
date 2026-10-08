import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Checkbox } from "@/shared/ui/Checkbox";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

describe("Checkbox", () => {
  describe("box and mark (spec: Checked state identification, design.md D9)", () => {
    it("fades the mark when checked and disabled (peer-disabled:opacity-50) (Unplanned fix)", () => {
      const { container } = render(
        <Checkbox label="Accept terms" defaultChecked disabled />,
      );
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      expect(input.checked).toBe(true);
      expect(container.querySelector("svg")!.getAttribute("class")).toContain(
        "peer-disabled:opacity-50",
      );
    });
  });

  describe("own-field contract (design.md D1.1, spec: Help and error, Error state, Required)", () => {
    it("omits aria-describedby when neither help nor error exists and aria-invalid when no error is shown", () => {
      render(<Checkbox label="Accept terms" />);
      const input = screen.getByRole("checkbox");
      expect(input.hasAttribute("aria-describedby")).toBe(false);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
    });

    it('treats an empty string as no message (Unplanned fix)', () => {
      const { container } = render(
        <Checkbox label="Accept terms" help="" error="" />,
      );
      expect(container.querySelector("p")).toBeNull();
      const input = screen.getByRole("checkbox");
      expect(input.hasAttribute("aria-describedby")).toBe(false);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
    });
  });

  describe("spacing (design.md D10, correction 2)", () => {
    it("gives the help text and the error message exactly mt-1", () => {
      render(
        <Checkbox
          label="Accept terms"
          help="You can undo this later"
          error="Accept to continue"
        />,
      );
      expect(margins(screen.getByText("You can undo this later"))).toEqual([
        "mt-1",
      ]);
      expect(margins(screen.getByText("Accept to continue"))).toEqual(["mt-1"]);
    });
  });

  describe("value modes (design.md D7)", () => {
    it("controlled mode: checked and onChange drive the choice", () => {
      const onChange = vi.fn();
      render(<Checkbox label="Accept terms" checked={false} onChange={onChange} />);
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      fireEvent.click(input);
      expect(onChange).toHaveBeenCalledTimes(1);
      // Controlled: without a state update the choice stays the prop's.
      expect(input.checked).toBe(false);
    });

    it("uncontrolled mode: defaultChecked sets the initial choice and clicks toggle it", () => {
      render(<Checkbox label="Accept terms" defaultChecked />);
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      expect(input.checked).toBe(true);
      fireEvent.click(input);
      expect(input.checked).toBe(false);
    });
  });

  describe("disabled (spec: Disabled)", () => {
    it("rejects toggling", () => {
      const onChange = vi.fn();
      render(
        <Checkbox label="Accept terms" defaultChecked={false} disabled onChange={onChange} />,
      );
      fireEvent.click(screen.getByText("Accept terms"));
      expect(onChange).not.toHaveBeenCalled();
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      expect(input.checked).toBe(false);
    });
  });
});

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

describe("Checkbox facet-row presentation (add-facet-controls design.md D3)", () => {
  it("disabled row is faded with no hover look", () => {
    render(
      <Checkbox label="Washed" presentation="row" checked={false} disabled onChange={() => {}} />,
    );
    const row = screen.getByText("Washed").closest("label")!;
    expect(classesOf(row)).toEqual(
      expect.arrayContaining(["cursor-not-allowed", "opacity-50"]),
    );
    expect(classesOf(row)).not.toContain("hover:shadow-nav-hover");
    expect(classesOf(screen.getByText("Washed"))).not.toContain("group-hover:font-bold");
  });
});

/** The margin utilities of an element (design.md D10 pins them exactly). */
function margins(element: Element): string[] {
  return element.className
    .split(/\s+/)
    .filter((token) => /^m[trblxyse]?-/.test(token));
}
