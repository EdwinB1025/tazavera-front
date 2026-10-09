import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  DescriptorChipGroup,
  type ChipRow,
} from "@/shared/ui/DescriptorChipGroup";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Descriptor chip group tests (the `form-fields` spec "Descriptor chip
 * group"; design.md D2, D6, D7). Written before the component body exists
 * (task 4.1): `DescriptorChipGroup` is not exported yet, so the file runs and
 * fails as required.
 *
 * jsdom has no CSS engine: the chip shells are asserted through their exact
 * classes, the chip content against `BADGE_GEOMETRY_CLASSES` and a reference
 * taxonomy `Badge`, the contract through roles, attributes and focus.
 */

const ROWS: ChipRow[] = [
  {
    id: "fruity",
    title: "Fruity",
    options: [
      { value: "01BERRY", label: "Berry", color: "#8B1E3F", level: 1 },
      { value: "01CITRUS", label: "Citrus", color: "#F2C14E", level: 1 },
    ],
  },
  {
    id: "shared",
    options: [{ value: "01NUTTY", label: "Nutty", color: "#7A4E2D", level: 0 }],
  },
];

function chip(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function renderGroup(
  props: Partial<{
    value: string[];
    help: string;
    error: string;
    disabled: boolean;
  }> = {},
  onValueChange = vi.fn(),
) {
  return render(
    <DescriptorChipGroup
      legend="Aroma descriptors"
      rows={ROWS}
      value={props.value ?? []}
      onValueChange={onValueChange}
      help={props.help}
      error={props.error}
      disabled={props.disabled}
    />,
  );
}

describe("DescriptorChipGroup", () => {
  describe("keyboard operation (spec: Keyboard operation, design.md D7)", () => {
    const cases: [string, string, string][] = [
      ["ArrowDown", "Citrus", "Nutty"],
      ["ArrowRight", "Nutty", "Berry"],
      ["ArrowLeft", "Berry", "Nutty"],
      ["ArrowUp", "Nutty", "Citrus"],
      ["ArrowLeft", "Citrus", "Berry"],
    ];

    for (const [key, from, to] of cases) {
      it(`${key} on ${from} moves focus to ${to} in reading order without toggling`, () => {
        const onValueChange = vi.fn();
        renderGroup({}, onValueChange);
        chip(from).focus();
        const notPrevented = fireEvent.keyDown(chip(from), { key });
        expect(notPrevented).toBe(false);
        expect(document.activeElement).toBe(chip(to));
        expect(chip(to).getAttribute("tabindex")).toBe("0");
        expect(chip(from).getAttribute("tabindex")).toBe("-1");
        expect(onValueChange).not.toHaveBeenCalled();
      });
    }
  });

  describe("own-field contract (spec: Help and error, Error state)", () => {
    it("renders and wires nothing for empty help and error strings", () => {
      const { container } = renderGroup({ help: "", error: "" });
      const block = screen.getByRole("group", { name: "Aroma descriptors" });
      expect(block.hasAttribute("aria-describedby")).toBe(false);
      expect(block.hasAttribute("aria-invalid")).toBe(false);
      expect(container.querySelector("p")).toBeNull();
    });
  });

  describe("disabled (spec: Data-entry control states)", () => {
    it("disables every chip", () => {
      renderGroup({ disabled: true });
      for (const name of ["Berry", "Citrus", "Nutty"]) {
        expect(chip(name).hasAttribute("disabled")).toBe(true);
        expect(chip(name).className).toContain("disabled:opacity-50");
        expect(chip(name).className).toContain("disabled:cursor-not-allowed");
      }
    });
  });

  describe("type contract (design.md D2)", () => {
    it("rejects a missing onValueChange without readOnly", () => {
      // `npx tsc --noEmit` fails (TS2578, unused directive) if the case ever
      // becomes accepted.
      render(
        // @ts-expect-error onValueChange required without readOnly
        <DescriptorChipGroup legend="Aroma" rows={ROWS} value={[]} />,
      );
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });
  });
});
