import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FacetCascade, type CascadeOption } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Taxonomy chip cascade facet (spec filtering "Taxonomy chip cascade facet";
 * refine-offering-facets-aut D3, D4): the facet is a group named by its
 * legend, stays within the panel width, and "See more" applies to the
 * top-level chips.
 */

const TEXTS = {
  seeMore: "See more ({count})",
  seeLess: "See less",
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

function cascade(value: string[], options = OPTIONS) {
  return (
    <FacetCascade legend="Flavour" options={options} value={value} onChange={() => {}} texts={TEXTS} />
  );
}

describe("FacetCascade", () => {
  it("is a group named by its legend", () => {
    render(cascade([]));
    expect(screen.getByRole("group", { name: "Flavour" })).toBeTruthy();
  });

  it("keeps rows within the panel width: the facet root may shrink and long labels wrap", () => {
    const { container } = render(cascade([]));
    const root = container.firstElementChild as HTMLElement;
    expect(root.className.split(" ")).toEqual(expect.arrayContaining(["min-w-0", "wrap-anywhere"]));
    expect(screen.getByRole("group", { name: "Flavour" }).className.split(" ")).toContain("min-w-0");
  });

  it("seven top-level options with none applied hide two chips and show See more (2)", () => {
    const seven: CascadeOption[] = Array.from({ length: 7 }, (_, i) => ({
      value: `t${i + 1}`,
      label: `Top ${i + 1}`,
    }));
    render(cascade([], seven));
    const hidden = seven
      .filter((o) => screen.queryByRole("button", { name: o.label }) === null)
      .map((o) => o.label);
    expect(hidden).toEqual(["Top 6", "Top 7"]);
    expect(screen.getByRole("button", { name: "See more (2)" })).toBeTruthy();
  });
});
