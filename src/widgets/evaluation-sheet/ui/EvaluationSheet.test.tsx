import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { EvaluationItem, TaxonomyNode } from "@/shared/api";
import { EvaluationSheet } from "./EvaluationSheet";
import { EVALUATION, SHEET_TEXTS, TAXONOMIES } from "./sheet-fixtures";

/**
 * The read-only evaluation presentation (design.md D8, D10; summary §5.5;
 * spec "Read-only evaluation presentation"; tasks 3.1).
 */

function renderSheet(evaluation: EvaluationItem = EVALUATION, taxonomies: TaxonomyNode[] = TAXONOMIES) {
  return render(
    <EvaluationSheet evaluation={evaluation} taxonomies={taxonomies} locale="en" texts={SHEET_TEXTS} />,
  );
}

function card(name: string): HTMLElement {
  // The card's content box (`CardContent`, 1.5rem padding); its parent is the card.
  return screen.getByRole("heading", { level: 2, name }).closest(".p-6") as HTMLElement;
}

afterEach(cleanup);

describe("EvaluationSheet summary (spec: Summary values)", () => {
  it("shows the score once with its rating word and the three definition rows", () => {
    renderSheet();
    const summary = card("Context");
    expect(within(summary).getByText("84.25").className).toContain("type-score");
    expect(within(summary).getByText("Good")).toBeDefined();
    const header = within(summary).getByRole("heading", { level: 2 }).parentElement as HTMLElement;
    for (const name of ["flex-wrap", "justify-between", "items-center", "gap-2"]) {
      expect(header.className).toContain(name);
    }
    const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(
      new Date(EVALUATION.closedAt as string),
    );
    const terms = within(summary).getAllByRole("term").map((term) => term.textContent);
    const values = within(summary).getAllByRole("definition").map((value) => value.textContent);
    expect(terms).toEqual(["Closed on", "Extraction method", "Defective cup"]);
    expect(values).toEqual([date, "V60", "No"]);
  });
});

describe("EvaluationSheet scales (spec: Intensity and preference values)", () => {
  it("renders seven intensity meters and a bean scale per non-null affective score", () => {
    renderSheet();
    const intensity = within(card("Intensity")).getAllByRole("meter");
    expect(intensity).toHaveLength(7);
    expect(intensity[0]?.getAttribute("aria-valuetext")).toBe("11 de 15");
    expect(within(card("Intensity")).getByText("11/15")).toBeDefined();
    // A null descriptive score renders as 0.
    expect(intensity[6]?.getAttribute("aria-valuenow")).toBe("0");
    const preference = within(card("Preference")).getAllByRole("meter");
    expect(preference).toHaveLength(7);
    expect(preference[0]?.getAttribute("aria-valuetext")).toBe("7 de 9");
    expect(within(card("Preference")).queryByText("Overall")).toBeNull();
  });
});

describe("EvaluationSheet descriptors (spec: Descriptor blocks, An unresolved descriptor reference)", () => {
  it("groups the tastes into the five blocks by type with the empty text on empty blocks", () => {
    // Berry gains a level-2 child, chosen under fragrance (cascade-evaluation-descriptors D6).
    const blackberry = {
      ulid: "01JBLACKBERRY",
      level: 2,
      nameEn: "Blackberry",
      nameEs: "Mora",
      nameCa: "Móra",
      color: "#7a1f35",
      categories: ["aromatics"],
      children: [],
    };
    const [fruity, ...rest] = TAXONOMIES;
    const berry = { ...fruity!.children![0]!, children: [blackberry] };
    renderSheet(
      { ...EVALUATION, tastes: [...(EVALUATION.tastes ?? []), { ref: "01JBLACKBERRY", type: "fragrance" }] },
      [{ ...fruity!, children: [berry] } as TaxonomyNode, ...rest],
    );
    const descriptors = card("Descriptors");
    const groups = Array.from(descriptors.querySelectorAll("fieldset"));
    expect(groups.map((group) => group.querySelector("legend")?.textContent)).toEqual([
      "Fragrance / Aroma",
      "Flavor / Aftertaste",
      "Main tastes",
      "Mouthfeel",
      "Defects",
    ]);
    expect(within(groups[0]!).getByText("Berry")).toBeDefined();
    expect(within(within(groups[0]!).getByRole("group", { name: "Berry" })).getByText("Blackberry")).toBeDefined();
    expect(within(groups[2]!).getByText("Sweet")).toBeDefined();
    // The unresolved ref of Flavor / Aftertaste renders no badge.
    expect(within(groups[1]!).getByText("No descriptors.")).toBeDefined();
    expect(within(groups[4]!).getByText("No descriptors.")).toBeDefined();
  });
});

describe("EvaluationSheet conditional blocks (spec: Conditional blocks)", () => {
  it("renders no Notes and no Extrinsic attributes when every value is null", () => {
    renderSheet();
    expect(screen.queryByRole("heading", { name: "Notes" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Extrinsic attributes" })).toBeNull();
  });
});
