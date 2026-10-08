import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FacetCascade, type CascadeOption } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Taxonomy cascade facet (spec filtering "Taxonomy cascade facet";
 * design.md D7): independent checkboxes, per-parent expand control,
 * initial expansion from the value, ids reported in option order.
 */

const TEXTS = {
  seeMore: "See more ({count})",
  seeLess: "See less",
  toggleChildren: "Options under {label}",
};

const OPTIONS: CascadeOption[] = [
  {
    value: "fruity",
    label: "Fruity",
    children: [
      { value: "berry", label: "Berry" },
      { value: "dried-fruit", label: "Dried fruit" },
    ],
  },
  { value: "floral", label: "Floral", children: [{ value: "jasmine", label: "Jasmine" }] },
];

function cascade(value: string[], onChange: (values: string[]) => void = () => {}, options = OPTIONS) {
  return (
    <FacetCascade legend="Flavour" options={options} value={value} onChange={onChange} texts={TEXTS} />
  );
}

function toggle(label: string): HTMLElement {
  return screen.getByRole("button", { name: `Options under ${label}` });
}

function groupOf(button: HTMLElement): HTMLElement {
  return document.getElementById(button.getAttribute("aria-controls")!)!;
}

function checkbox(name: string): HTMLInputElement {
  return screen.getByRole("checkbox", { name, hidden: true }) as HTMLInputElement;
}

describe("FacetCascade", () => {
  it("is a group named by its legend", () => {
    render(cascade([]));
    expect(screen.getByRole("group", { name: "Flavour" })).toBeTruthy();
  });

  it("keeps rows within the panel width: the fieldset and the label cell may shrink and long labels wrap", () => {
    render(cascade([]));
    const fieldset = screen.getByRole("group", { name: "Flavour" });
    expect(fieldset.className.split(" ")).toEqual(
      expect.arrayContaining(["min-w-0", "wrap-anywhere"]),
    );
    const cell = toggle("Fruity").previousElementSibling as HTMLElement;
    expect(cell.className.split(" ")).toEqual(expect.arrayContaining(["min-w-0", "flex-1"]));
  });

  it("with no value both toggles are collapsed and control hidden groups", () => {
    render(cascade([]));
    for (const label of ["Fruity", "Floral"]) {
      const button = toggle(label);
      expect(button.getAttribute("aria-expanded")).toBe("false");
      const group = groupOf(button);
      expect(group).not.toBeNull();
      expect(group.getAttribute("role")).toBe("group");
      expect(group.hasAttribute("hidden")).toBe(true);
    }
  });

  it("reported ids follow option order, parent before children", () => {
    const onChange = vi.fn();
    render(cascade(["jasmine", "berry"], onChange));
    fireEvent.click(checkbox("Fruity"));
    expect(onChange).toHaveBeenCalledWith(["fruity", "berry", "jasmine"]);
  });

  it("seven top-level options with none applied hide two rows and show See more (2)", () => {
    const seven: CascadeOption[] = Array.from({ length: 7 }, (_, i) => ({
      value: `t${i + 1}`,
      label: `Top ${i + 1}`,
    }));
    render(cascade([], () => {}, seven));
    const hidden = seven
      .filter((o) => screen.getByText(o.label).closest("[hidden]") !== null)
      .map((o) => o.label);
    expect(hidden).toEqual(["Top 6", "Top 7"]);
    expect(screen.getByRole("button", { name: "See more (2)" })).toBeTruthy();
  });
});
