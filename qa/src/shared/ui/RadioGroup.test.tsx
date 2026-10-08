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
  describe("group naming and invalid exposure (correction 1, design.md D1.1)", () => {
    it("carries no invalid state when no error is shown", () => {
      render(<RadioGroup legend="Grind" options={OPTIONS} />);
      const group = screen.getByRole("radiogroup", { name: "Grind" });
      expect(group.hasAttribute("aria-invalid")).toBe(false);
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
  });

  describe("single choice (spec: Single choice, design.md D7)", () => {
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
    it("omits aria-describedby when neither help nor error exists and aria-invalid when no error is shown", () => {
      const { container } = render(
        <RadioGroup legend="Grind" options={OPTIONS} />,
      );
      const fieldset = container.querySelector("fieldset")!;
      expect(fieldset.hasAttribute("aria-describedby")).toBe(false);
      expect(fieldset.hasAttribute("aria-invalid")).toBe(false);
      expect(fieldset.getAttribute("role")).toBe("radiogroup");
      expect(fieldset.getAttribute("aria-labelledby")).toBe(
        fieldset.querySelector("legend")!.id,
      );
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

  describe("spacing (design.md D10, correction 2)", () => {
    it("gives the legend exactly mb-2 and the help text and error message exactly mt-1", () => {
      const { container } = render(
        <RadioGroup
          legend="Grind"
          options={OPTIONS}
          help="Pick one"
          error="Choose a grind"
        />,
      );
      expect(margins(container.querySelector("legend")!)).toEqual(["mb-2"]);
      expect(margins(screen.getByText("Pick one"))).toEqual(["mt-1"]);
      expect(margins(screen.getByText("Choose a grind"))).toEqual(["mt-1"]);
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

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

const ROW_OPTIONS: RadioOption[] = [
  { value: "", label: "Any", neutral: true },
  { value: "washed", label: "Washed" },
  { value: "natural", label: "Natural" },
  { value: "honey", label: "Honey", hidden: true },
];

describe("RadioGroup facet-row presentation (add-facet-controls design.md D3)", () => {
  it("legend carries the facet legend classes", () => {
    render(
      <RadioGroup legend="Process" options={ROW_OPTIONS} presentation="row" value="" onChange={() => {}} />,
    );
    expect(classesOf(screen.getByText("Process"))).toEqual([
      "type-label",
      "mb-1",
      "px-3",
      "py-1",
    ]);
  });

  it("id sets the fieldset id", () => {
    render(
      <RadioGroup id="g" legend="Process" options={ROW_OPTIONS} presentation="row" value="" onChange={() => {}} />,
    );
    expect(screen.getByRole("radiogroup").id).toBe("g");
  });
});

/** The margin utilities of an element (design.md D10 pins them exactly). */
function margins(element: Element): string[] {
  return element.className
    .split(/\s+/)
    .filter((token) => /^m[trblxyse]?-/.test(token));
}
