import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { EVALUATION_GROUPS, emptyFormState } from "@/entities/evaluation";
import type { GroupKey } from "@/entities/evaluation";
import { EvaluationGroupCard } from "@/pages/evaluation-form/ui/EvaluationGroupCard";
import { FORM_TEXTS } from "@/pages/evaluation-form/ui/form-fixtures";

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
});
