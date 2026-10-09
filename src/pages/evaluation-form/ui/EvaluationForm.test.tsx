import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

/**
 * The evaluation form (design.md D3, D12, D14; spec "Evaluation form"; tasks
 * 4.1 and the later form tasks).
 */

// Back and Cancel are route buttons (render-navigation-actions-as-buttons);
// the app router is mocked — test infrastructure only.
const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));
// Saving returns to the list through the same router (return-to-list-after-save).
const push = router.push;

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
import {
  COMPLETE_EVALUATION,
  FORM_TEXTS,
  OFFERING,
  OPEN_EVALUATION,
  TAXONOMIES,
} from "./form-fixtures";

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
  router.push.mockClear();
  createAnEvaluation.mockReset();
  updateAnEvaluation.mockReset();
  closeAnEvaluation.mockReset();
  push.mockReset();
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
    const names = Array.from(container.querySelectorAll("[data-group] h3 .type-subheading"));
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
    // The extrinsic fields start behind "Add note" too (refine-evaluation-flow D2).
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
  it("creates the evaluation on the first save and returns to My evaluations", async () => {
    createAnEvaluation.mockResolvedValue({ ok: true, data: CREATED });
    renderForm();
    save();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/manage/evaluations"));
    const state = { ...emptyFormState("medium_light"), roastLevel: "medium_light" as const };
    expect(createAnEvaluation).toHaveBeenCalledWith(buildCreateBody(state, OFFERING.ulid!));
    expect(updateAnEvaluation).not.toHaveBeenCalled();
  });

  it("updates the evaluation on a later save, without offeringId, and returns to My evaluations", async () => {
    createAnEvaluation.mockResolvedValue({ ok: true, data: CREATED });
    updateAnEvaluation.mockResolvedValue({ ok: true, data: CREATED });
    renderForm();
    save();
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    save();
    await waitFor(() => expect(push).toHaveBeenCalledTimes(2));
    const [ulid, body] = updateAnEvaluation.mock.calls[0];
    expect(ulid).toBe(CREATED.ulid);
    expect(body).not.toHaveProperty("offeringId");
    expect(createAnEvaluation).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenLastCalledWith("/en/manage/evaluations");
  });

  it("updates a loaded evaluation and sends a stored extraction method back unchanged", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, data: OPEN_EVALUATION });
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
    [403, "forbidden", "This evaluation is not yours."],
    [409, "conflict", "This evaluation is already closed."],
    [422, "error", "Something went wrong."],
    [null, "error", "Something went wrong."],
  ])("shows the message of a %s beside the actions and sends nothing again", async (_, kind, text) => {
    updateAnEvaluation.mockResolvedValue({ ok: false, kind });
    renderForm({ evaluation: OPEN_EVALUATION });
    save();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe(text));
    expect(updateAnEvaluation).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it("sends each descriptor block's selection to its request field (design.md D7)", async () => {
    createAnEvaluation.mockResolvedValue({ ok: true, data: CREATED });
    renderForm();
    const [fragranceFloral, flavorFloral] = screen.getAllByRole("button", { name: "Floral" });
    fireEvent.click(fragranceFloral);
    fireEvent.click(screen.getByRole("button", { name: "Sweet" }));
    fireEvent.click(screen.getByRole("button", { name: "Texture" }));
    fireEvent.click(screen.getByRole("button", { name: "Silky" }));
    fireEvent.click(screen.getByRole("button", { name: "Mouldy" }));
    save();
    await waitFor(() => expect(createAnEvaluation).toHaveBeenCalledTimes(1));
    const body = createAnEvaluation.mock.calls[0][0];
    expect(body.descriptive.fragrance.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
    expect(body.descriptive.aroma.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
    expect(body.descriptive.flavor.cata).toEqual([]);
    expect(body.descriptive.mainTastes).toEqual(["01JTAXSWEET00000000000000C"]);
    expect(body.descriptive.mouthfeel.cata).toEqual([
      "01JTAXTEXTURE000000000000X",
      "01JTAXSILKY00000000000000D",
    ]);
    expect(body.affective.defects).toEqual(["01JTAXMOULD00000000000000E"]);
    fireEvent.click(flavorFloral);
    createAnEvaluation.mockClear();
    updateAnEvaluation.mockResolvedValue({ ok: true, data: CREATED });
    save();
    await waitFor(() => expect(updateAnEvaluation).toHaveBeenCalledTimes(1));
    const update = updateAnEvaluation.mock.calls[0][1];
    expect(update.descriptive.flavor.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
    expect(update.descriptive.aftertaste.cata).toEqual(["01JTAXFLORAL0000000000000A"]);
  });
});

describe("EvaluationForm: Fragrance not evaluated (design.md D9; tasks 6.3)", () => {
  function fragranceCard(container: HTMLElement) {
    return container.querySelector('[data-group="fragranceAroma"]') as HTMLElement;
  }

  function part(card: HTMLElement, name: "descriptive" | "affective") {
    return card.querySelector(`[data-part="${name}"]`) as HTMLElement;
  }

  function slider(card: HTMLElement, label: string) {
    return within(part(card, "descriptive")).getByRole("slider", { name: label }) as HTMLInputElement;
  }

  function beans(card: HTMLElement, label: string) {
    return within(part(card, "affective")).getByRole("radiogroup", { name: label });
  }

  it("is a labelled checkbox at the top of the Fragrance / Aroma body, unchecked on load", () => {
    const { container } = renderForm();
    const card = fragranceCard(container);
    const option = within(card).getByRole("checkbox", {
      name: "Fragrance not evaluated — use aroma values",
    }) as HTMLInputElement;
    expect(option.checked).toBe(false);
    const body = card.querySelector('[data-part="descriptive"]')!.parentElement!.parentElement!;
    expect(body.firstElementChild!.contains(option)).toBe(true);
    cleanup();
    const loaded = renderForm({ evaluation: OPEN_EVALUATION });
    expect(
      (within(fragranceCard(loaded.container)).getByRole("checkbox") as HTMLInputElement).checked,
    ).toBe(false);
  });

  it("disables the fragrance controls of both parts and sends the aroma scores as fragrance", async () => {
    createAnEvaluation.mockResolvedValue({ ok: true, data: CREATED });
    const { container } = renderForm();
    const card = fragranceCard(container);
    fireEvent.change(slider(card, "Fragrance"), { target: { value: "4" } });
    fireEvent.change(slider(card, "Aroma"), { target: { value: "9" } });
    fireEvent.click(within(beans(card, "Aroma")).getByRole("radio", { name: "7" }));
    fireEvent.click(within(card).getByRole("checkbox"));
    expect(slider(card, "Fragrance").disabled).toBe(true);
    expect(
      within(beans(card, "Fragrance"))
        .getAllByRole("radio")
        .every((radio) => (radio as HTMLButtonElement).disabled),
    ).toBe(true);
    expect(slider(card, "Aroma").disabled).toBe(false);
    save();
    await waitFor(() => expect(createAnEvaluation).toHaveBeenCalledTimes(1));
    const body = createAnEvaluation.mock.calls[0][0];
    expect(body.descriptive.fragrance.score).toBe(9);
    expect(body.affective.fragrance.score).toBe(7);
  });

  it("sends the fragrance controls' own values once unchecked again", async () => {
    createAnEvaluation.mockResolvedValue({ ok: true, data: CREATED });
    const { container } = renderForm();
    const card = fragranceCard(container);
    fireEvent.change(slider(card, "Fragrance"), { target: { value: "4" } });
    fireEvent.change(slider(card, "Aroma"), { target: { value: "9" } });
    const option = within(card).getByRole("checkbox");
    fireEvent.click(option);
    fireEvent.click(option);
    expect(slider(card, "Fragrance").disabled).toBe(false);
    expect(slider(card, "Fragrance").value).toBe("4");
    save();
    await waitFor(() => expect(createAnEvaluation).toHaveBeenCalledTimes(1));
    expect(createAnEvaluation.mock.calls[0][0].descriptive.fragrance.score).toBe(4);
  });
});

/** Sets the Acidity intensity to 0: unsaved edits that leave the form incomplete. */
function clearAcidity() {
  fireEvent.click(screen.getByRole("button", { name: "Acidity" }));
  fireEvent.change(screen.getByRole("slider", { name: "Acidity" }), { target: { value: "0" } });
}

describe("EvaluationForm: closing (design.md D4, D10; tasks 7.1)", () => {
  function closeEvaluation() {
    fireEvent.click(screen.getByRole("button", { name: "Close evaluation" }));
  }

  it("saves first, then closes, then returns to My evaluations", async () => {
    const order: string[] = [];
    updateAnEvaluation.mockImplementation(async () => {
      order.push("update");
      return { ok: true, data: OPEN_EVALUATION };
    });
    closeAnEvaluation.mockImplementation(async () => {
      order.push("close");
      return { ok: true, data: null };
    });
    renderForm({ evaluation: COMPLETE_EVALUATION });
    closeEvaluation();
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/en/manage/evaluations"));
    expect(order).toEqual(["update", "close"]);
    expect(closeAnEvaluation).toHaveBeenCalledWith(COMPLETE_EVALUATION.ulid);
  });

  it("shows the incomplete message on a 409 and highlights exactly the incomplete groups", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, data: OPEN_EVALUATION });
    closeAnEvaluation.mockResolvedValue({ ok: false, kind: "conflict" });
    const { container } = renderForm({ evaluation: COMPLETE_EVALUATION });
    expect(container.querySelectorAll('[data-highlighted="true"]')).toHaveLength(0);
    clearAcidity();
    closeEvaluation();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Complete every group before closing."),
    );
    const highlighted = Array.from(container.querySelectorAll('[data-highlighted="true"]')).map(
      (card) => card.getAttribute("data-group"),
    );
    // Only the cleared Acidity intensity is unset.
    expect(highlighted).toEqual(["acidity"]);
    expect(screen.getByRole("button", { name: "Save draft" })).toBeDefined();
  });

  it("shows the not-yours message on a 403 with nothing resent", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, data: OPEN_EVALUATION });
    closeAnEvaluation.mockResolvedValue({ ok: false, kind: "forbidden" });
    renderForm({ evaluation: COMPLETE_EVALUATION });
    closeEvaluation();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("This evaluation is not yours."),
    );
    expect(closeAnEvaluation).toHaveBeenCalledTimes(1);
  });
});

describe("EvaluationForm: Close only for a saved evaluation (close-evaluation-only-when-saved)", () => {
  it("No close on a new evaluation", () => {
    renderForm();
    expect(screen.queryByRole("button", { name: "Close evaluation" })).toBeNull();
  });

  it("Close on a saved open evaluation", () => {
    renderForm({ evaluation: COMPLETE_EVALUATION });
    expect(screen.getByRole("button", { name: "Close evaluation" })).toBeDefined();
  });

  it("No close on an incomplete saved evaluation", () => {
    renderForm({ evaluation: OPEN_EVALUATION });
    expect(screen.getByRole("button", { name: "Save draft" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Close evaluation" })).toBeNull();
  });
});

describe("EvaluationForm: Cancel (add-form-cancel-actions design.md D1, D2)", () => {
  it("Cancel leaves for My evaluations without saving", () => {
    renderForm();
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel.className).toContain("bg-action-4-bg");
    expect(cancel.parentElement!.className).toContain("self-center");
    fireEvent.click(cancel);
    expect(router.push).toHaveBeenCalledWith("/en/manage/evaluations");
    expect(createAnEvaluation).not.toHaveBeenCalled();
    expect(updateAnEvaluation).not.toHaveBeenCalled();
    expect(closeAnEvaluation).not.toHaveBeenCalled();
  });
});

describe("EvaluationForm: read-only presentation (design.md D4, D14; tasks 7.3)", () => {
  const CLOSED = {
    ...OPEN_EVALUATION,
    status: "closed",
    tastes: [{ ref: "01JTAXFLORAL0000000000000A", type: "aroma" }],
  };

  it("renders every control read-only", () => {
    renderForm({ evaluation: CLOSED });
    expect(screen.queryAllByRole("slider")).toHaveLength(0);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.getAllByRole("meter")).toHaveLength(15);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect((screen.getByLabelText(/Roast level/) as HTMLSelectElement).disabled).toBe(true);
    expect((screen.getByLabelText("Extraction method") as HTMLSelectElement).disabled).toBe(true);
    // Descriptor chips are plain badges: no toggle buttons.
    expect(screen.queryAllByRole("button", { name: "Floral" })).toHaveLength(0);
    expect(screen.getAllByText("Floral").length).toBeGreaterThan(0);
  });

  it("shows existing notes as type-body text and offers no note, save or close action", () => {
    renderForm({ evaluation: CLOSED });
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.getByText("jasmine").className).toContain("type-body");
    expect(screen.getByText("lovely").className).toContain("type-body");
    for (const name of ["Add note", "Remove note", "Save draft", "Close evaluation"]) {
      expect(screen.queryAllByRole("button", { name: new RegExp(`^${name}`) })).toHaveLength(0);
    }
  });
  it("An open evaluation opened with View", () => {
    renderForm({ evaluation: COMPLETE_EVALUATION, viewOnly: true });
    expect(screen.queryAllByRole("slider")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    for (const name of ["Save draft", "Close evaluation", "Cancel"]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
    expect(screen.getByRole("link", { name: "My evaluations" })).toBeDefined();
    expect(screen.getByRole("button", { name: "My evaluations" })).toBeDefined();
  });
  it("No Cancel on a closed evaluation", () => {
    renderForm({ evaluation: CLOSED });
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
  it("Back link at the end of a read-only evaluation", () => {
    renderForm({ evaluation: CLOSED });
    const top = screen.getByRole("link", { name: "My evaluations" });
    const end = screen.getByRole("button", { name: "My evaluations" });
    router.push.mockClear();
    fireEvent.click(end);
    expect([top.getAttribute("href"), ...router.push.mock.calls[0]]).toEqual([
      "/en/manage/evaluations",
      "/en/manage/evaluations",
    ]);
    const status = screen.getByRole("status");
    expect(status.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("EvaluationForm: section states (design.md D15; tasks 11.3)", () => {
  const CLOSED = { ...OPEN_EVALUATION, status: "closed" };

  function expandedByGroup(container: HTMLElement): Record<string, string | null> {
    return Object.fromEntries(
      Array.from(container.querySelectorAll("[data-group]")).map((card) => [
        card.getAttribute("data-group"),
        card.querySelector("h3 > button")!.getAttribute("aria-expanded"),
      ]),
    );
  }

  function allGroups(expanded: "true" | "false"): Record<string, string> {
    return Object.fromEntries(
      [
        "fragranceAroma",
        "flavorAftertaste",
        "acidity",
        "sweetness",
        "mouthfeel",
        "overall",
        "defects",
        "extrinsic",
      ].map((key) => [key, expanded]),
    );
  }

  function closeEvaluation() {
    fireEvent.click(screen.getByRole("button", { name: "Close evaluation" }));
  }

  it("starts every group collapsed in a new form and in a loaded open evaluation", () => {
    const fresh = renderForm();
    expect(expandedByGroup(fresh.container)).toEqual(allGroups("false"));
    cleanup();
    const open = renderForm({ evaluation: OPEN_EVALUATION });
    expect(expandedByGroup(open.container)).toEqual(allGroups("false"));
  });

  it("starts every group expanded in a closed evaluation", () => {
    const { container } = renderForm({ evaluation: CLOSED });
    expect(expandedByGroup(container)).toEqual(allGroups("true"));
  });

  it("expands exactly the incomplete groups on a 409 close", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, data: OPEN_EVALUATION });
    closeAnEvaluation.mockResolvedValue({ ok: false, kind: "conflict" });
    const { container } = renderForm({ evaluation: COMPLETE_EVALUATION });
    clearAcidity();
    closeEvaluation();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Complete every group before closing."),
    );
    // The group the completeness rule reports incomplete after the edit.
    expect(expandedByGroup(container)).toEqual({ ...allGroups("false"), acidity: "true" });
    for (const card of Array.from(container.querySelectorAll('[data-highlighted="true"]'))) {
      expect(card.querySelector("h3 > button")!.getAttribute("aria-expanded")).toBe("true");
    }
  });

  it("keeps the groups' state when a successful close returns to My evaluations", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, data: COMPLETE_EVALUATION });
    closeAnEvaluation.mockResolvedValue({ ok: true, data: null });
    const { container } = renderForm({ evaluation: COMPLETE_EVALUATION });
    closeEvaluation();
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/en/manage/evaluations"));
    expect(expandedByGroup(container)).toEqual(allGroups("false"));
  });
});

describe("EvaluationForm: the 1–9 legend (design.md D16; tasks 12.2)", () => {
  const CLOSED = { ...OPEN_EVALUATION, status: "closed" };
  const TITLE = "Affective quality impression";

  function legendHeader() {
    return screen.getByRole("button", { name: TITLE });
  }

  it("is the first section, after the header and before the context fields, as no group and with no indicator", () => {
    renderForm();
    const header = legendHeader();
    const back = screen.getByRole("link", { name: "My evaluations" });
    const roast = screen.getByLabelText(/Roast level/);
    expect(back.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(roast.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(header.closest("[data-group]")).toBeNull();
    expect(header.hasAttribute("aria-describedby")).toBe(false);
    expect(within(header).queryByText("Complete")).toBeNull();
    expect(within(header).queryByText("Incomplete")).toBeNull();
  });

  it("starts collapsed in a new form and in a loaded open evaluation", () => {
    renderForm();
    expect(legendHeader().getAttribute("aria-expanded")).toBe("false");
    cleanup();
    renderForm({ evaluation: OPEN_EVALUATION });
    expect(legendHeader().getAttribute("aria-expanded")).toBe("false");
  });

  it("starts expanded in a closed evaluation", () => {
    renderForm({ evaluation: CLOSED });
    expect(legendHeader().getAttribute("aria-expanded")).toBe("true");
  });
});

describe("EvaluationForm: an evaluation of a deleted offering (design.md D17; tasks 12.6)", () => {
  const ORPHAN = { ...OPEN_EVALUATION, offeringId: null };

  function renderOrphan() {
    return renderForm({ offering: null, evaluation: ORPHAN });
  }

  it("keeps the back link and the eyebrow and shows the message as the heading, with no captions", () => {
    renderOrphan();
    expect(screen.getByRole("link", { name: "My evaluations" })).toBeDefined();
    expect(screen.getByText("Evaluation")).toBeDefined();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Offering no longer exists");
    expect(screen.queryByText(/^Coffeeshop:/)).toBeNull();
    expect(screen.queryByText(/^Roaster:/)).toBeNull();
  });

  it("drops the roast level and keeps the stored extraction method, disabled", () => {
    renderOrphan();
    expect(screen.queryByLabelText(/Roast level/)).toBeNull();
    const extraction = screen.getByLabelText(/Extraction method/) as HTMLSelectElement;
    expect(extraction.value).toBe("chemex");
    expect(extraction.disabled).toBe(true);
  });

  it("is read-only with no save, close or note action", () => {
    renderOrphan();
    expect(screen.queryAllByRole("slider")).toHaveLength(0);
    expect(screen.getAllByRole("meter")).toHaveLength(15);
    for (const name of ["Add note", "Remove note", "Save draft", "Close evaluation"]) {
      expect(screen.queryAllByRole("button", { name: new RegExp(`^${name}`) })).toHaveLength(0);
    }
  });

  it("expands every group and the legend", () => {
    const { container } = renderOrphan();
    const headers = Array.from(container.querySelectorAll("[data-group] h3 > button"));
    expect(headers).toHaveLength(8);
    for (const header of headers) expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByRole("button", { name: "Affective quality impression" }).getAttribute("aria-expanded"),
    ).toBe("true");
  });
});

describe("EvaluationForm: section cards (design.md D18; tasks 13.1)", () => {
  function isSectionCard(card: Element) {
    const classes = card.className.split(" ");
    return classes.includes("border-border-subtle") && !classes.includes("border-l-4");
  }

  it("puts the roast level and extraction method in a section card with no band", () => {
    renderForm();
    const roast = screen.getByLabelText(/Roast level/);
    const card = roast.closest(".rounded-container") as HTMLElement;
    expect(card).not.toBeNull();
    expect(isSectionCard(card)).toBe(true);
    expect(card.querySelector(".bg-surface-section")).toBeNull();
  });

  it("makes the eight groups and the legend section cards, 1rem apart inside a form 2rem apart", () => {
    const { container } = renderForm();
    const groups = Array.from(container.querySelectorAll("[data-group]"));
    expect(groups).toHaveLength(8);
    for (const card of groups) expect(isSectionCard(card)).toBe(true);
    const legend = container.querySelector("[data-legend]")!;
    expect(isSectionCard(legend)).toBe(true);
    const list = groups[0]!.parentElement as HTMLElement;
    expect(list.className.split(" ")).toContain("gap-4");
    expect(container.querySelector("form")!.className.split(" ")).toContain("gap-8");
  });
});
