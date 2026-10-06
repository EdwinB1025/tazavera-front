import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FlavorWheel } from "./FlavorWheel";
import type { FlavorWheelNode, FlavorWheelProps } from "./FlavorWheel";
import { taxonomyColorRule } from "./taxonomy-color";

// This project has no global test setup, so RTL's auto-cleanup (which relies
// on a framework-provided afterEach) does not run. Clean up manually between
// tests so queries don't see wheels left by previous renders.
afterEach(() => {
  cleanup();
});

/**
 * Flavor wheel tests (design.md D1, D4–D5, D7–D10; the `feedback` spec
 * "Flavor wheel" and "Flavor wheel note list"; design-summary §10). jsdom has
 * no layout, so the wheel is asserted through its SVG attributes, its
 * `data-note` segment groups, the note rows' ARIA and the exact classes the
 * build chose for design.md D8 and design-summary §6.
 */

function note(
  id: string,
  level: 0 | 1 | 2,
  count: number,
  extra: Partial<FlavorWheelNode> = {},
): FlavorWheelNode {
  const name = id[0].toUpperCase() + id.slice(1);
  return {
    id,
    name,
    description: `${name} description`,
    color: "#336699",
    level,
    count,
    countLabel: `${count} of 5 evaluators`,
    children: [],
    ...extra,
  };
}

const NODES: FlavorWheelNode[] = [
  note("fruity", 0, 4, {
    color: "#da1d23",
    children: [
      note("berry", 1, 4, {
        color: "#dd4c51",
        children: [note("strawberry", 2, 2, { color: "#ef5a78" })],
      }),
      note("dried", 1, 2, { color: "#ca4a43" }),
    ],
  }),
  note("floral", 0, 3, {
    color: "#f7f1bd",
    children: [note("jasmine", 1, 3, { color: "#f1d56f", description: null })],
  }),
  note("nutty", 0, 1, { color: "#a87b64" }),
];

const TEXTS = {
  label: "texts.label",
  hint: "texts.hint",
  emptyMessage: "texts.emptyMessage",
};

function renderWheel(props: Partial<FlavorWheelProps> = {}) {
  return render(
    <FlavorWheel nodes={NODES} total={5} texts={TEXTS} {...props} />,
  );
}

/** The segment group of a note in the SVG. */
function segment(container: HTMLElement, id: string): SVGGElement | null {
  return container.querySelector(`svg g[data-note="${id}"]`);
}

/** The note ids of the drawn segments, in drawing order. */
function segmentIds(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("svg g[data-note]")).map(
    (g) => g.getAttribute("data-note") ?? "",
  );
}

function rows(): HTMLElement[] {
  return screen.queryAllByRole("treeitem");
}

function row(name: string): HTMLElement {
  return screen.getByRole("treeitem", { name: new RegExp(`^${name},`) });
}

function panel(container: HTMLElement): HTMLElement {
  return container.querySelector(
    '[data-slot="flavor-wheel-panel"]',
  ) as HTMLElement;
}

const ROW_CLASSES =
  "flex min-h-10 cursor-pointer items-center gap-2 rounded-field px-2 py-1 text-text-primary hover:bg-surface-section focus-visible:focus-ring";

describe("FlavorWheel — initial render", () => {
  it("draws only the level-0 segments, one per root", () => {
    const { container } = renderWheel();
    expect(segmentIds(container)).toEqual(["fruity", "floral", "nutty"]);
    expect(container.querySelectorAll("svg g[data-note] > path")).toHaveLength(
      3,
    );
  });

  it("shows the total at the centre", () => {
    const { container } = renderWheel();
    const centre = container.querySelector("svg > text");
    expect(centre?.textContent).toBe("5");
    expect(centre?.getAttribute("class")).toBe(
      "fill-text-primary font-serif font-bold",
    );
    expect(centre?.getAttribute("font-size")).toBe("28");
  });

  it("shows the hint paragraph in the panel", () => {
    const { container } = renderWheel();
    const hint = panel(container).querySelector("p");
    expect(hint?.textContent).toBe("texts.hint");
    expect(hint?.className).toBe("type-body");
  });

  it("renders a figure with a visually hidden caption and an aria-hidden SVG", () => {
    const { container } = renderWheel();
    const figure = container.querySelector("figure");
    expect(figure?.className).toBe("@container");
    const caption = figure?.querySelector("figcaption");
    expect(caption?.textContent).toBe("texts.label");
    expect(caption?.className).toBe("sr-only");
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("viewBox")).toBe("-204 -204 408 408");
  });

  it("lays out by container width: stacked, then two columns from 42rem", () => {
    const { container } = renderWheel();
    const layout = container.querySelector("figure > div");
    expect(layout?.className).toBe(
      "flex flex-col gap-6 @2xl:grid @2xl:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] @2xl:grid-rows-[auto_1fr] @2xl:gap-x-8 @2xl:gap-y-6",
    );
    const wheel = container.querySelector("svg")?.parentElement;
    expect(wheel?.className).toBe(
      "mx-auto aspect-square w-full max-w-100 @2xl:row-span-2 @2xl:mx-0 @2xl:self-start",
    );
    expect(panel(container).className).toBe(
      "flex min-h-24 flex-col gap-2 rounded-field border border-border-subtle p-4",
    );
    expect(screen.getByRole("tree").className).toBe("flex flex-col gap-1");
  });
});

describe("FlavorWheel — taxonomy colour treatment", () => {
  it("fills each segment with its colour at the depth opacity of its level", () => {
    const { container } = renderWheel();
    fireEvent.click(segment(container, "fruity")!);
    fireEvent.click(segment(container, "berry")!);
    const expected: [string, string, string][] = [
      ["fruity", "#da1d23", "1"],
      ["berry", "#dd4c51", "0.92"],
      ["strawberry", "#ef5a78", "0.85"],
    ];
    for (const [id, color, opacity] of expected) {
      const path = segment(container, id)!.querySelector("path")!;
      expect(path.getAttribute("fill")).toBe(color);
      expect(path.getAttribute("fill-opacity")).toBe(opacity);
      expect(path.getAttribute("class")).toBe("stroke-surface-card");
      expect(path.getAttribute("stroke-width")).toBe("2");
    }
  });

  it("puts the label rule of each theme on the segment group under data-taxonomy", () => {
    const { container } = renderWheel();
    fireEvent.click(segment(container, "fruity")!);
    for (const [id, color, level] of [
      ["fruity", "#da1d23", 0],
      ["dried", "#ca4a43", 1],
    ] as const) {
      const group = segment(container, id)!;
      const rule = taxonomyColorRule(color, level);
      expect(group.hasAttribute("data-taxonomy")).toBe(true);
      expect(group.style.getPropertyValue("--taxonomy-label")).toBe(rule.label);
      expect(group.style.getPropertyValue("--taxonomy-label-dark")).toBe(
        rule.labelDark,
      );
      expect(group.getAttribute("class")).toBe("cursor-pointer");
    }
  });
});

describe("FlavorWheel — note list", () => {
  it("is a flat tree of level-0 rows at first", () => {
    renderWheel();
    const tree = screen.getByRole("tree", { name: "texts.label" });
    expect(tree.tagName).toBe("UL");
    expect(rows().map((r) => r.getAttribute("aria-label"))).toEqual([
      "Fruity, 4 of 5 evaluators",
      "Floral, 3 of 5 evaluators",
      "Nutty, 1 of 5 evaluators",
    ]);
  });

  it("carries level, set size, position and expansion on each row", () => {
    renderWheel();
    const fruity = row("Fruity");
    expect(fruity.tagName).toBe("LI");
    expect(fruity.getAttribute("aria-level")).toBe("1");
    expect(fruity.getAttribute("aria-setsize")).toBe("3");
    expect(fruity.getAttribute("aria-posinset")).toBe("1");
    expect(fruity.getAttribute("aria-expanded")).toBe("false");
    const nutty = row("Nutty");
    expect(nutty.getAttribute("aria-posinset")).toBe("3");
    expect(nutty.hasAttribute("aria-expanded")).toBe(false);
  });

  it("shows the chevron on parents and a spacer on leaves, then the swatch, the name and the count", () => {
    renderWheel();
    const fruity = row("Fruity");
    expect(fruity.className).toBe(ROW_CLASSES);
    const [lead, swatch, name, count] = Array.from(fruity.children);
    expect(lead.tagName.toLowerCase()).toBe("svg");
    expect(lead.getAttribute("aria-hidden")).toBe("true");
    expect(lead.getAttribute("class")).toContain("lucide-chevron-right");
    expect(lead.getAttribute("class")).toContain("size-4 shrink-0");
    expect(swatch.className).toBe("size-3 shrink-0 rounded-check");
    expect(swatch.getAttribute("aria-hidden")).toBe("true");
    expect((swatch as HTMLElement).style.backgroundColor).toBe(
      "rgb(218, 29, 35)",
    );
    expect(name.textContent).toBe("Fruity");
    expect(name.className).toBe("type-body min-w-0 flex-1 break-words");
    expect(count.textContent).toBe("4/5");
    expect(count.className).toBe("type-body shrink-0 tabular-nums");

    const [spacer] = Array.from(row("Nutty").children);
    expect(spacer.tagName).toBe("SPAN");
    expect(spacer.className).toBe("size-4 shrink-0");
    expect(spacer.getAttribute("aria-hidden")).toBe("true");
  });

  it("indents rows by level and reduces the swatch by depth", () => {
    const { container } = renderWheel();
    fireEvent.click(segment(container, "fruity")!);
    fireEvent.click(segment(container, "berry")!);
    expect(row("Berry").className).toBe(
      `${ROW_CLASSES} bg-surface-section ms-6`,
    );
    expect(row("Strawberry").className).toBe(`${ROW_CLASSES} ms-12`);
    const swatch = row("Strawberry").children[1] as HTMLElement;
    expect(swatch.style.opacity).toBe("0.85");
  });
});

describe("FlavorWheel — active note", () => {
  it("activates a note when the pointer enters its segment", () => {
    const { container } = renderWheel();
    fireEvent.pointerEnter(segment(container, "floral")!);
    const box = panel(container);
    expect(box.querySelector(".type-subheading")?.textContent).toBe("Floral");
    expect(box.textContent).toContain("3/5");
    const description = box.querySelector("#flavor-wheel-desc-floral");
    expect(description?.textContent).toBe("Floral description");
    expect(description?.className).toBe("type-body");
    expect(box.textContent).not.toContain("texts.hint");
  });

  it("activates a note when the pointer enters its row", () => {
    const { container } = renderWheel();
    fireEvent.pointerEnter(row("Nutty"));
    expect(
      panel(container).querySelector(".type-subheading")?.textContent,
    ).toBe("Nutty");
  });

  it("lays out the panel header with the swatch, the name and the count", () => {
    const { container } = renderWheel();
    fireEvent.pointerEnter(row("Fruity"));
    const header = panel(container).firstElementChild as HTMLElement;
    expect(header.className).toBe("flex flex-wrap items-center gap-2");
    const [swatch, name, count] = Array.from(header.children);
    expect(swatch.className).toBe("size-3 shrink-0 rounded-check");
    expect(swatch.getAttribute("aria-hidden")).toBe("true");
    expect(name.className).toBe("type-subheading");
    expect(count.textContent).toBe("4/5");
    expect(count.className).toBe("type-body ms-auto tabular-nums");
  });

  it("gives the active row and segment their active treatment", () => {
    const { container } = renderWheel();
    fireEvent.pointerEnter(segment(container, "floral")!);
    expect(row("Floral").className).toBe(`${ROW_CLASSES} bg-surface-section`);
    expect(row("Fruity").className).toBe(ROW_CLASSES);
    const outlines = container.querySelectorAll("svg path.stroke-text-primary");
    expect(outlines).toHaveLength(1);
    const outline = outlines[0];
    expect(outline.getAttribute("d")).toBe(
      segment(container, "floral")!.querySelector("path")!.getAttribute("d"),
    );
    expect(outline.getAttribute("class")).toBe(
      "pointer-events-none fill-none stroke-text-primary",
    );
    expect(outline.getAttribute("stroke-width")).toBe("3");
    // Drawn last, above every segment.
    expect(container.querySelector("svg")!.lastElementChild).toBe(outline);
  });

  it("points the active row's aria-describedby at the panel description", () => {
    const { container } = renderWheel();
    fireEvent.pointerEnter(row("Fruity"));
    const id = row("Fruity").getAttribute("aria-describedby");
    expect(id).toBe("flavor-wheel-desc-fruity");
    expect(container.querySelector(`#${id}`)?.textContent).toBe(
      "Fruity description",
    );
    expect(row("Floral").hasAttribute("aria-describedby")).toBe(false);
  });

  it("keeps the last active note when the pointer leaves the wheel", () => {
    const { container } = renderWheel();
    fireEvent.pointerEnter(segment(container, "fruity")!);
    fireEvent.pointerLeave(segment(container, "fruity")!);
    fireEvent.pointerLeave(container.querySelector("figure")!);
    expect(
      panel(container).querySelector(".type-subheading")?.textContent,
    ).toBe("Fruity");
    expect(panel(container).textContent).not.toContain("texts.hint");
  });

  it("renders no description paragraph for a note without description", () => {
    const { container } = renderWheel();
    fireEvent.click(row("Floral"));
    fireEvent.pointerEnter(row("Jasmine"));
    const box = panel(container);
    expect(box.querySelector(".type-subheading")?.textContent).toBe("Jasmine");
    expect(box.textContent).toContain("3/5");
    expect(box.querySelector("#flavor-wheel-desc-jasmine")).toBeNull();
    expect(box.querySelectorAll("p")).toHaveLength(0);
    expect(row("Jasmine").hasAttribute("aria-describedby")).toBe(false);
  });
});

describe("FlavorWheel — expand and collapse", () => {
  it("expands a parent one level when its segment is clicked, and collapses it on a second click", () => {
    const { container } = renderWheel();
    fireEvent.click(segment(container, "fruity")!);
    expect(segmentIds(container)).toEqual([
      "fruity",
      "berry",
      "dried",
      "floral",
      "nutty",
    ]);
    expect(rows().map((r) => r.textContent)).toEqual([
      "Fruity4/5",
      "Berry4/5",
      "Dried2/5",
      "Floral3/5",
      "Nutty1/5",
    ]);
    expect(row("Fruity").getAttribute("aria-expanded")).toBe("true");
    expect(row("Fruity").children[0].getAttribute("class")).toContain(
      "lucide-chevron-down",
    );
    expect(row("Berry").getAttribute("aria-level")).toBe("2");
    expect(row("Berry").getAttribute("aria-setsize")).toBe("2");
    expect(row("Dried").getAttribute("aria-posinset")).toBe("2");

    fireEvent.click(segment(container, "fruity")!);
    expect(segmentIds(container)).toEqual(["fruity", "floral", "nutty"]);
    expect(rows()).toHaveLength(3);
    expect(row("Fruity").getAttribute("aria-expanded")).toBe("false");
  });

  it("expands and collapses from the row as well, with several notes open at once", () => {
    const { container } = renderWheel();
    fireEvent.click(row("Fruity"));
    fireEvent.click(row("Floral"));
    expect(segmentIds(container)).toEqual([
      "fruity",
      "berry",
      "dried",
      "floral",
      "jasmine",
      "nutty",
    ]);
    fireEvent.click(row("Floral"));
    expect(segmentIds(container)).toEqual([
      "fruity",
      "berry",
      "dried",
      "floral",
      "nutty",
    ]);
  });

  it("collapses the descendants of a collapsed note", () => {
    const { container } = renderWheel();
    fireEvent.click(row("Fruity"));
    fireEvent.click(row("Berry"));
    expect(segmentIds(container)).toContain("strawberry");
    fireEvent.click(row("Fruity"));
    fireEvent.click(row("Fruity"));
    expect(segmentIds(container)).not.toContain("strawberry");
    expect(row("Berry").getAttribute("aria-expanded")).toBe("false");
  });

  it("makes the clicked note active without moving focus", () => {
    const { container } = renderWheel();
    const before = document.activeElement;
    fireEvent.click(segment(container, "floral")!);
    expect(row("Floral").className).toBe(`${ROW_CLASSES} bg-surface-section`);
    expect(
      panel(container).querySelector(".type-subheading")?.textContent,
    ).toBe("Floral");
    expect(document.activeElement).toBe(before);
  });

  it("activates a leaf on click without expanding anything", () => {
    const { container } = renderWheel();
    fireEvent.click(segment(container, "nutty")!);
    expect(segmentIds(container)).toEqual(["fruity", "floral", "nutty"]);
    expect(row("Nutty").className).toBe(`${ROW_CLASSES} bg-surface-section`);
  });
});

describe("FlavorWheel — segment labels", () => {
  it("labels a wide segment with its name and its count over the total", () => {
    const { container } = renderWheel({
      nodes: [note("fruity", 0, 1), note("floral", 0, 1)],
      total: 5,
    });
    const text = segment(container, "fruity")!.querySelector("text");
    expect(text?.getAttribute("fill")).toBe("currentColor");
    expect(
      Array.from(text?.querySelectorAll("tspan") ?? []).map(
        (t) => t.textContent,
      ),
    ).toEqual(["Fruity", "1/5"]);
  });

  it("draws no label when the segment is too narrow", () => {
    const { container } = renderWheel({
      nodes: [note("fruity", 0, 200), note("floral", 0, 1)],
      total: 5,
    });
    expect(segment(container, "floral")!.querySelector("text")).toBeNull();
    // The dropped label's note stays reachable in the list with its name,
    // its swatch and its count/total legend.
    const [, swatch, name, count] = Array.from(row("Floral").children);
    expect(name.textContent).toBe("Floral");
    expect((swatch as HTMLElement).style.backgroundColor).toBe(
      "rgb(51, 102, 153)",
    );
    expect(count.textContent).toBe("1/5");
  });
});

describe("FlavorWheel — empty state", () => {
  it.each([
    ["total 0", { total: 0 }],
    ["no notes", { nodes: [] }],
  ])("shows only the empty message with %s", (_, props) => {
    const { container } = renderWheel(props);
    const message = screen.getByText("texts.emptyMessage");
    expect(message.tagName).toBe("P");
    expect(message.className).toBe("type-body");
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.queryByRole("tree")).toBeNull();
    expect(
      container.querySelector('[data-slot="flavor-wheel-panel"]'),
    ).toBeNull();
  });
});

describe("FlavorWheel — keyboard on the note list", () => {
  function tabStops(): string[] {
    return rows()
      .filter((r) => r.getAttribute("tabindex") === "0")
      .map((r) => r.textContent ?? "");
  }

  function press(key: string): void {
    fireEvent.keyDown(document.activeElement as Element, { key });
  }

  function focused(): string | null {
    return (document.activeElement as HTMLElement).getAttribute("aria-label");
  }

  it("is one tab stop on the first row before any interaction", () => {
    renderWheel();
    expect(tabStops()).toEqual(["Fruity4/5"]);
    expect(
      rows().filter((r) => r.getAttribute("tabindex") === "-1"),
    ).toHaveLength(2);
  });

  it("moves the tab stop to the last active row", () => {
    const { container } = renderWheel();
    fireEvent.pointerEnter(segment(container, "floral")!);
    expect(tabStops()).toEqual(["Floral3/5"]);
    fireEvent.click(segment(container, "nutty")!);
    expect(tabStops()).toEqual(["Nutty1/5"]);
  });

  it("moves to the next and previous visible rows with Down and Up", () => {
    renderWheel();
    row("Fruity").focus();
    press("ArrowDown");
    expect(focused()).toBe("Floral, 3 of 5 evaluators");
    press("ArrowDown");
    expect(focused()).toBe("Nutty, 1 of 5 evaluators");
    press("ArrowDown");
    expect(focused()).toBe("Nutty, 1 of 5 evaluators");
    press("ArrowUp");
    expect(focused()).toBe("Floral, 3 of 5 evaluators");
    expect(tabStops()).toEqual(["Floral3/5"]);
  });

  it("expands a collapsed parent with Right, then moves to its first child", () => {
    const { container } = renderWheel();
    row("Fruity").focus();
    press("ArrowRight");
    expect(row("Fruity").getAttribute("aria-expanded")).toBe("true");
    expect(segmentIds(container)).toContain("berry");
    expect(focused()).toBe("Fruity, 4 of 5 evaluators");
    press("ArrowRight");
    expect(focused()).toBe("Berry, 4 of 5 evaluators");
  });

  it("collapses an expanded parent with Left, and moves from a child to its parent", () => {
    const { container } = renderWheel();
    row("Fruity").focus();
    press("ArrowRight");
    press("ArrowDown");
    press("ArrowDown");
    expect(focused()).toBe("Dried, 2 of 5 evaluators");
    press("ArrowLeft");
    expect(focused()).toBe("Fruity, 4 of 5 evaluators");
    press("ArrowLeft");
    expect(row("Fruity").getAttribute("aria-expanded")).toBe("false");
    expect(segmentIds(container)).toEqual(["fruity", "floral", "nutty"]);
    expect(focused()).toBe("Fruity, 4 of 5 evaluators");
  });

  it("moves to the first and last visible rows with Home and End", () => {
    renderWheel();
    row("Floral").focus();
    press("End");
    expect(focused()).toBe("Nutty, 1 of 5 evaluators");
    press("Home");
    expect(focused()).toBe("Fruity, 4 of 5 evaluators");
  });

  it.each(["Enter", " "])(
    "toggles a parent's expansion with %j, its segments following",
    (key) => {
      const { container } = renderWheel();
      row("Floral").focus();
      press(key);
      expect(row("Floral").getAttribute("aria-expanded")).toBe("true");
      expect(segmentIds(container)).toContain("jasmine");
      expect(rows().map((r) => r.textContent)).toContain("Jasmine3/5");
      press(key);
      expect(row("Floral").getAttribute("aria-expanded")).toBe("false");
      expect(segmentIds(container)).not.toContain("jasmine");
      expect(focused()).toBe("Floral, 3 of 5 evaluators");
    },
  );

  it("makes the focused row's note active: panel and segment highlight follow", () => {
    const { container } = renderWheel();
    row("Fruity").focus();
    press("ArrowDown");
    const box = panel(container);
    expect(box.querySelector(".type-subheading")?.textContent).toBe("Floral");
    expect(box.querySelector("#flavor-wheel-desc-floral")?.textContent).toBe(
      "Floral description",
    );
    expect(row("Floral").getAttribute("aria-describedby")).toBe(
      "flavor-wheel-desc-floral",
    );
    expect(
      container
        .querySelector("svg path.stroke-text-primary")
        ?.getAttribute("d"),
    ).toBe(
      segment(container, "floral")!.querySelector("path")!.getAttribute("d"),
    );
  });

  it("collapses every note with Escape and focuses the level-0 ancestor", () => {
    const { container } = renderWheel();
    row("Fruity").focus();
    press("ArrowRight");
    press("ArrowRight");
    press("ArrowRight");
    press("ArrowRight");
    expect(focused()).toBe("Strawberry, 2 of 5 evaluators");
    fireEvent.click(row("Floral"));
    expect(segmentIds(container)).toContain("jasmine");
    row("Strawberry").focus();
    press("Escape");
    expect(segmentIds(container)).toEqual(["fruity", "floral", "nutty"]);
    expect(rows()).toHaveLength(3);
    expect(focused()).toBe("Fruity, 4 of 5 evaluators");
    expect(tabStops()).toEqual(["Fruity4/5"]);
  });
});
