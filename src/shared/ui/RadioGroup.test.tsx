import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { RadioGroup, type RadioOption } from "@/shared/ui/RadioGroup";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see elements left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Radio group control tests (design.md D1.1 own-field contract, D7 modes,
 * D9 dot and hit area; spec "Radio group"). Written before the component is
 * implemented (task 7.2); the import of `RadioGroup` fails to resolve until
 * then, so the file runs and fails as required.
 *
 * Assertions are className-/attribute-based: jsdom has no CSS engine, so the
 * 24×24px hit area and the custom circle are verified through their exact
 * class sets and the contract by the exact attributes. The radio group is its
 * own field: every test here renders it with NO Field around it.
 */

const OPTIONS = [
  { value: "whole", label: "Whole bean" },
  { value: "filter", label: "Filter" },
  { value: "espresso", label: "Espresso" },
] satisfies RadioOption[];

const CIRCLE_TOKENS = [
  "size-4",
  "appearance-none",
  "rounded-full",
  "border-2",
  "border-border-strong",
  "checked:bg-surface-checked",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
];

describe("RadioGroup", () => {
  describe("group name (spec: Group name)", () => {
    it("renders a fieldset with a legend carrying type-label as the group name", () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} />,
      );
      const fieldset = container.querySelector("fieldset")!;
      const legend = fieldset.querySelector("legend")!;
      expect(legend.textContent).toBe("Grind");
      expect(legend.className).toContain("type-label");
    });
  });

  describe("keyboard grouping (spec: Keyboard operation)", () => {
    it("shares one name across the options so grouping is native", () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} />,
      );
      const names = Array.from(
        container.querySelectorAll("input[type=radio]"),
      ).map((input) => input.getAttribute("name"));
      expect(names).toHaveLength(3);
      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });
  });

  describe("circle and dot (spec: Selected state identification, design.md D9)", () => {
    it("renders the exact circle tokens with a custom circle replacing the native control", () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} />,
      );
      for (const input of container.querySelectorAll("input[type=radio]")) {
        for (const token of CIRCLE_TOKENS) {
          expect(input.className).toContain(token);
        }
      }
    });

    it("renders a dot per option always, shown through peer-checked and following the input's real state (Unplanned fix)", () => {
      const { container } = render(
        <form>
          <RadioGroup legend="Grind" options={OPTIONS} />
        </form>,
      );
      const dots = container.querySelectorAll(".bg-checked-mark");
      expect(dots).toHaveLength(3);
      for (const dot of dots) {
        expect(dot.className).toContain("size-2");
        expect(dot.className).toContain("rounded-full");
        expect(dot.className).toContain("invisible");
        expect(dot.className).toContain("peer-checked:visible");
      }
      const inputs = container.querySelectorAll("input[type=radio]");
      for (const input of inputs) {
        expect(input.className).toContain("peer");
      }

      // The dot follows the input's real state through CSS, not React state:
      // after form.reset() the choice is gone and the same class contract
      // hides the dot.
      const chosen = inputs[1] as HTMLInputElement;
      fireEvent.click(screen.getByText("Filter"));
      expect(chosen.checked).toBe(true);
      (container.querySelector("form") as HTMLFormElement).reset();
      expect(chosen.checked).toBe(false);
    });

    it("fades the dot when the group is disabled (peer-disabled:opacity-50) (Unplanned fix)", () => {
      const { container } = render(
        <RadioGroup
          legend="Grind"
          options={OPTIONS}
          defaultValue="whole"
          disabled
        />,
      );
      const disabledInput = container.querySelectorAll("input[type=radio]")[0]!;
      expect(disabledInput.hasAttribute("disabled")).toBe(true);
      for (const dot of container.querySelectorAll(".bg-checked-mark")) {
        expect(dot.className).toContain("peer-disabled:opacity-50");
      }
    });

    it("swaps the circle border to the error treatment when invalid (spec: Error state, design.md D9)", () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} error="Choose a grind" />,
      );
      for (const input of container.querySelectorAll("input[type=radio]")) {
        expect(input.className).toContain("border-feedback-error");
        expect(input.className).not.toContain("border-border-strong");
      }
    });
  });

  describe("option click target (spec: Option click target, design.md D9)", () => {
    it("labels each option with flex min-h-6 min-w-6 items-center gap-2", () => {
      render(<RadioGroup legend="Grind" options={OPTIONS} />);
      for (const option of OPTIONS) {
        const label = screen.getByText(option.label).closest("label")!;
        expect(label.className).toContain("flex");
        expect(label.className).toContain("min-h-6");
        expect(label.className).toContain("min-w-6");
        expect(label.className).toContain("items-center");
        expect(label.className).toContain("gap-2");
      }
    });

    it("clicking an option's label chooses that option", () => {
      const onChange = vi.fn();
      render(
        <RadioGroup
          legend="Grind"
          options={OPTIONS}
          defaultValue="whole"
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByText("Espresso"));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("espresso");
      expect(checkedValues()).toEqual(["espresso"]);
    });
  });

  describe("single choice (spec: Single choice, design.md D7)", () => {
    it("uncontrolled mode: choosing clears the previously selected option", () => {
      render(
        <RadioGroup legend="Grind" options={OPTIONS} defaultValue="whole" />,
      );
      expect(checkedValues()).toEqual(["whole"]);
      fireEvent.click(screen.getByText("Filter"));
      expect(checkedValues()).toEqual(["filter"]);
    });

    it("controlled mode: value and onChange drive the choice", () => {
      const onChange = vi.fn();
      render(
        <RadioGroup
          legend="Grind"
          options={OPTIONS}
          value="whole"
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByText("Filter"));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("filter");
      // Controlled: without a state update the choice stays the prop's.
      expect(checkedValues()).toEqual(["whole"]);
    });
  });

  describe("own-field contract (design.md D1.1, spec: Help and error, Error state, Required)", () => {
    it("renders help and error below the options in type-meta and type-error and wires them to the fieldset, help first", () => {
      const { container } = render(
        <RadioGroup
          legend="Grind"
          options={OPTIONS}
          help="Pick one"
          error="Choose a grind"
        />,
      );
      const fieldset = container.querySelector("fieldset")!;
      const help = screen.getByText("Pick one");
      const error = screen.getByText("Choose a grind");
      expect(help.className).toContain("type-meta");
      expect(error.className).toContain("type-error");
      expect(fieldset.lastElementChild).toBe(error);

      expect(fieldset.getAttribute("aria-describedby")).toBe(
        `${help.id} ${error.id}`,
      );
      expect(fieldset.getAttribute("aria-invalid")).toBe("true");
    });

    it("omits aria-describedby when neither help nor error exists and aria-invalid when no error is shown", () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} />,
      );
      const fieldset = container.querySelector("fieldset")!;
      expect(fieldset.hasAttribute("aria-describedby")).toBe(false);
      expect(fieldset.hasAttribute("aria-invalid")).toBe(false);
    });

    it("marks each radio input required when required", () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} required />,
      );
      for (const input of container.querySelectorAll("input[type=radio]")) {
        expect(input.hasAttribute("required")).toBe(true);
      }
    });

    it('treats an empty string as no message (Unplanned fix)', () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} help="" error="" />,
      );
      expect(container.querySelector("p")).toBeNull();
      const fieldset = container.querySelector("fieldset")!;
      expect(fieldset.hasAttribute("aria-describedby")).toBe(false);
      expect(fieldset.hasAttribute("aria-invalid")).toBe(false);
    });
  });

  describe("inverse variant (design.md D2, D4)", () => {
    it("adds variant-inverse on the fieldset", () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} variant="inverse" />,
      );
      expect(
        container.querySelector("fieldset")!.className,
      ).toContain("variant-inverse");
    });
  });
});

/** The values of the currently checked radio inputs. */
function checkedValues(): string[] {
  return Array.from(
    document.querySelectorAll("input[type=radio]"),
  )
    .filter((input) => (input as HTMLInputElement).checked)
    .map((input) => input.getAttribute("value")!);
}
