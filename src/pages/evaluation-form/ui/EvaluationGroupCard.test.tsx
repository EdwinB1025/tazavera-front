import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { EVALUATION_GROUPS, emptyFormState } from "@/entities/evaluation";
import type { GroupKey } from "@/entities/evaluation";
import { EvaluationGroupCard } from "./EvaluationGroupCard";
import { FORM_TEXTS } from "./form-fixtures";

/**
 * One CVA group card (design.md D14, D15; tasks 4.1, 11.1): the shared
 * collapsible header at every viewport, its initial state and aside spacing,
 * and the parts' columns.
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

  it("starts expanded when read-only", () => {
    renderGroup("acidity", true, true);
    expect(screen.getByRole("button", { name: "Acidity" }).getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  it("pads the header's aside by 0.5rem and draws its bottom border only while expanded", () => {
    renderGroup("acidity", true);
    const header = screen.getByRole("button", { name: "Acidity" });
    const aside = header.parentElement!.parentElement as HTMLElement;
    // `px-2`/`py-2` follow the Card's `p-6` in the generated CSS and override it.
    expect(aside.className.split(" ")).toEqual(expect.arrayContaining(["px-2", "py-2"]));
    expect(aside.className.split(" ")).toContain("border-b-0");
    fireEvent.click(header);
    expect(aside.className.split(" ")).not.toContain("border-b-0");
    expect(aside.className.split(" ")).toContain("border-b");
  });

  it("keeps the indicator inside the header", () => {
    renderGroup("acidity", true);
    const header = screen.getByRole("button", { name: "Acidity" });
    expect(within(header).getByText("Complete")).toBeDefined();
  });

  it("stacks the parts below md and sets two columns from md with the descriptive right border", () => {
    const { container } = renderGroup("fragranceAroma");
    const descriptive = container.querySelector('[data-part="descriptive"]') as HTMLElement;
    const affective = container.querySelector('[data-part="affective"]') as HTMLElement;
    const parts = descriptive.parentElement as HTMLElement;
    expect(parts.className).toContain("flex-col");
    expect(parts.className).toContain("gap-6");
    expect(parts.className).toContain("md:grid-cols-2");
    expect(descriptive.className).toContain("md:border-r");
    expect(descriptive.className).toContain("md:pr-6");
    expect(affective.className).toContain("border-t");
    expect(affective.className).toContain("pt-6");
    expect(affective.className).toContain("md:border-t-0");
    expect(within(descriptive).getAllByRole("slider")).toHaveLength(2);
    expect(within(affective).getAllByRole("radiogroup")).toHaveLength(2);
  });

  it("renders one full-width column for a group without a descriptive part", () => {
    const { container } = renderGroup("overall");
    expect(container.querySelector('[data-part="descriptive"]')).toBeNull();
    const affective = container.querySelector('[data-part="affective"]') as HTMLElement;
    expect((affective.parentElement as HTMLElement).className).not.toContain("md:grid-cols-2");
    expect(affective.className).not.toContain("border-t");
    expect(within(affective).getAllByRole("radiogroup")).toHaveLength(1);
  });

  it("renders no indicator when the group has none", () => {
    renderGroup("defects");
    expect(screen.queryByText("Complete")).toBeNull();
    expect(screen.queryByText("Incomplete")).toBeNull();
  });
});
