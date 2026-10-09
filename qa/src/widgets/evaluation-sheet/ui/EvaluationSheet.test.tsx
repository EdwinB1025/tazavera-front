import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { EvaluationItem } from "@/shared/api";
import { EvaluationSheet } from "@/widgets/evaluation-sheet/ui/EvaluationSheet";
import { EVALUATION, SHEET_TEXTS, TAXONOMIES } from "@/widgets/evaluation-sheet/ui/sheet-fixtures";

/**
 * The read-only evaluation presentation (design.md D8, D10; summary §5.5;
 * spec "Read-only evaluation presentation"; tasks 3.1).
 */

function renderSheet(evaluation: EvaluationItem = EVALUATION) {
  return render(
    <EvaluationSheet evaluation={evaluation} taxonomies={TAXONOMIES} locale="en" texts={SHEET_TEXTS} />,
  );
}

function card(name: string): HTMLElement {
  // The card's content box (`CardContent`, 1.5rem padding); its parent is the card.
  return screen.getByRole("heading", { level: 2, name }).closest(".p-6") as HTMLElement;
}

afterEach(cleanup);

describe("EvaluationSheet layout (design.md D8, D10)", () => {
  it("lays the cards on the sheet grid, Summary and Descriptors spanning both columns", () => {
    const { container } = renderSheet();
    const grid = container.firstElementChild as HTMLElement;
    for (const name of ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2"]) {
      expect(grid.className).toContain(name);
    }
    expect(card("Context").parentElement?.className).toContain("lg:col-span-2");
    expect(card("Descriptors").parentElement?.className).toContain("lg:col-span-2");
    expect(card("Intensity").parentElement?.className).not.toContain("lg:col-span-2");
    const heading = screen.getByRole("heading", { level: 2, name: "Preference" });
    expect(heading.className).toContain("type-subheading");
    const shell = card("Preference").parentElement as HTMLElement;
    for (const name of ["border-border-accent", "rounded-container", "shadow-lg"]) {
      expect(shell.className).toContain(name);
    }
  });
});

describe("EvaluationSheet summary (spec: Summary values)", () => {

  it("omits Closed on for a null closedAt and shows an unknown extraction method raw", () => {
    renderSheet({ ...EVALUATION, closedAt: null, extractionMethod: "ibrik", isDefective: true });
    const summary = card("Context");
    expect(within(summary).getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Extraction method",
      "Defective cup",
    ]);
    expect(within(summary).getAllByRole("definition").map((value) => value.textContent)).toEqual([
      "ibrik",
      "Yes",
    ]);
  });
});

describe("EvaluationSheet scales (spec: Intensity and preference values)", () => {

  it("omits an affective scale whose score is 0, as an unscored one", () => {
    renderSheet({ ...EVALUATION, affective: { ...EVALUATION.affective, mouthfeel: { score: 0, note: null } } });
    expect(within(card("Preference")).getAllByRole("meter")).toHaveLength(6);
    expect(within(card("Preference")).queryByText("Mouthfeel")).toBeNull();
  });
});

describe("EvaluationSheet conditional blocks (spec: Conditional blocks)", () => {

  it("renders only the non-null entries when some are set", () => {
    renderSheet({
      ...EVALUATION,
      descriptive: { ...EVALUATION.descriptive, acidity: { score: 7, note: "Bright" } },
      affective: { ...EVALUATION.affective, overall: { score: 8, note: "Balanced" } },
      extrinsics: { ...EVALUATION.extrinsics, farming: "Organic" },
    } as EvaluationItem);
    const notes = card("Notes");
    expect(within(notes).getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Intensity · Acidity",
      "Preference · Overall",
    ]);
    expect(within(notes).getByText("Bright").className).toContain("type-body");
    const extrinsics = card("Extrinsic attributes");
    expect(within(extrinsics).getAllByRole("term").map((term) => term.textContent)).toEqual(["Farming"]);
    expect(within(extrinsics).getByText("Organic")).toBeDefined();
  });
});
