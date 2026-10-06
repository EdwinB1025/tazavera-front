import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

/**
 * The evaluation form (design.md D3, D12, D14; spec "Evaluation form"; tasks
 * 4.1 and the later form tasks).
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/entities/evaluation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/evaluation")>()),
  createAnEvaluation: vi.fn(),
  updateAnEvaluation: vi.fn(),
  closeAnEvaluation: vi.fn(),
}));

import { EvaluationForm } from "./EvaluationForm";
import { FORM_TEXTS, OFFERING, OPEN_EVALUATION } from "./form-fixtures";

afterEach(cleanup);

function renderNew() {
  return render(
    <EvaluationForm locale="en" offering={OFFERING} taxonomies={[]} texts={FORM_TEXTS} />,
  );
}

describe("EvaluationForm: header and tree (tasks 4.1)", () => {
  it("renders the page header block", () => {
    renderNew();
    const back = screen.getByRole("link", { name: "My evaluations" });
    expect(back.getAttribute("href")).toBe("/en/manage/evaluations");
    expect(back.className).toContain("inline-flex");
    expect(screen.getByText("Evaluation")).toBeDefined();
    const heading = screen.getByRole("heading", { level: 1, name: "Finca La Esperanza" });
    expect(heading.className).toContain("type-heading");
    expect(screen.getByText("Coffeeshop: Cafè del Born").className).toContain("type-label");
    expect(screen.getByText("Roaster: Nomad").className).toContain("type-label");
  });

  it("prefills the roast level from the offering and offers the nine extraction methods", () => {
    renderNew();
    const roast = screen.getByLabelText(/Roast level/) as HTMLSelectElement;
    expect(roast.value).toBe("medium_light");
    const extraction = screen.getByLabelText("Extraction method") as HTMLSelectElement;
    const options = within(extraction)
      .getAllByRole("option")
      .filter((option) => (option as HTMLOptionElement).value !== "");
    expect(options.map((option) => [(option as HTMLOptionElement).value, option.textContent])).toEqual([
      ["espresso", "Espresso"],
      ["v60", "V60"],
      ["chemex", "Chemex"],
      ["aeropress", "AeroPress"],
      ["french_press", "French press"],
      ["moka", "Moka pot"],
      ["cold_brew", "Cold brew"],
      ["siphon", "Siphon"],
      ["kalita", "Kalita Wave"],
    ]);
    expect(extraction.value).toBe("");
  });

  it("renders the eight group cards in CVA order with their names in type-subheading", () => {
    const { container } = renderNew();
    const names = Array.from(container.querySelectorAll("[data-group] .type-subheading")).filter(
      (element) => element.tagName === "H3",
    );
    expect(names.map((name) => name.textContent)).toEqual([
      "Fragrance / Aroma",
      "Flavor / Aftertaste",
      "Acidity",
      "Sweetness",
      "Mouthfeel",
      "Overall",
      "Defects",
      "Extrinsic",
    ]);
  });

  it("shows a loaded extraction method outside the nine options as-is and keeps it", () => {
    render(
      <EvaluationForm
        locale="en"
        offering={OFFERING}
        taxonomies={[]}
        texts={FORM_TEXTS}
        evaluation={{ ...OPEN_EVALUATION, extractionMethod: "clever dripper" }}
      />,
    );
    const extraction = screen.getByLabelText("Extraction method") as HTMLSelectElement;
    expect(extraction.value).toBe("clever dripper");
    expect(within(extraction).getByRole("option", { name: "clever dripper" })).toBeDefined();
  });

  it("starts a new form with every intensity at 0, no preference, no open note and nothing checked", () => {
    renderNew();
    const sliders = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(sliders).toHaveLength(7);
    expect(sliders.every((slider) => slider.value === "0")).toBe(true);
    expect(screen.getAllByRole("radiogroup")).toHaveLength(8);
    expect(screen.queryAllByRole("radio", { checked: true })).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("checkbox", { checked: true })).toHaveLength(0);
  });

  it("fills the controls of a loaded evaluation", () => {
    render(
      <EvaluationForm
        locale="en"
        offering={OFFERING}
        taxonomies={[]}
        texts={FORM_TEXTS}
        evaluation={OPEN_EVALUATION}
      />,
    );
    expect((screen.getByLabelText("Extraction method") as HTMLSelectElement).value).toBe("chemex");
    const sliders = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(sliders.map((slider) => slider.value)).toEqual(["7", "8", "0", "0", "10", "0", "0"]);
    expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(2);
  });
});
