import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FacetRadioList, type FacetOption } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Radio-list facet (spec filtering "Radio-list facet"; design.md D6): "Any"
 * first, facet rows, "See more" above five options.
 */

const TEXTS = { seeMore: "See more ({count})", seeLess: "See less" };

const PROCESSES: FacetOption[] = [
  { value: "Washed", label: "Washed" },
  { value: "Natural", label: "Natural" },
  { value: "Honey", label: "Honey" },
];

const EIGHT: FacetOption[] = Array.from({ length: 8 }, (_, i) => ({
  value: `o${i + 1}`,
  label: `Option ${i + 1}`,
}));

describe("FacetRadioList", () => {
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
