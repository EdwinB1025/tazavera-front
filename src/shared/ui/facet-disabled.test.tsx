import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FacetCascade, FacetRadioList, type CascadeOption, type FacetOption } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Disabled facets (spec filtering "Facet option data unavailable", scenario
 * "Disabled facet"): a disabled facet rejects input, renders at 50% opacity
 * and shows its help text, while the other facets stay enabled.
 */

const HELP = "Options unavailable";
const SEE_MORE = { seeMore: "See more ({count})", seeLess: "See less" };
const CASCADE_TEXTS = SEE_MORE;

const PROCESSES: FacetOption[] = [
  { value: "Washed", label: "Washed" },
  { value: "Natural", label: "Natural" },
];

const FLAVOURS: CascadeOption[] = [
  {
    value: "fruity",
    label: "Fruity",
    color: "#af5e70",
    children: [{ value: "berry", label: "Berry", color: "#c0392b" }],
  },
  { value: "floral", label: "Floral", color: "#336699" },
];

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/);
}

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
