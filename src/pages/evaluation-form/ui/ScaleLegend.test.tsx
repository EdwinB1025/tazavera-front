import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  it("renders the shared collapsible header in a level-3 heading, named by the title, with no description", () => {
    const { container } = renderLegend();
    expect(container.querySelectorAll("button[aria-expanded]")).toHaveLength(1);
    const header = screen.getByRole("button", { name: "Affective quality impression" });
    expect(header.parentElement?.tagName).toBe("H3");
    expect(header.hasAttribute("aria-describedby")).toBe(false);
  });

  it("starts collapsed with an inert body and expands on a click", () => {
    const { container } = renderLegend();
    const header = screen.getByRole("button", { name: "Affective quality impression" });
    const body = container.querySelector(`#${header.getAttribute("aria-controls")}`)!;
    expect(header.getAttribute("aria-expanded")).toBe("false");
    expect(body.hasAttribute("inert")).toBe(true);
    fireEvent.click(header);
    expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(body.hasAttribute("inert")).toBe(false);
  });

  it("lists the nine values in order 1 to 9, each with its number, label and a hidden bean mark", () => {
    const { container } = renderLegend(true);
    const header = screen.getByRole("button", { name: "Affective quality impression" });
    const body = container.querySelector(`#${header.getAttribute("aria-controls")}`) as HTMLElement;
    const list = within(body).getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(
      LABELS.map((label, index) => `${index + 1}${label}`),
    );
    for (const item of items) {
      const marks = item.querySelectorAll("svg");
      expect(marks).toHaveLength(1);
      expect(marks[0].getAttribute("aria-hidden")).toBe("true");
    }
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
