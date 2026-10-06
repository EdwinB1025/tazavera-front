import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FacetRadioList, type FacetOption } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Radio-list facet (spec filtering "Radio-list facet"; design.md D6): "Any"
 * first, facet rows, "See more" above five options.
 */

const TEXTS = { seeMore: "See more ({count})", seeLess: "See less" };
const ROW_REST_TOKENS = ["border-transparent", "hover:shadow-nav-hover"];
const ROW_SELECTED_TOKENS = ["border-nav-indicator", "bg-nav-current-dark", "shadow-nav-current"];

const PROCESSES: FacetOption[] = [
  { value: "Washed", label: "Washed" },
  { value: "Natural", label: "Natural" },
  { value: "Honey", label: "Honey" },
];

const EIGHT: FacetOption[] = Array.from({ length: 8 }, (_, i) => ({
  value: `o${i + 1}`,
  label: `Option ${i + 1}`,
}));

function rowOf(name: string): HTMLElement {
  return screen.getByRole("radio", { name, hidden: true }).closest("label")!;
}

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/);
}

describe("FacetRadioList", () => {
  it('"Any" is the first radio and is checked with no value', () => {
    render(
      <FacetRadioList legend="Process" options={PROCESSES} onChange={() => {}} anyLabel="Any" texts={TEXTS} />,
    );
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios[0]!.closest("label")!.textContent).toBe("Any");
    expect(radios[0]!.checked).toBe(true);
    expect(screen.getByRole("radiogroup", { name: "Process" })).toBeTruthy();
  });

  it('choosing "Washed" reports it and choosing "Any" reports undefined', () => {
    const onChange = vi.fn();
    render(
      <FacetRadioList
        legend="Process"
        options={PROCESSES}
        value="Natural"
        onChange={onChange}
        anyLabel="Any"
        texts={TEXTS}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Washed" }));
    expect(onChange).toHaveBeenLastCalledWith("Washed");
    fireEvent.click(screen.getByRole("radio", { name: "Any" }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('the checked "Any" row carries the rest set and the applied row the selected set', () => {
    const { rerender } = render(
      <FacetRadioList legend="Process" options={PROCESSES} onChange={() => {}} anyLabel="Any" texts={TEXTS} />,
    );
    expect(classesOf(rowOf("Any"))).toEqual(expect.arrayContaining(ROW_REST_TOKENS));
    rerender(
      <FacetRadioList
        legend="Process"
        options={PROCESSES}
        value="Washed"
        onChange={() => {}}
        anyLabel="Any"
        texts={TEXTS}
      />,
    );
    expect(classesOf(rowOf("Washed"))).toEqual(expect.arrayContaining(ROW_SELECTED_TOKENS));
  });

  it("eight options and no value: three hidden rows and See more (3), then See less", () => {
    render(
      <FacetRadioList legend="Process" options={EIGHT} onChange={() => {}} anyLabel="Any" texts={TEXTS} />,
    );
    const hidden = EIGHT.filter((o) => rowOf(o.label).hasAttribute("hidden")).map((o) => o.label);
    expect(hidden).toEqual(["Option 6", "Option 7", "Option 8"]);
    const button = screen.getByRole("button", { name: "See more (3)" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe(screen.getByRole("radiogroup").id);
    fireEvent.click(button);
    expect(EIGHT.some((o) => rowOf(o.label).hasAttribute("hidden"))).toBe(false);
    const less = screen.getByRole("button", { name: "See less" });
    expect(less.getAttribute("aria-expanded")).toBe("true");
  });

  it("the seventh option applied and collapsed: only six and eight hidden, See more (2)", () => {
    render(
      <FacetRadioList
        legend="Process"
        options={EIGHT}
        value="o7"
        onChange={() => {}}
        anyLabel="Any"
        texts={TEXTS}
      />,
    );
    const hidden = EIGHT.filter((o) => rowOf(o.label).hasAttribute("hidden")).map((o) => o.label);
    expect(hidden).toEqual(["Option 6", "Option 8"]);
    expect(screen.getByRole("button", { name: "See more (2)" })).toBeTruthy();
  });

  it("five options render no See more button", () => {
    render(
      <FacetRadioList
        legend="Process"
        options={EIGHT.slice(0, 5)}
        onChange={() => {}}
        anyLabel="Any"
        texts={TEXTS}
      />,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("disabled with help disables the options and shows the help", () => {
    render(
      <FacetRadioList
        legend="Process"
        options={PROCESSES}
        onChange={() => {}}
        anyLabel="Any"
        texts={TEXTS}
        disabled
        help="Options unavailable"
      />,
    );
    for (const radio of screen.getAllByRole("radio") as HTMLInputElement[]) {
      expect(radio.disabled).toBe(true);
    }
    expect(screen.getByText("Options unavailable")).toBeTruthy();
  });
});
