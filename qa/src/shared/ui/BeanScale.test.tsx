import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BeanScale } from "@/shared/ui/BeanScale";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/**
 * Bean scale tests (the `form-fields` spec "Bean scale"; design.md D2, D3,
 * D4). Written before the component body exists (task 2.1): `BeanScale` is
 * not exported yet, so the file runs and fails as required.
 *
 * jsdom has no CSS engine: the treatments are asserted through their exact
 * classes and the contract through roles, attributes and focus.
 */

const BEAN_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

function beans(): HTMLElement[] {
  return BEAN_NAMES.map((name) => screen.getByRole("radio", { name }));
}

/** The painted state of the disc a bean renders ("on" or "off"). */
function discState(bean: Element): string[] {
  return Array.from(bean.querySelectorAll("svg rect")).map((rect) =>
    rect.getAttribute("class")!.includes("fill-evaluation-bean-on")
      ? "on"
      : "off",
  );
}

describe("BeanScale", () => {
  describe("choosing a score (spec: Choosing a score)", () => {
    it("renders every bean off when value is null", () => {
      render(
        <BeanScale label="Aroma" value={null} valueText="–/9" onChange={vi.fn()} />,
      );
      for (const bean of beans()) {
        expect(discState(bean)).toEqual(["off"]);
      }
    });
  });

  describe("keyboard operation (spec: Keyboard operation, design.md D3)", () => {
    it("offers one tab stop, on bean 1, when value is null", () => {
      const { container } = render(
        <BeanScale label="Aroma" value={null} valueText="–/9" onChange={vi.fn()} />,
      );
      const stops = container.querySelectorAll('[tabindex="0"]');
      expect(stops).toHaveLength(1);
      expect(stops[0]).toBe(screen.getByRole("radio", { name: "1" }));
    });
  });

  describe("own-field contract (spec: Help and error, Error state)", () => {
    it("renders and wires nothing for empty help and error strings", () => {
      const { container } = render(
        <BeanScale
          label="Aroma"
          value={null}
          valueText="–/9"
          onChange={vi.fn()}
          help=""
          error=""
        />,
      );
      const group = screen.getByRole("radiogroup", { name: "Aroma" });
      expect(group.hasAttribute("aria-describedby")).toBe(false);
      expect(group.hasAttribute("aria-invalid")).toBe(false);
      expect(container.querySelector(".type-meta")).toBeNull();
      expect(container.querySelector(".type-error")).toBeNull();
    });
  });

  describe("read-only display (spec: Read-only display, design.md D3)", () => {
    it("renders no cut bean for a whole score", () => {
      const { container } = render(
        <BeanScale
          label="Aroma"
          value={6}
          valueText="6/9"
          valueLabel="6 de 9"
          readOnly
        />,
      );
      expect(container.querySelectorAll('[style*="clip-path"]')).toHaveLength(0);
    });
  });

  describe("type contract (design.md D2)", () => {
    it("rejects size sm and a missing onChange without readOnly", () => {
      // `npx tsc --noEmit` fails (TS2578, unused directive) if either case
      // ever becomes accepted.
      render(
        // @ts-expect-error size sm only with readOnly
        <BeanScale
          label="Aroma"
          value={1}
          valueText="1/9"
          onChange={vi.fn()}
          size="sm"
        />,
      );
      cleanup();
      // @ts-expect-error onChange required without readOnly
      render(<BeanScale label="Aroma" value={1} valueText="1/9" />);
      expect(screen.getByRole("radiogroup")).toBeDefined();
    });
  });
});
