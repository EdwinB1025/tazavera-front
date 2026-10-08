import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { FacetCascade, type CascadeOption } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Taxonomy chip cascade facet (spec filtering "Taxonomy chip cascade facet";
 * refine-offering-facets-aut D3, D4): descriptor chips, a parent's children
 * shown only while it is chosen, unchoosing a parent drops its children, ids
 * reported in option order.
 */

const TEXTS = {
  seeMore: "See more ({count})",
  seeLess: "See less",
};

const OPTIONS: CascadeOption[] = [
  {
    value: "fruity",
    label: "Fruity",
    color: "#af5e70",
    children: [
      { value: "berry", label: "Berry", color: "#c0392b" },
      { value: "dried-fruit", label: "Dried fruit", color: "#8e44ad" },
    ],
  },
  {
    value: "floral",
    label: "Floral",
    color: "#336699",
    children: [{ value: "jasmine", label: "Jasmine", color: "#f1c40f" }],
  },
];

function cascade(value: string[], onChange: (values: string[]) => void = () => {}, options = OPTIONS) {
  return (
    <FacetCascade legend="Flavour" options={options} value={value} onChange={onChange} texts={TEXTS} />
  );
}

function chip(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function pressed(element: HTMLElement): string | null {
  return element.getAttribute("aria-pressed");
}

describe("FacetCascade", () => {
  it("hides a parent's children while the parent is not chosen, with no control to show them", () => {
    render(cascade([]));
    expect(screen.queryByRole("button", { name: "Berry" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Fruity" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Fruity/, expanded: false })).toBeNull();
  });

  it("choosing a parent reports it alone and then shows its children unchosen in a row titled with it", () => {
    const onChange = vi.fn();
    const { rerender } = render(cascade([], onChange));
    fireEvent.click(chip("Fruity"));
    expect(onChange).toHaveBeenCalledWith(["fruity"]);
    rerender(cascade(["fruity"], onChange));
    const row = screen.getByRole("group", { name: "Fruity" });
    expect(pressed(within(row).getByRole("button", { name: "Berry" }))).toBe("false");
    expect(pressed(within(row).getByRole("button", { name: "Dried fruit" }))).toBe("false");
  });

  it("choosing a child of a chosen parent reports both in option order", () => {
    const onChange = vi.fn();
    render(cascade(["fruity"], onChange));
    fireEvent.click(chip("Berry"));
    expect(onChange).toHaveBeenCalledWith(["fruity", "berry"]);
  });

  it("an unchosen chip shows the data-colour dot and a chosen chip the taxonomy badge with a check mark", () => {
    render(cascade(["fruity"]));
    const floral = chip("Floral");
    const dot = floral.querySelector<HTMLElement>('[aria-hidden="true"]')!;
    expect(dot.style.backgroundColor).toBe("rgb(51, 102, 153)");
    expect(floral.querySelector("[data-taxonomy]")).toBeNull();
    const badge = chip("Fruity").querySelector("[data-taxonomy]")!;
    expect(badge.firstElementChild!.tagName.toLowerCase()).toBe("svg");
  });

  it("a chosen parent at load shows its children row with the chosen child, and no other children", () => {
    render(cascade(["floral", "jasmine"]));
    const row = screen.getByRole("group", { name: "Floral" });
    expect(pressed(within(row).getByRole("button", { name: "Jasmine" }))).toBe("true");
    expect(screen.queryByRole("button", { name: "Berry" })).toBeNull();
  });

  it("unchoosing a parent drops its chosen children and hides their row", () => {
    const onChange = vi.fn();
    const { rerender } = render(cascade(["fruity", "berry", "floral"], onChange));
    fireEvent.click(chip("Fruity"));
    expect(onChange).toHaveBeenCalledWith(["floral"]);
    rerender(cascade(["floral"], onChange));
    expect(screen.queryByRole("group", { name: "Fruity" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Berry" })).toBeNull();
  });

  it("the help paragraph sits in the padded wrapper of the legend (refine-offering-facets-aut D4)", () => {
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
    expect(help.getAttribute("class")!.split(/\s+/).sort()).toEqual(["mt-1", "type-meta"]);
    const wrapper = help.closest(".px-3")!;
    expect(wrapper.classList.contains("pt-1")).toBe(true);
    expect(wrapper.contains(screen.getByText("Flavour"))).toBe(true);
  });

  it("chips take the muted boundary, which the inverse variant swaps for the inverse boundary", () => {
    render(cascade(["fruity"]));
    for (const button of screen.getAllByRole("button", { pressed: false }).concat(
      screen.getAllByRole("button", { pressed: true }),
    )) {
      expect(button.className.split(" ")).toEqual(
        expect.arrayContaining(["border-2", "border-border-muted"]),
      );
    }
    const css = readFileSync(pathResolve(process.cwd(), "src/app/styles/globals.css"), "utf8");
    const scope = /@utility variant-inverse \{([^}]*)\}/.exec(css)![1];
    expect(scope).toContain("--color-border-muted: var(--color-border-inverse);");
  });
});
