import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { IntensitySlider } from "@/shared/ui/IntensitySlider";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Intensity slider tests (the `form-fields` spec "Intensity slider";
 * design.md D2, D5). Written before the component body exists (task 3.1):
 * `IntensitySlider` is not exported yet, so the file runs and fails as
 * required.
 *
 * jsdom has no CSS engine: the layers and treatments are asserted through
 * their exact classes and inline `--fill`, the contract through roles and
 * attributes.
 */

const SCALE_LABELS: [string, string, string] = ["LOW", "MEDIUM", "HIGH"];

function renderSlider(
  props: Partial<{
    value: number | null;
    help: string;
    error: string;
    disabled: boolean;
  }> = {},
  onChange = vi.fn(),
) {
  const value = props.value === undefined ? 6 : props.value;
  return render(
    <IntensitySlider
      label="Acidity"
      value={value}
      valueText={`${value ?? 0}/15`}
      valueLabel={`${value ?? 0} de 15`}
      scaleLabels={SCALE_LABELS}
      onChange={onChange}
      help={props.help}
      error={props.error}
      disabled={props.disabled}
    />,
  );
}

function tokensOf(element: Element): string[] {
  return element.getAttribute("class")!.split(/\s+/);
}

describe("IntensitySlider", () => {
  describe("track layers (spec: Choosing an intensity, No value shows zero, design.md D5)", () => {
    it("spans the gradient over the whole track and starts the off layer at --fill", () => {
      const { container } = renderSlider();
      const gradient = container.querySelector('[data-slot="gradient"]')!;
      const off = container.querySelector('[data-slot="off"]')!;
      for (const token of [
        "absolute",
        "inset-x-0",
        "h-1.5",
        "rounded-pill",
        "bg-linear-[to_right,var(--color-evaluation-slider-start),var(--color-evaluation-slider-end)]",
      ]) {
        expect(tokensOf(gradient)).toContain(token);
      }
      for (const token of [
        "absolute",
        "left-(--fill)",
        "right-0",
        "h-1.5",
        "rounded-pill",
        "bg-evaluation-slider-track",
      ]) {
        expect(tokensOf(off)).toContain(token);
      }
    });
  });

  describe("own-field contract (spec: Help and error, Error state)", () => {
    it("renders and wires nothing for empty help and error strings", () => {
      const { container } = renderSlider({ help: "", error: "" });
      const slider = screen.getByRole("slider");
      expect(slider.hasAttribute("aria-describedby")).toBe(false);
      expect(slider.hasAttribute("aria-invalid")).toBe(false);
      expect(container.querySelector(".type-error")).toBeNull();
      expect(container.querySelector("p.type-meta")).toBeNull();
    });
  });

  describe("disabled (spec: Data-entry control states)", () => {
    it("disables the input with a not-allowed cursor and fades the slider to 50%", () => {
      const { container } = renderSlider({ disabled: true });
      const slider = screen.getByRole("slider");
      expect(slider.hasAttribute("disabled")).toBe(true);
      expect(tokensOf(slider)).toContain("disabled:cursor-not-allowed");
      const track = container.querySelector('[data-slot="track"]')!;
      expect(tokensOf(track)).toContain("opacity-50");
    });
  });

  describe("type contract (design.md D2)", () => {
    it("rejects a missing onChange without readOnly", () => {
      // `npx tsc --noEmit` fails (TS2578, unused directive) if the case ever
      // becomes accepted.
      render(
        // @ts-expect-error onChange required without readOnly
        <IntensitySlider
          label="Acidity"
          value={1}
          valueText="1/15"
          valueLabel="1 de 15"
          scaleLabels={SCALE_LABELS}
        />,
      );
      expect(screen.getByRole("slider")).toBeDefined();
    });
  });
});
