import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useState } from "react";
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

/** A controlled host holding the score in state, as a consumer would. */
function Host({
  initial,
  onChange,
}: {
  initial: number | null;
  onChange: (value: number) => void;
}) {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <BeanScale
      label="Aroma"
      value={value}
      valueText={`${value ?? "–"}/9`}
      onChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

describe("BeanScale", () => {
  describe("group name and options (spec: Group name and options)", () => {
    it("renders nine radios named 1 to 9 in a radiogroup named by its type-label label", () => {
      render(
        <BeanScale label="Aroma" value={null} valueText="–/9" onChange={vi.fn()} />,
      );
      const group = screen.getByRole("radiogroup", { name: "Aroma" });
      const labelId = group.getAttribute("aria-labelledby")!;
      const label = document.getElementById(labelId)!;
      expect(label.textContent).toBe("Aroma");
      expect(label.className).toContain("type-label");
      expect(screen.getAllByRole("radio")).toHaveLength(9);
      for (const bean of beans()) {
        expect(group.contains(bean)).toBe(true);
      }
    });
  });

  describe("choosing a score (spec: Choosing a score)", () => {
    it("a click on a bean calls onChange with that bean's number", () => {
      const onChange = vi.fn();
      render(
        <BeanScale label="Aroma" value={2} valueText="2/9" onChange={onChange} />,
      );
      fireEvent.click(screen.getByRole("radio", { name: "7" }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(7);
    });

    it("renders beans 1..value with the on artwork and the rest with the off artwork", () => {
      render(
        <BeanScale label="Aroma" value={6} valueText="6/9" onChange={vi.fn()} />,
      );
      const states = beans().map((bean) => discState(bean));
      expect(states).toEqual([
        ["on"], ["on"], ["on"], ["on"], ["on"], ["on"], ["off"], ["off"], ["off"],
      ]);
      expect(
        screen.getByRole("radio", { name: "6" }).getAttribute("aria-checked"),
      ).toBe("true");
    });
  });

  describe("value as text (spec: Value as text, design.md D3)", () => {
    it("renders the supplied value text beside the row in type-body italic tabular-nums text-text-primary", () => {
      render(
        <BeanScale label="Aroma" value={6} valueText="6/9" onChange={vi.fn()} />,
      );
      const text = screen.getByText("6/9");
      for (const token of [
        "type-body",
        "italic",
        "tabular-nums",
        "text-text-primary",
      ]) {
        expect(text.className.split(" ")).toContain(token);
      }
      expect(text.className).not.toContain("underline");
    });
  });

  describe("keyboard operation (spec: Keyboard operation, design.md D3)", () => {
    const cases: [string, number | null, number][] = [
      ["ArrowRight", 5, 6],
      ["ArrowUp", 5, 6],
      ["ArrowLeft", 5, 4],
      ["ArrowDown", 5, 4],
      ["Home", 5, 1],
      ["End", 5, 9],
    ];

    for (const [key, from, to] of cases) {
      it(`${key} from ${from} selects ${to}, leaving focus on bean ${to}`, () => {
        const onChange = vi.fn();
        render(<Host initial={from} onChange={onChange} />);
        const start = screen.getByRole("radio", { name: String(from) });
        start.focus();
        fireEvent.keyDown(start, { key });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(to);
        const target = screen.getByRole("radio", { name: String(to) });
        expect(document.activeElement).toBe(target);
        expect(target.getAttribute("aria-checked")).toBe("true");
      });
    }

    it("offers one tab stop, on the checked bean", () => {
      const { container } = render(
        <BeanScale label="Aroma" value={6} valueText="6/9" onChange={vi.fn()} />,
      );
      const stops = container.querySelectorAll('[tabindex="0"]');
      expect(stops).toHaveLength(1);
      expect(stops[0]).toBe(screen.getByRole("radio", { name: "6" }));
    });
  });

  describe("hover and focus (spec: Hover feedback, design.md D3)", () => {
    it("changes only the pointer cursor on hover and carries the shared focus ring on each bean", () => {
      render(
        <BeanScale label="Aroma" value={null} valueText="–/9" onChange={vi.fn()} />,
      );
      for (const bean of beans()) {
        const tokens = bean.className.split(" ");
        expect(tokens).toContain("cursor-pointer");
        expect(tokens).toContain("rounded-full");
        expect(tokens).toContain("focus-visible:focus-ring");
        expect(tokens.filter((token) => token.startsWith("hover:"))).toEqual([]);
      }
    });
  });

  describe("own-field contract (spec: Help and error, Error state)", () => {
    it("renders help in type-meta and error in type-error, wired to the group help first, with aria-invalid", () => {
      render(
        <BeanScale
          label="Aroma"
          value={null}
          valueText="–/9"
          onChange={vi.fn()}
          help="Rate the aroma"
          error="Choose a score"
        />,
      );
      const group = screen.getByRole("radiogroup", { name: "Aroma" });
      const help = screen.getByText("Rate the aroma");
      const error = screen.getByText("Choose a score");
      expect(help.className).toContain("type-meta");
      expect(error.className).toContain("type-error");
      expect(group.getAttribute("aria-describedby")).toBe(
        `${help.id} ${error.id}`,
      );
      expect(group.getAttribute("aria-invalid")).toBe("true");
    });
  });

  describe("required (spec: Required)", () => {
    it("marks the group and each option required", () => {
      // Inside a form the primitive measures each bean for its hidden native
      // radio; jsdom has no ResizeObserver. Test infrastructure only.
      vi.stubGlobal(
        "ResizeObserver",
        class {
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      );
      const { container } = render(
        <form>
          <BeanScale
            label="Aroma"
            value={null}
            valueText="–/9"
            onChange={vi.fn()}
            required
          />
        </form>,
      );
      const group = screen.getByRole("radiogroup", { name: "Aroma" });
      expect(group.getAttribute("aria-required")).toBe("true");
      const inputs = container.querySelectorAll("input[type=radio]");
      expect(inputs).toHaveLength(9);
      for (const input of inputs) {
        expect(input.hasAttribute("required")).toBe(true);
      }
    });
  });

  describe("disabled (spec: Data-entry control states)", () => {
    it("renders the beans disabled at 50% opacity with a not-allowed cursor and out of the focus order", () => {
      const { container } = render(
        <BeanScale
          label="Aroma"
          value={4}
          valueText="4/9"
          onChange={vi.fn()}
          disabled
        />,
      );
      for (const bean of beans()) {
        expect(bean.hasAttribute("disabled")).toBe(true);
        expect(bean.className).toContain("disabled:opacity-50");
        expect(bean.className).toContain("disabled:cursor-not-allowed");
      }
      expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
    });
  });

  describe("read-only display (spec: Read-only display, design.md D3)", () => {
    it("renders a non-focusable meter over 0..9 with the supplied value label and no radios", () => {
      const { container } = render(
        <BeanScale
          label="Aroma"
          value={6.4}
          valueText="6,4/9"
          valueLabel="6,4 de 9"
          readOnly
        />,
      );
      const meter = screen.getByRole("meter", { name: "Aroma" });
      expect(meter.getAttribute("aria-valuemin")).toBe("0");
      expect(meter.getAttribute("aria-valuemax")).toBe("9");
      expect(meter.getAttribute("aria-valuenow")).toBe("6.4");
      expect(meter.getAttribute("aria-valuetext")).toBe("6,4 de 9");
      const label = document.getElementById(
        meter.getAttribute("aria-labelledby")!,
      )!;
      expect(label.textContent).toBe("Aroma");
      expect(screen.queryAllByRole("radio")).toHaveLength(0);
      expect(container.querySelectorAll("button")).toHaveLength(0);
      expect(container.querySelectorAll("[tabindex]")).toHaveLength(0);
      expect(screen.getByText("6,4/9")).toBeDefined();
    });

    it("fills beans 1..floor(v), cuts bean ceil(v) at the fraction and leaves the rest off", () => {
      const { container } = render(
        <BeanScale
          label="Aroma"
          value={6.4}
          valueText="6,4/9"
          valueLabel="6,4 de 9"
          readOnly
        />,
      );
      const marks = Array.from(container.querySelectorAll('[data-slot="bean"]'));
      expect(marks).toHaveLength(9);
      const states = marks.map((bean) => discState(bean));
      expect(states).toEqual([
        ["on"], ["on"], ["on"], ["on"], ["on"], ["on"],
        ["off", "on"],
        ["off"], ["off"],
      ]);
      const cut = container.querySelectorAll('[style*="clip-path"]');
      expect(cut).toHaveLength(1);
      expect(marks[6]!.contains(cut[0]!)).toBe(true);
      expect(cut[0]!.getAttribute("style")).toBe("clip-path: inset(0 60% 0 0);");
    });
  });

  describe("mark background (spec: The mark's background stays inside the bean, refine-small-visuals-aut D2)", () => {
    it("draws each bean's background as a circle inside the bean, behind the path, with the path's transform", () => {
      render(
        <BeanScale label="Aroma" value={6} valueText="6/9" onChange={vi.fn()} />,
      );
      for (const bean of beans()) {
        const rect = bean.querySelector("svg rect")!;
        expect([
          rect.getAttribute("x"),
          rect.getAttribute("y"),
          rect.getAttribute("width"),
          rect.getAttribute("height"),
          rect.getAttribute("rx"),
          rect.getAttribute("transform"),
        ]).toEqual([
          "4.05", "4.35", "15.6", "15.6", "7.8",
          "translate(12 12) scale(1.33) translate(-12 -12)",
        ]);
        expect(rect.nextElementSibling!.tagName).toBe("path");
      }
    });
  });
});
