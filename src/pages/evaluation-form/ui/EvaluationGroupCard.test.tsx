import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { EVALUATION_GROUPS, emptyFormState } from "@/entities/evaluation";
import type { GroupKey } from "@/entities/evaluation";
import { EvaluationGroupCard } from "./EvaluationGroupCard";
import { FORM_TEXTS } from "./form-fixtures";

/**
 * One CVA group card (design.md D14; the summary §9; tasks 4.1): the collapse
 * toggle below `md`, the static header from `md`, and the parts' columns.
 */

afterEach(cleanup);

function renderGroup(key: GroupKey, complete?: boolean) {
  const group = EVALUATION_GROUPS.find((candidate) => candidate.key === key)!;
  return render(
    <EvaluationGroupCard
      group={group}
      state={emptyFormState("medium")}
      onChange={vi.fn()}
      texts={FORM_TEXTS.group}
      complete={complete}
    />,
  );
}

describe("EvaluationGroupCard (design.md D14)", () => {
  it("below md, the header is a full-width toggle named by the group that shows and hides the body", () => {
    const { container } = renderGroup("fragranceAroma", false);
    const toggle = screen.getByRole("button", { name: "Fragrance / Aroma" });
    expect(toggle.closest(".md\\:hidden")).not.toBeNull();
    expect(toggle.className).toContain("w-full");
    expect(toggle.className).toContain("focus-visible:focus-ring");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(within(toggle).getByText("Incomplete")).toBeDefined();
    expect(toggle.querySelector("svg")).not.toBeNull();
    const body = container.querySelector(`#${toggle.getAttribute("aria-controls")}`)!;
    expect(body.className).not.toContain("hidden");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(body.className).toContain("hidden");
    expect(body.className).toContain("md:block");
  });

  it("from md, the header is static and not interactive", () => {
    const { container } = renderGroup("acidity", true);
    const header = container.querySelector(".hidden.md\\:flex") as HTMLElement;
    expect(header).not.toBeNull();
    expect(header.querySelector("button")).toBeNull();
    expect(within(header).getByRole("heading", { level: 3, name: "Acidity" }).className).toContain(
      "type-subheading",
    );
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
