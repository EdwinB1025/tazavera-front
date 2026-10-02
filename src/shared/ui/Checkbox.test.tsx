import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Checkbox } from "@/shared/ui/Checkbox";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Checkbox control tests (design.md D1.1 own-field contract, D7 modes,
 * D9 mark and hit area; spec "Checkbox"). Written before the component is
 * implemented (task 6.2); the import of `Checkbox` fails to resolve until
 * then, so the file runs and fails as required.
 *
 * Assertions are className-/attribute-based: jsdom has no CSS engine, so the
 * 24×24px hit area and the custom box are verified through their exact class
 * sets and the contract by the exact attributes. The checkbox is its own
 * field: every test here renders it with NO Field around it.
 */

const BOX_TOKENS = [
  "size-4",
  "appearance-none",
  "rounded-check",
  "border-2",
  "border-border-strong",
  "checked:bg-surface-checked",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
];

describe("Checkbox", () => {
  describe("box and mark (spec: Checked state identification, design.md D9)", () => {
    it("renders the exact input tokens with a custom box replacing the native control", () => {
      render(<Checkbox label="Accept terms" />);
      const input = screen.getByRole("checkbox", { name: "Accept terms" });
      for (const token of BOX_TOKENS) {
        expect(input.className).toContain(token);
      }
    });

    it("renders the check mark always, shown through peer-checked and following the input's real state (Unplanned fix)", () => {
      const { container } = render(
        <form>
          <Checkbox label="Accept terms" />
        </form>,
      );
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      const mark = container.querySelector("svg")!;
      // SVG elements expose className as SVGAnimatedString: read the attribute.
      expect(mark.getAttribute("class")).toContain("text-checked-mark");
      expect(mark.getAttribute("class")).toContain("invisible");
      expect(mark.getAttribute("class")).toContain("peer-checked:visible");
      expect(input.className).toContain("peer");

      // The mark follows the input's real state through CSS, not React state:
      // after form.reset() the choice is gone and the same class contract
      // hides the mark.
      fireEvent.click(input);
      expect(input.checked).toBe(true);
      (container.querySelector("form") as HTMLFormElement).reset();
      expect(input.checked).toBe(false);
      expect(mark.getAttribute("class")).toContain("invisible");
      expect(mark.getAttribute("class")).toContain("peer-checked:visible");
    });

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

    it("swaps the border to the error treatment when invalid (design.md D9)", () => {
      render(<Checkbox label="Accept terms" error="Accept to continue" />);
      const input = screen.getByRole("checkbox", { name: "Accept terms" });
      expect(input.className).toContain("border-feedback-error");
      expect(input.className).not.toContain("border-border-strong");
    });
  });

  describe("label click target (spec: Label click target, design.md D9)", () => {
    it("labels the checkbox with flex min-h-6 min-w-6 items-center gap-2", () => {
      render(<Checkbox label="Accept terms" />);
      const label = screen.getByText("Accept terms").closest("label")!;
      expect(label.className).toContain("flex");
      expect(label.className).toContain("min-h-6");
      expect(label.className).toContain("min-w-6");
      expect(label.className).toContain("items-center");
      expect(label.className).toContain("gap-2");
    });

    it("clicking the label text toggles the choice", () => {
      const onChange = vi.fn();
      render(<Checkbox label="Accept terms" defaultChecked={false} onChange={onChange} />);
      fireEvent.click(screen.getByText("Accept terms"));
      expect(onChange).toHaveBeenCalledTimes(1);
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      expect(input.checked).toBe(true);
    });
  });

  describe("own-field contract (design.md D1.1, spec: Help and error, Error state, Required)", () => {
    it("renders help and error below in type-meta and type-error and wires them to the input, help first", () => {
      const { container } = render(
        <Checkbox
          label="Accept terms"
          help="You can undo this later"
          error="Accept to continue"
        />,
      );
      const root = container.firstElementChild!;
      const help = screen.getByText("You can undo this later");
      const error = screen.getByText("Accept to continue");
      expect(help.className).toContain("type-meta");
      expect(error.className).toContain("type-error");
      expect(root.lastElementChild).toBe(error);

      const input = screen.getByRole("checkbox");
      expect(input.getAttribute("aria-describedby")).toBe(`${help.id} ${error.id}`);
      expect(input.getAttribute("aria-invalid")).toBe("true");
    });

    it("omits aria-describedby when neither help nor error exists and aria-invalid when no error is shown", () => {
      render(<Checkbox label="Accept terms" />);
      const input = screen.getByRole("checkbox");
      expect(input.hasAttribute("aria-describedby")).toBe(false);
      expect(input.hasAttribute("aria-invalid")).toBe(false);
    });

    it("marks the input required when required", () => {
      render(<Checkbox label="Accept terms" required />);
      expect(screen.getByRole("checkbox").hasAttribute("required")).toBe(true);
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

  describe("inverse variant (design.md D2, D4, spec: Checked controls on dark surface)", () => {
    it("adds variant-inverse with fill and mark unchanged", () => {
      const { container } = render(
        <Checkbox label="Accept terms" defaultChecked variant="inverse" />,
      );
      const root = container.firstElementChild!;
      const input = screen.getByRole("checkbox");
      expect(root.className).toContain("variant-inverse");
      expect(input.className).toContain("checked:bg-surface-checked");
      expect(container.querySelector("svg")!.getAttribute("class")).toContain(
        "text-checked-mark",
      );
    });
  });
});

/** The margin utilities of an element (design.md D10 pins them exactly). */
function margins(element: Element): string[] {
  return element.className
    .split(/\s+/)
    .filter((token) => /^m[trblxyse]?-/.test(token));
}
