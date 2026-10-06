import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
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
  describe("native range (spec: Choosing an intensity, Keyboard operation)", () => {
    it("renders a range bound to its type-label label, 0..15 in whole steps, with the supplied value label", () => {
      renderSlider();
      const slider = screen.getByRole("slider", { name: "Acidity" });
      expect(slider.getAttribute("type")).toBe("range");
      expect(slider.getAttribute("min")).toBe("0");
      expect(slider.getAttribute("max")).toBe("15");
      expect(slider.getAttribute("step")).toBe("1");
      expect(slider.getAttribute("aria-valuetext")).toBe("6 de 15");
      expect((slider as HTMLInputElement).value).toBe("6");
      const label = screen.getByText("Acidity");
      expect(label.tagName).toBe("LABEL");
      expect(tokensOf(label)).toContain("type-label");
    });

    it("calls onChange with the integer the range moves to", () => {
      const onChange = vi.fn();
      renderSlider({}, onChange);
      fireEvent.change(screen.getByRole("slider"), { target: { value: "11" } });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(11);
    });

    it("carries the shared focus ring, a pill radius and a pointer cursor as its only hover change", () => {
      renderSlider();
      const tokens = tokensOf(screen.getByRole("slider"));
      expect(tokens).toContain("focus-visible:focus-ring");
      expect(tokens).toContain("rounded-pill");
      expect(tokens).toContain("cursor-pointer");
      expect(tokens).toContain("intensity-slider-thumb");
      expect(tokens.filter((token) => token.startsWith("hover:"))).toEqual([]);
    });
  });

  describe("track layers (spec: Choosing an intensity, No value shows zero, design.md D5)", () => {
    it("sets --fill inline to value/15 as a percentage on the track block", () => {
      const { container } = renderSlider({ value: 6 });
      const track = container.querySelector('[data-slot="track"]')!;
      expect(track.getAttribute("style")).toBe("--fill: 40%;");
    });

    it("renders no value as 0: --fill 0% and the thumb at the start", () => {
      const { container } = renderSlider({ value: null });
      const track = container.querySelector('[data-slot="track"]')!;
      expect(track.getAttribute("style")).toBe("--fill: 0%;");
      expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("0");
    });

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

  describe("header row (spec: Label and value)", () => {
    it("renders the label left and the value text right in type-body italic tabular-nums text-text-primary", () => {
      renderSlider();
      const label = screen.getByText("Acidity");
      const value = screen.getByText("6/15");
      expect(label.parentElement).toBe(value.parentElement);
      expect(tokensOf(label.parentElement!)).toContain("justify-between");
      expect(label.compareDocumentPosition(value)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      for (const token of [
        "type-body",
        "italic",
        "tabular-nums",
        "text-text-primary",
      ]) {
        expect(tokensOf(value)).toContain(token);
      }
      expect(tokensOf(value)).not.toContain("underline");
    });
  });

  describe("marks and scale labels (spec: Marks and scale labels)", () => {
    it("renders 0/5/10/15 and the three scale labels below the track, hidden from assistive technology", () => {
      const { container } = renderSlider();
      const track = container.querySelector('[data-slot="track"]')!;
      for (const text of ["0", "5", "10", "15", ...SCALE_LABELS]) {
        const element = screen.getByText(text);
        expect(element.closest('[aria-hidden="true"]')).not.toBeNull();
        expect(track.compareDocumentPosition(element)).toBe(
          Node.DOCUMENT_POSITION_FOLLOWING,
        );
      }
    });
  });

  describe("own-field contract (spec: Help and error, Error state)", () => {
    it("renders help in type-meta and error in type-error, wired to the input help first, with aria-invalid", () => {
      renderSlider({ help: "Rate the acidity", error: "Choose an intensity" });
      const slider = screen.getByRole("slider");
      const help = screen.getByText("Rate the acidity");
      const error = screen.getByText("Choose an intensity");
      expect(tokensOf(help)).toContain("type-meta");
      expect(tokensOf(error)).toContain("type-error");
      expect(slider.getAttribute("aria-describedby")).toBe(
        `${help.id} ${error.id}`,
      );
      expect(slider.getAttribute("aria-invalid")).toBe("true");
    });

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

  describe("read-only display (spec: Read-only display)", () => {
    it("renders a non-focusable meter over 0..15 with the same layers and no input or thumb", () => {
      const { container } = render(
        <IntensitySlider
          label="Acidity"
          value={8}
          valueText="8/15"
          valueLabel="8 de 15"
          scaleLabels={SCALE_LABELS}
          readOnly
        />,
      );
      const meter = screen.getByRole("meter", { name: "Acidity" });
      expect(meter.getAttribute("aria-valuemin")).toBe("0");
      expect(meter.getAttribute("aria-valuemax")).toBe("15");
      expect(meter.getAttribute("aria-valuenow")).toBe("8");
      expect(meter.getAttribute("aria-valuetext")).toBe("8 de 15");
      expect(
        document.getElementById(meter.getAttribute("aria-labelledby")!)!
          .textContent,
      ).toBe("Acidity");
      expect(screen.queryByRole("slider")).toBeNull();
      expect(container.querySelector("input")).toBeNull();
      expect(container.querySelector(".intensity-slider-thumb")).toBeNull();
      expect(container.querySelectorAll("[tabindex]")).toHaveLength(0);
      expect(container.querySelector('[data-slot="gradient"]')).not.toBeNull();
      expect(container.querySelector('[data-slot="off"]')).not.toBeNull();
      expect(
        container.querySelector('[data-slot="track"]')!.getAttribute("style"),
      ).toBe(`--fill: ${(8 * 100) / 15}%;`);
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
