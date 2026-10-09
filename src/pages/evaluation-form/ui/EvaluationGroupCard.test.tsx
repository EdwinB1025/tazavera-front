import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { EVALUATION_GROUPS, emptyFormState } from "@/entities/evaluation";
import type { GroupKey } from "@/entities/evaluation";
import { EvaluationGroupCard } from "./EvaluationGroupCard";
import { FORM_TEXTS } from "./form-fixtures";

/**
 * One CVA group card (design.md D14, D15, D18; tasks 4.1, 11.1, 13.1): a
 * section card with the shared collapsible header in its band at every
 * viewport, its initial state, and the parts' columns.
 */

afterEach(cleanup);

function renderGroup(key: GroupKey, complete?: boolean, readOnly?: boolean) {
  const group = EVALUATION_GROUPS.find((candidate) => candidate.key === key)!;
  return render(
    <EvaluationGroupCard
      group={group}
      state={emptyFormState("medium")}
      onChange={vi.fn()}
      texts={FORM_TEXTS.group}
      complete={complete}
      readOnly={readOnly}
    />,
  );
}

describe("EvaluationGroupCard (design.md D14, D15)", () => {
  it("renders one shared collapsible header at every viewport, named by the group", () => {
    const { container } = renderGroup("fragranceAroma", false);
    const buttons = container.querySelectorAll("button[aria-expanded]");
    expect(buttons).toHaveLength(1);
    expect(container.querySelector(".md\\:hidden")).toBeNull();
    expect(container.querySelector(".md\\:flex")).toBeNull();
    const header = screen.getByRole("button", { name: "Fragrance / Aroma" });
    expect(header.parentElement?.tagName).toBe("H3");
    const description = container.querySelector(`#${header.getAttribute("aria-describedby")}`)!;
    expect(within(description as HTMLElement).getByText("Incomplete")).toBeDefined();
    expect(container.querySelector(`#${header.getAttribute("aria-controls")}`)).not.toBeNull();
  });

  it("starts collapsed when editable and expands on a click", () => {
    const { container } = renderGroup("fragranceAroma", false);
    const header = screen.getByRole("button", { name: "Fragrance / Aroma" });
    const body = container.querySelector(`#${header.getAttribute("aria-controls")}`)!;
    expect(header.getAttribute("aria-expanded")).toBe("false");
    expect(body.hasAttribute("inert")).toBe(true);
    fireEvent.click(header);
    expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(body.hasAttribute("inert")).toBe(false);
  });

  it("is a section card whose band holds the collapsible header", () => {
    const { container } = renderGroup("acidity", true);
    const card = container.querySelector("[data-group]") as HTMLElement;
    const cardClasses = card.className.split(" ");
    expect(cardClasses).toEqual(expect.arrayContaining(["border", "border-border-subtle"]));
    expect(cardClasses).not.toContain("border-l-4");
    expect(cardClasses).not.toContain("border-border-accent");
    const header = screen.getByRole("button", { name: "Acidity" });
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

  it("renders no indicator when the group has none", () => {
    renderGroup("defects");
    expect(screen.queryByText("Complete")).toBeNull();
    expect(screen.queryByText("Incomplete")).toBeNull();
  });

  it("shows the Extrinsic group's five fields in the contract's order", () => {
    const { container } = renderGroup("extrinsic");
    fireEvent.click(screen.getByRole("button", { name: "Extrinsic" }));
    const labels = ["Farming", "Processing", "Trading", "Certifications"];
    const areas = labels.map((label) => screen.getByLabelText(label));
    for (const area of areas) expect(area.tagName).toBe("TEXTAREA");
    const fields = [...areas, screen.getByRole("button", { name: "Add note" })];
    const order = [...container.querySelectorAll("textarea, button:not([aria-expanded])")];
    expect(order).toEqual(fields);
  });
});
