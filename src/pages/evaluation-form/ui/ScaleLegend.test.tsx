import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScaleLegend } from "./ScaleLegend";
import { FORM_TEXTS } from "./form-fixtures";

/**
 * The 1–9 legend "Affective quality impression" (design.md D16, D18; tasks
 * 12.2, 13.1): a collapsible section card listing the nine values in order, each with its
 * bean mark, its number and its label.
 */

afterEach(cleanup);

const LABELS = [
  "Extremely low",
  "Very low",
  "Moderately low",
  "Slightly low",
  "Neither high nor low",
  "Slightly high",
  "Moderately high",
  "Very high",
  "Extremely high",
];

function renderLegend(defaultOpen?: boolean) {
  return render(<ScaleLegend texts={FORM_TEXTS.legend} defaultOpen={defaultOpen} />);
}

describe("ScaleLegend (design.md D16)", () => {
  it("draws each number inside its bean mark (design.md D18; tasks 13.3)", () => {
    const { container } = renderLegend(true);
    const items = Array.from(container.querySelectorAll("ol > li"));
    expect(items.map((item) => item.textContent)).toEqual(
      LABELS.map((label, index) => `${index + 1}${label}`),
    );
    items.forEach((item, index) => {
      const mark = item.querySelector("svg")!;
      expect(mark.getAttribute("aria-hidden")).toBe("true");
      const wrapper = mark.parentElement as HTMLElement;
      expect(wrapper.children).toHaveLength(2);
      const number = Array.from(wrapper.children).find((child) => child !== mark) as HTMLElement;
      expect(number.textContent).toBe(String(index + 1));
      expect(number.hasAttribute("aria-hidden")).toBe(false);
      expect(number.className.split(" ")).toEqual(
        expect.arrayContaining([
          "text-text-inverse",
          "font-bold",
          "[-webkit-text-stroke:2px_var(--color-evaluation-bean-on)]",
          "[paint-order:stroke_fill]",
        ]),
      );
    });
  });

  it("is a section card whose band holds the collapsible header", () => {
    const { container } = renderLegend();
    const card = container.querySelector("[data-legend]") as HTMLElement;
    const cardClasses = card.className.split(" ");
    expect(cardClasses).toEqual(expect.arrayContaining(["border", "border-border-subtle"]));
    expect(cardClasses).not.toContain("border-l-4");
    expect(cardClasses).not.toContain("border-border-accent");
    const header = screen.getByRole("button", { name: "Affective quality impression" });
    const aside = header.parentElement!.parentElement as HTMLElement;
    const collapsed = aside.className.split(" ");
    expect(collapsed).toEqual(
      expect.arrayContaining([
        "bg-surface-section",
        "has-[[aria-expanded]]:p-2",
        "md:has-[[aria-expanded]]:px-4",
        "has-[[aria-expanded=false]]:border-b-0",
      ]),
    );
    for (const own of ["px-2", "py-2", "border-b-0"]) expect(collapsed).not.toContain(own);
    fireEvent.click(header);
    expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(aside.className.split(" ")).toEqual(collapsed);
  });
});
