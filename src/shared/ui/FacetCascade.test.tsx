import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FacetCascade, type CascadeOption } from "@/shared/ui";
import { FACET_MESSAGE_CLASSES } from "@/shared/ui/facet-row";

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
  it("activating a toggle shows its group and sets aria-expanded", () => {
    render(cascade([]));
    const button = toggle("Fruity");
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(groupOf(button).hasAttribute("hidden")).toBe(false);
  });

  it("checking a parent reports it alone and its children stay unchecked", () => {
    const onChange = vi.fn();
    render(cascade([], onChange));
    fireEvent.click(checkbox("Fruity"));
    expect(onChange).toHaveBeenCalledWith(["fruity"]);
    expect(checkbox("Berry").checked).toBe(false);
    expect(checkbox("Dried fruit").checked).toBe(false);
  });

  it("checking a child with its parent unchecked reports the child alone", () => {
    const onChange = vi.fn();
    render(cascade([], onChange));
    fireEvent.click(toggle("Fruity"));
    fireEvent.click(checkbox("Berry"));
    expect(onChange).toHaveBeenCalledWith(["berry"]);
  });

  it("checking every child leaves the parent unchecked", () => {
    const onChange = vi.fn();
    render(cascade(["berry"], onChange));
    fireEvent.click(checkbox("Dried fruit"));
    expect(onChange).toHaveBeenCalledWith(["berry", "dried-fruit"]);
    expect(checkbox("Fruity").checked).toBe(false);
  });

  it("a checked child starts its parent expanded and the others collapsed", () => {
    render(cascade(["jasmine"]));
    expect(toggle("Floral").getAttribute("aria-expanded")).toBe("true");
    expect(groupOf(toggle("Floral")).hasAttribute("hidden")).toBe(false);
    expect(toggle("Fruity").getAttribute("aria-expanded")).toBe("false");
  });

  it("unchecking an expanded parent keeps its children visible and checked", () => {
    const onChange = vi.fn();
    render(cascade(["fruity", "berry"], onChange));
    expect(groupOf(toggle("Fruity")).hasAttribute("hidden")).toBe(false);
    fireEvent.click(checkbox("Fruity"));
    expect(onChange).toHaveBeenCalledWith(["berry"]);
    expect(groupOf(toggle("Fruity")).hasAttribute("hidden")).toBe(false);
    expect(checkbox("Berry").checked).toBe(true);
  });

  it("the help paragraph carries the facet message padding (refine-facet-controls D1)", () => {
    render(
      <FacetCascade
        legend="Flavour"
        options={OPTIONS}
        value={[]}
        onChange={() => {}}
        texts={TEXTS}
        help="Options unavailable"
      />,
    );
    const help = screen.getByText("Options unavailable");
    expect(help.getAttribute("class")!.split(/\s+/).sort()).toEqual(["mt-1", "px-3", "type-meta"]);
    expect(FACET_MESSAGE_CLASSES).toBe("px-3");
  });
});
