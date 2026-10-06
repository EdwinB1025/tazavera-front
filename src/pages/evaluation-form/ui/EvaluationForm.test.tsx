import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

/**
 * The evaluation form (design.md D3, D12, D14; spec "Evaluation form"; tasks
 * 4.1 and the later form tasks).
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const createAnEvaluation = vi.fn();
const updateAnEvaluation = vi.fn();
const closeAnEvaluation = vi.fn();
vi.mock("@/entities/evaluation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/evaluation")>()),
  createAnEvaluation: (...args: unknown[]) => createAnEvaluation(...args),
  updateAnEvaluation: (...args: unknown[]) => updateAnEvaluation(...args),
  closeAnEvaluation: (...args: unknown[]) => closeAnEvaluation(...args),
}));

import { buildCreateBody, emptyFormState } from "@/entities/evaluation";
import { EvaluationForm } from "./EvaluationForm";
import { FORM_TEXTS, OFFERING, OPEN_EVALUATION, TAXONOMIES } from "./form-fixtures";

// Inside a form the Radix radio group measures each bean for its hidden
// native radio; jsdom has no ResizeObserver. Test infrastructure only.
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  createAnEvaluation.mockReset();
  updateAnEvaluation.mockReset();
  closeAnEvaluation.mockReset();
  vi.restoreAllMocks();
});

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

const CREATED = { ...OPEN_EVALUATION, ulid: "01JEVALNEW0000000000000001" };

function renderForm(props: Partial<Parameters<typeof EvaluationForm>[0]> = {}) {
  return render(
    <EvaluationForm
      locale="en"
      offering={OFFERING}
      taxonomies={TAXONOMIES}
      texts={FORM_TEXTS}
      {...props}
    />,
  );
}

function save() {
  fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
}

describe("EvaluationForm: saving a draft (design.md D4; tasks 6.1)", () => {
  it("creates the evaluation on the first save, replaces the route and shows the saved message", async () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    createAnEvaluation.mockResolvedValue({ ok: true, status: 201, data: CREATED });
    renderForm();
    save();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Draft saved."));
    const state = { ...emptyFormState("medium_light"), roastLevel: "medium_light" as const };
    expect(createAnEvaluation).toHaveBeenCalledWith(buildCreateBody(state, OFFERING.ulid!));
    expect(replaceState).toHaveBeenCalledWith(null, "", `/en/manage/evaluations/${CREATED.ulid}`);
    expect(updateAnEvaluation).not.toHaveBeenCalled();
  });

  it("updates the evaluation on a later save, without offeringId, and leaves the route", async () => {
    createAnEvaluation.mockResolvedValue({ ok: true, status: 201, data: CREATED });
    updateAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: CREATED });
    renderForm();
    save();
    await waitFor(() => expect(createAnEvaluation).toHaveBeenCalledTimes(1));
    const replaceState = vi.spyOn(window.history, "replaceState");
    save();
    await waitFor(() => expect(updateAnEvaluation).toHaveBeenCalledTimes(1));
    const [ulid, body] = updateAnEvaluation.mock.calls[0];
    expect(ulid).toBe(CREATED.ulid);
    expect(body).not.toHaveProperty("offeringId");
    expect(replaceState).not.toHaveBeenCalled();
    expect(createAnEvaluation).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Draft saved."));
  });

  it("updates a loaded evaluation and sends a stored extraction method back unchanged", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: OPEN_EVALUATION });
    renderForm({ evaluation: { ...OPEN_EVALUATION, extractionMethod: "clever dripper" } });
    save();
    await waitFor(() => expect(updateAnEvaluation).toHaveBeenCalledTimes(1));
    const [ulid, body] = updateAnEvaluation.mock.calls[0];
    expect(ulid).toBe(OPEN_EVALUATION.ulid);
    expect(body.extractionMethod).toBe("clever dripper");
    expect(body.descriptive.roastLevel).toBe("medium_light");
    expect(createAnEvaluation).not.toHaveBeenCalled();
  });

  it("sends nothing without a roast level and shows the validation message under the field", () => {
    renderForm({
      offering: { ...OFFERING, coffeeInventory: { ...OFFERING.coffeeInventory, coffee: { name: "Finca La Esperanza" } } },
    });
    save();
    expect(createAnEvaluation).not.toHaveBeenCalled();
    const roast = screen.getByLabelText(/Roast level/);
    expect(roast.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Choose the roast level.").className).toContain("type-error");
  });

  it.each([
    [403, "This evaluation is not yours."],
    [409, "This evaluation is already closed."],
    [422, "Something went wrong."],
    [null, "Something went wrong."],
  ])("shows the message of a %s beside the actions and sends nothing again", async (status, text) => {
    updateAnEvaluation.mockResolvedValue({ ok: false, status });
    renderForm({ evaluation: OPEN_EVALUATION });
    save();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe(text));
    expect(updateAnEvaluation).toHaveBeenCalledTimes(1);
  });

  it("sends each descriptor block's selection to its request field (design.md D7)", async () => {
    createAnEvaluation.mockResolvedValue({ ok: true, status: 201, data: CREATED });
    renderForm();
    const [fragranceFloral, flavorFloral] = screen.getAllByRole("button", { name: "Floral" });
    fireEvent.click(fragranceFloral);
    fireEvent.click(screen.getByRole("button", { name: "Sweet" }));
    fireEvent.click(screen.getByRole("button", { name: "Silky" }));
    fireEvent.click(screen.getByRole("button", { name: "Mouldy" }));
    save();
    await waitFor(() => expect(createAnEvaluation).toHaveBeenCalledTimes(1));
    const body = createAnEvaluation.mock.calls[0][0];
    expect(body.descriptive.fragrance.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
    expect(body.descriptive.aroma.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
    expect(body.descriptive.flavor.cata).toEqual([]);
    expect(body.descriptive.mainTastes).toEqual(["01JTAXSWEET00000000000000C"]);
    expect(body.descriptive.mouthfeel.cata).toEqual(["01JTAXSILKY00000000000000D"]);
    expect(body.affective.defects).toEqual(["01JTAXMOULD00000000000000E"]);
    fireEvent.click(flavorFloral);
    createAnEvaluation.mockClear();
    updateAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: CREATED });
    save();
    await waitFor(() => expect(updateAnEvaluation).toHaveBeenCalledTimes(1));
    const update = updateAnEvaluation.mock.calls[0][1];
    expect(update.descriptive.flavor.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
    expect(update.descriptive.aftertaste.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
  });

  it("drops a removed note from what is sent", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: OPEN_EVALUATION });
    renderForm({ evaluation: OPEN_EVALUATION });
    expect((screen.getByRole("textbox", { name: "Note (Fragrance)" }) as HTMLTextAreaElement).value).toBe("jasmine");
    const removes = screen.getAllByRole("button", { name: "Remove note" });
    fireEvent.click(removes[0]);
    save();
    await waitFor(() => expect(updateAnEvaluation).toHaveBeenCalledTimes(1));
    expect(updateAnEvaluation.mock.calls[0][1].descriptive.fragrance.note).toBeNull();
  });
});
