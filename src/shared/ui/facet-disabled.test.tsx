import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  FacetCascade,
  FacetRadioList,
  FacetTextField,
  ScoreRangeFacet,
  type CascadeOption,
  type FacetOption,
} from "@/shared/ui";

afterEach(() => {
  cleanup();
});

// jsdom has no ResizeObserver; Radix Slider measures its thumbs with one.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
});

/**
 * Disabled facets (spec filtering "Facet option data unavailable", scenario
 * "Disabled facet"): a disabled facet rejects input, renders at 50% opacity
 * and shows its help text, while the other facets stay enabled.
 */

const HELP = "Options unavailable";
const SEE_MORE = { seeMore: "See more ({count})", seeLess: "See less" };
const CASCADE_TEXTS = { ...SEE_MORE, toggleChildren: "Options under {label}" };
const RANGE_TEXTS = { minThumb: "Minimum score", maxThumb: "Maximum score", from: "From", to: "To" };

const PROCESSES: FacetOption[] = [
  { value: "Washed", label: "Washed" },
  { value: "Natural", label: "Natural" },
];

const FLAVOURS: CascadeOption[] = [
  { value: "fruity", label: "Fruity", children: [{ value: "berry", label: "Berry" }] },
  { value: "floral", label: "Floral" },
];

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/);
}

function checkbox(name: string): HTMLInputElement {
  return screen.getByRole("checkbox", { name, hidden: true }) as HTMLInputElement;
}

const OPACITY_50 = ["opacity-50", "disabled:opacity-50", "peer-disabled:opacity-50"];

/** Number of 50% opacity classes from `element` up to its row `label`, inclusive. */
function opacityChain(element: Element): number {
  let count = 0;
  let current: Element | null = element;
  while (current) {
    count += classesOf(current).filter((c) => OPACITY_50.includes(c)).length;
    if (current.tagName === "LABEL") break;
    current = current.parentElement;
  }
  return count;
}

describe("Disabled facet row — exactly one 50% opacity along the chain", () => {
  it("a disabled radio row fades once: the row, not the circle or the dot", () => {
    render(
      <FacetRadioList
        legend="Process"
        options={PROCESSES}
        onChange={() => {}}
        anyLabel="Any"
        texts={SEE_MORE}
        disabled
      />,
    );
    const radio = screen.getByRole("radio", { name: "Washed" });
    expect(opacityChain(radio)).toBe(1);
    expect(opacityChain(radio.nextElementSibling!)).toBe(1);
  });

  it("a disabled checkbox row fades once: the row, not the box or the mark", () => {
    render(
      <FacetCascade
        legend="Flavour"
        options={FLAVOURS}
        value={["floral"]}
        onChange={() => {}}
        texts={CASCADE_TEXTS}
        disabled
      />,
    );
    const box = checkbox("Floral");
    expect(opacityChain(box)).toBe(1);
    expect(opacityChain(box.nextElementSibling!)).toBe(1);
  });
});

describe("Disabled facet — 50% opacity", () => {
  it("a disabled facet row is faded and its input does not fade again", () => {
    render(
      <FacetRadioList
        legend="Process"
        options={PROCESSES}
        onChange={() => {}}
        anyLabel="Any"
        texts={SEE_MORE}
        disabled
        help={HELP}
      />,
    );
    const row = screen.getByText("Washed").closest("label")!;
    expect(classesOf(row)).toEqual(expect.arrayContaining(["cursor-not-allowed", "opacity-50"]));
    const radio = screen.getByRole("radio", { name: "Washed" });
    expect(classesOf(radio)).not.toContain("disabled:opacity-50");
  });

  it("a disabled text facet's input carries disabled:opacity-50", () => {
    render(
      <FacetTextField label="Region" value="" onCommit={() => {}} maxLength={90} disabled help={HELP} />,
    );
    const input = screen.getByRole("textbox", { name: "Region" });
    expect(classesOf(input)).toContain("disabled:opacity-50");
  });
});

describe("Disabled FacetCascade", () => {
  it("rejects input, fades its rows and shows the help text", () => {
    const onChange = vi.fn();
    render(
      <FacetCascade
        legend="Flavour"
        options={FLAVOURS}
        value={[]}
        onChange={onChange}
        texts={CASCADE_TEXTS}
        disabled
        help={HELP}
      />,
    );
    for (const name of ["Fruity", "Berry", "Floral"]) {
      expect(checkbox(name).disabled).toBe(true);
    }
    fireEvent.click(screen.getByText("Floral"));
    expect(onChange).not.toHaveBeenCalled();
    const toggle = screen.getByRole("button", { name: "Options under Fruity" }) as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);
    expect(classesOf(toggle)).toContain("disabled:opacity-50");
    const row = screen.getByText("Floral").closest("label")!;
    expect(classesOf(row)).toEqual(expect.arrayContaining(["cursor-not-allowed", "opacity-50"]));
    const help = screen.getByText(HELP);
    expect(screen.getByRole("group", { name: "Flavour" }).getAttribute("aria-describedby")).toBe(
      help.id,
    );
  });
});

describe("Disabled ScoreRangeFacet", () => {
  it("rejects slider and input changes and renders at 50% opacity", () => {
    const onCommit = vi.fn();
    render(
      <ScoreRangeFacet
        legend="Score"
        min={0}
        max={100}
        value={[0, 100]}
        onCommit={onCommit}
        texts={RANGE_TEXTS}
        disabled
      />,
    );
    const min = screen.getByRole("slider", { name: "Minimum score" });
    fireEvent.keyDown(min, { key: "ArrowRight" });
    expect(min.getAttribute("aria-valuenow")).toBe("0");
    const root = min.closest(".touch-none")!;
    expect(root.hasAttribute("data-disabled")).toBe(true);
    expect(classesOf(root)).toContain("data-disabled:opacity-50");
    for (const name of ["From", "To"]) {
      const input = screen.getByRole("spinbutton", { name }) as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(classesOf(input)).toContain("disabled:opacity-50");
    }
    expect(onCommit).not.toHaveBeenCalled();
  });
});

describe("Two facets, one disabled", () => {
  it("the disabled facet rejects input while the other stays enabled", () => {
    const onDisabled = vi.fn();
    const onEnabled = vi.fn();
    render(
      <>
        <FacetCascade
          legend="Flavour"
          options={FLAVOURS}
          value={[]}
          onChange={onDisabled}
          texts={CASCADE_TEXTS}
          disabled
          help={HELP}
        />
        <FacetRadioList
          legend="Process"
          options={PROCESSES}
          onChange={onEnabled}
          anyLabel="Any"
          texts={SEE_MORE}
        />
      </>,
    );
    fireEvent.click(screen.getByText("Floral"));
    expect(onDisabled).not.toHaveBeenCalled();
    const washed = screen.getByRole("radio", { name: "Washed" }) as HTMLInputElement;
    expect(washed.disabled).toBe(false);
    fireEvent.click(screen.getByText("Washed"));
    expect(onEnabled).toHaveBeenCalledWith("Washed");
    expect(screen.getAllByText(HELP)).toHaveLength(1);
  });
});
