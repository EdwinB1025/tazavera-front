import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { FlavorWheel } from "@/shared/ui/FlavorWheel";
import type { FlavorWheelNode, FlavorWheelProps } from "@/shared/ui/FlavorWheel";

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
  notesToggle: "texts.notesToggle",
};

/** The note list's expand control (review round 1, design.md D7). */
function notesToggle(): HTMLElement {
  return screen.getByRole("button", { name: "texts.notesToggle" });
}

/**
 * Renders the wheel and, unless `listOpen` is false, expands the note list
 * (collapsed by default) so the tree and its rows are queryable.
 */
function renderWheel(
  props: Partial<FlavorWheelProps> = {},
  { listOpen = true }: { listOpen?: boolean } = {},
) {
  const result = render(
    <FlavorWheel nodes={NODES} total={5} texts={TEXTS} {...props} />,
  );
  if (listOpen && screen.queryByRole("button", { name: "texts.notesToggle" })) {
    fireEvent.click(notesToggle());
  }
  return result;
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
  it("shows the hint paragraph in the panel", () => {
    const { container } = renderWheel();
    const hint = panel(container).querySelector("p");
    expect(hint?.textContent).toBe("texts.hint");
    expect(hint?.className).toBe("type-body");
  });

  it("renders a figure with a visually hidden caption and an aria-hidden SVG", () => {
    const { container } = renderWheel();
    const figure = container.querySelector("figure");
    expect(figure).not.toBeNull();
    const caption = figure?.querySelector("figcaption");
    expect(caption?.textContent).toBe("texts.label");
    expect(caption?.className).toBe("sr-only");
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("viewBox")).toBe("-204 -204 408 408");
  });

  // stack-flavor-wheel-layout D1: stacked on every width (the layout and
  // wheel classes are asserted by the validation suite).
  it("stacks the wheel, the panel and the note-list section", () => {
    const { container } = renderWheel();
    const layout = container.querySelector("figure > div");
    // After the wheel: the panel, then the note-list section.
    expect(
      Array.from(layout?.children ?? [])
        .slice(1)
        .map((child) => child.getAttribute("data-slot") ?? child.tagName),
    ).toEqual(["flavor-wheel-panel", "DIV"]);
    const section = layout?.children[2] as HTMLElement;
    expect(section.className).toBe("flex flex-col");
    expect(section.children[0].tagName).toBe("BUTTON");
    expect(section.children[0]).toBe(notesToggle());
    expect(section.children[1].contains(screen.getByRole("tree"))).toBe(true);
    expect(section.children[1].id).toBe(
      notesToggle().getAttribute("aria-controls"),
    );
    expect(panel(container).className).toBe(
      "flex min-h-24 flex-col gap-2 rounded-field border border-border-subtle p-4",
    );
    expect(screen.getByRole("tree").className).toBe("flex flex-col gap-1 pt-2");
  });
});

describe("FlavorWheel — note list disclosure", () => {
  it("keeps the wheel's expansion and the active note across list toggles", () => {
    const { container } = renderWheel({}, { listOpen: false });
    fireEvent.click(segment(container, "fruity")!);
    fireEvent.click(notesToggle());
    fireEvent.click(notesToggle());
    expect(segmentIds(container)).toContain("berry");
    fireEvent.click(notesToggle());
    expect(row("Berry")).toBeDefined();
    expect(row("Fruity").className).toBe(`${ROW_CLASSES} bg-surface-section`);
    expect(
      panel(container).querySelector(".type-subheading")?.textContent,
    ).toBe("Fruity");
  });
});

describe("FlavorWheel — active note", () => {
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
      "pointer-events-none stroke-text-primary",
    );
    expect(outline.getAttribute("fill")).toBe("none");
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
});

describe("FlavorWheel — expand and collapse", () => {
  it("activates a leaf on click without expanding anything", () => {
    const { container } = renderWheel();
    // The wheel draws every level (stack-flavor-wheel-layout D2); expansion
    // only changes the note list, which keeps its three level-0 rows.
    const before = segmentIds(container);
    fireEvent.click(segment(container, "nutty")!);
    expect(segmentIds(container)).toEqual(before);
    expect(screen.getAllByRole("treeitem")).toHaveLength(3);
    expect(row("Nutty").className).toBe(`${ROW_CLASSES} bg-surface-section`);
  });
});

describe("FlavorWheel — segment labels", () => {
  it("gives every wheel its own label path ids", () => {
    const nodes = [note("fruity", 0, 1), note("floral", 0, 1)];
    render(<FlavorWheel nodes={nodes} total={5} texts={TEXTS} />);
    render(<FlavorWheel nodes={nodes} total={5} texts={TEXTS} />);
    const hrefs = Array.from(document.querySelectorAll("textPath")).map((t) =>
      t.getAttribute("href"),
    );
    expect(hrefs).toHaveLength(8);
    expect(new Set(hrefs).size).toBe(8);
  });

  it("labels the ring-1 segments of an expanded note along their arcs", () => {
    const { container } = renderWheel();
    fireEvent.click(segment(container, "fruity")!);
    for (const id of ["berry", "dried"]) {
      expect(
        segment(container, id)!.querySelector("text textPath"),
      ).not.toBeNull();
    }
  });
});

describe("FlavorWheel — name shown while active", () => {
  const NARROW = [note("fruity", 0, 200), note("floral", 0, 1)];

  /** The SVG texts that read exactly `name`. */
  function namesInWheel(container: HTMLElement, name: string): Element[] {
    return Array.from(container.querySelectorAll("svg text")).filter(
      (t) => t.textContent === name,
    );
  }

  /** The active-only name: the SVG's last child when it is shown. */
  function activeName(container: HTMLElement): Element | null {
    const last = container.querySelector("svg")!.lastElementChild;
    return last?.tagName === "text" ? last : null;
  }

  it("shows no name at rest for a segment whose name cannot fit", () => {
    const { container } = renderWheel({ nodes: NARROW });
    expect(namesInWheel(container, "Floral")).toHaveLength(0);
  });

  it("shows the name when the row is focused or clicked", () => {
    const { container } = renderWheel({ nodes: NARROW });
    // Wrapped in act so the focus handler's state update flushes.
    act(() => row("Floral").focus());
    expect(activeName(container)?.textContent).toBe("Floral");
    fireEvent.pointerEnter(segment(container, "fruity")!);
    fireEvent.click(row("Floral"));
    expect(activeName(container)?.textContent).toBe("Floral");
  });

  it("keeps the name while the note stays active after the pointer leaves", () => {
    const { container } = renderWheel({ nodes: NARROW });
    fireEvent.pointerEnter(segment(container, "floral")!);
    fireEvent.pointerLeave(segment(container, "floral")!);
    fireEvent.pointerLeave(container.querySelector("figure")!);
    expect(activeName(container)?.textContent).toBe("Floral");
  });
});

describe("FlavorWheel — groups (add-offering-catalog design.md D19)", () => {
  const GROUPED: FlavorWheelNode[] = [
    note("body", 0, 2, { color: "#6b6f76", group: "mouthfeel" }),
    note("fruity", 0, 3, { color: "#da1d23", group: "aromatics" }),
    note("floral", 0, 1, { color: "#f7f1bd", group: "aromatics" }),
  ];
  const GROUP_TEXTS = { ...TEXTS, groupsLabel: "texts.groupsLabel" };

  it("shows no group legend without groups", () => {
    const { container } = renderWheel({ nodes: GROUPED, texts: GROUP_TEXTS });
    expect(screen.queryByRole("list", { name: "texts.groupsLabel" })).toBeNull();
    expect(container.querySelector("svg [data-group-legend]")).toBeNull();
  });
});
