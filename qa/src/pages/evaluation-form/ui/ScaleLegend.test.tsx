import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScaleLegend } from "@/pages/evaluation-form/ui/ScaleLegend";
import { FORM_TEXTS } from "@/pages/evaluation-form/ui/form-fixtures";

/**
 * The 1–9 legend "Affective quality impression" (design.md D16, D18; tasks
 * 12.2, 13.1): a collapsible section card listing the nine values in order, each with its
 * bean mark, its number and its label.
 */

afterEach(cleanup);

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
});
