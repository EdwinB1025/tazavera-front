import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

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
import { EvaluationForm } from "@/pages/evaluation-form/ui/EvaluationForm";
import { FORM_TEXTS, OFFERING, OPEN_EVALUATION, TAXONOMIES } from "@/pages/evaluation-form/ui/form-fixtures";

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

describe("EvaluationForm: closing (design.md D4, D10; tasks 7.1)", () => {
  function closeEvaluation() {
    fireEvent.click(screen.getByRole("button", { name: "Close evaluation" }));
  }

  it("creates a new evaluation first, then closes the created one", async () => {
    createAnEvaluation.mockResolvedValue({ ok: true, status: 201, data: CREATED });
    closeAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: null });
    renderForm();
    closeEvaluation();
    await waitFor(() => expect(closeAnEvaluation).toHaveBeenCalledWith(CREATED.ulid));
  });

  it("does not close when the save fails", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: false, status: 422 });
    renderForm({ evaluation: OPEN_EVALUATION });
    closeEvaluation();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Something went wrong."));
    expect(closeAnEvaluation).not.toHaveBeenCalled();
  });
});

describe("EvaluationForm: read-only presentation (design.md D4, D14; tasks 7.3)", () => {
  const CLOSED = {
    ...OPEN_EVALUATION,
    status: "closed",
    tastes: [{ ref: "01JTAXFLORAL0000000000000A", type: "aroma" }],
  };

  it("keeps the layout of the editing form", () => {
    const closed = renderForm({ evaluation: CLOSED });
    const shape = (root: HTMLElement) =>
      Array.from(root.querySelectorAll("[data-group]")).map((card) => [
        card.getAttribute("data-group"),
        Array.from(card.querySelectorAll("[data-part]")).map((part) => [
          part.getAttribute("data-part"),
          part.className,
        ]),
      ]);
    const readOnlyShape = shape(closed.container);
    cleanup();
    const open = renderForm({ evaluation: OPEN_EVALUATION });
    expect(readOnlyShape).toEqual(shape(open.container));
  });
});

describe("EvaluationForm: one action at a time (design.md D4)", () => {
  function pendingUpdate() {
    const pending: Array<(value: unknown) => void> = [];
    updateAnEvaluation.mockImplementation(() => new Promise((settle) => pending.push(settle)));
    return () => pending.forEach((settle) => settle({ ok: true, status: 200, data: OPEN_EVALUATION }));
  }

  it("ignores Close evaluation while a save is running", async () => {
    const finish = pendingUpdate();
    renderForm({ evaluation: OPEN_EVALUATION });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Close evaluation" }));
    finish();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Draft saved."));
    expect(updateAnEvaluation).toHaveBeenCalledTimes(1);
    expect(closeAnEvaluation).not.toHaveBeenCalled();
  });

  it("ignores Save draft while a close is running", async () => {
    const finish = pendingUpdate();
    closeAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: null });
    renderForm({ evaluation: OPEN_EVALUATION });
    fireEvent.click(screen.getByRole("button", { name: "Close evaluation" }));
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    finish();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Evaluation closed."));
    expect(updateAnEvaluation).toHaveBeenCalledTimes(1);
    expect(closeAnEvaluation).toHaveBeenCalledTimes(1);
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

  it("keeps a group the user expanded before a 409", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: OPEN_EVALUATION });
    closeAnEvaluation.mockResolvedValue({ ok: false, status: 409 });
    const { container } = renderForm({ evaluation: OPEN_EVALUATION });
    fireEvent.click(screen.getByRole("button", { name: "Overall" }));
    closeEvaluation();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Complete every group before closing."),
    );
    expect(expandedByGroup(container).overall).toBe("true");
  });

  it("changes no group's state when saving without a roast level", () => {
    const { container } = renderForm({
      offering: { ...OFFERING, coffeeInventory: { ...OFFERING.coffeeInventory, coffee: { name: "Finca La Esperanza" } } },
    });
    save();
    expect(createAnEvaluation).not.toHaveBeenCalled();
    expect(expandedByGroup(container)).toEqual(allGroups("false"));
  });
});

describe("EvaluationForm: the 1–9 legend (design.md D16; tasks 12.2)", () => {
  const CLOSED = { ...OPEN_EVALUATION, status: "closed" };
  const TITLE = "Affective quality impression";

  function legendHeader() {
    return screen.getByRole("button", { name: TITLE });
  }

  it("stays collapsed on a 409 close", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: OPEN_EVALUATION });
    closeAnEvaluation.mockResolvedValue({ ok: false, status: 409 });
    renderForm({ evaluation: OPEN_EVALUATION });
    fireEvent.click(screen.getByRole("button", { name: "Close evaluation" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Complete every group before closing."),
    );
    expect(legendHeader().getAttribute("aria-expanded")).toBe("false");
  });

  it("expands when a successful close turns the form read-only", async () => {
    updateAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: OPEN_EVALUATION });
    closeAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: null });
    renderForm({ evaluation: OPEN_EVALUATION });
    fireEvent.click(screen.getByRole("button", { name: "Close evaluation" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Evaluation closed."));
    expect(legendHeader().getAttribute("aria-expanded")).toBe("true");
  });
});
