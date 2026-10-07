import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

/**
 * The `/{ulid}` load (design.md D1, D11 and its error table; spec "Loading an
 * evaluation for edit", "Reading a closed evaluation", "An unknown offering or
 * evaluation", "The form cannot be loaded"; tasks 8.1).
 */

const notFound = vi.fn(() => {
  throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
});
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  notFound: () => notFound(),
}));

const getMyEvaluation = vi.fn();
vi.mock("@/entities/evaluation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/evaluation")>()),
  getMyEvaluation: (...args: unknown[]) => getMyEvaluation(...args),
  createAnEvaluation: vi.fn(),
  updateAnEvaluation: vi.fn(),
  closeAnEvaluation: vi.fn(),
}));

const fetchOffering = vi.fn();
vi.mock("@/entities/offering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/offering")>()),
  fetchOffering: (...args: unknown[]) => fetchOffering(...args),
}));

import { EvaluationDetail } from "./EvaluationDetail";
import { FORM_TEXTS, OFFERING, OPEN_EVALUATION, TAXONOMIES } from "./form-fixtures";

const TEXTS = { ...FORM_TEXTS, loadErrorMessage: "This evaluation could not be loaded.", retryLabel: "Retry" };

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

beforeEach(() => {
  getMyEvaluation.mockReset();
  fetchOffering.mockReset();
  notFound.mockClear();
  fetchOffering.mockResolvedValue({ status: "found", offering: OFFERING });
});

afterEach(cleanup);

function renderDetail() {
  return render(
    <EvaluationDetail
      locale="en"
      ulid={OPEN_EVALUATION.ulid!}
      taxonomies={TAXONOMIES}
      texts={TEXTS}
    />,
  );
}

describe("EvaluationDetail (design.md D1)", () => {
  it("fills the form in editing mode with its offering's header and roast level", async () => {
    getMyEvaluation.mockResolvedValue({ ok: true, status: 200, data: OPEN_EVALUATION });
    renderDetail();
    expect(await screen.findByRole("heading", { level: 1, name: "Finca La Esperanza" })).toBeDefined();
    expect(getMyEvaluation).toHaveBeenCalledWith(OPEN_EVALUATION.ulid);
    expect(fetchOffering).toHaveBeenCalledWith(OPEN_EVALUATION.offeringId);
    expect((screen.getByLabelText(/Roast level/) as HTMLSelectElement).value).toBe("medium_light");
    expect(screen.getByRole("button", { name: "Save draft" })).toBeDefined();
    expect(screen.getAllByRole("slider")).toHaveLength(7);
  });

  it("renders a closed evaluation read-only", async () => {
    getMyEvaluation.mockResolvedValue({
      ok: true,
      status: 200,
      data: { ...OPEN_EVALUATION, status: "closed" },
    });
    renderDetail();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryAllByRole("slider")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Save draft" })).toBeNull();
  });

  it("shows the 404 page for an unknown or another user's evaluation", async () => {
    getMyEvaluation.mockResolvedValue({ ok: false, status: 404 });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const thrown: unknown[] = [];
    const onError = (event: ErrorEvent) => {
      thrown.push(event.error);
      event.preventDefault();
    };
    window.addEventListener("error", onError);
    try {
      renderDetail();
      await vi.waitFor(() => expect(notFound).toHaveBeenCalled());
    } finally {
      window.removeEventListener("error", onError);
      errors.mockRestore();
    }
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("shows the failure message with a retry that loads again", async () => {
    getMyEvaluation.mockResolvedValueOnce({ ok: false, status: 500 });
    renderDetail();
    expect(await screen.findByText("This evaluation could not be loaded.")).toBeDefined();
    getMyEvaluation.mockResolvedValueOnce({ ok: true, status: 200, data: OPEN_EVALUATION });
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("heading", { level: 1 })).toBeDefined();
    expect(getMyEvaluation).toHaveBeenCalledTimes(2);
  });

  it("shows the failure message when the offering cannot be read", async () => {
    getMyEvaluation.mockResolvedValue({ ok: true, status: 200, data: OPEN_EVALUATION });
    fetchOffering.mockResolvedValue({ status: "failed" });
    renderDetail();
    expect(await screen.findByText("This evaluation could not be loaded.")).toBeDefined();
  });
});

describe("EvaluationDetail: an evaluation of a deleted offering (design.md D17; tasks 12.6)", () => {
  it("requests no offering and renders the form read-only with the message as its heading", async () => {
    getMyEvaluation.mockResolvedValue({
      ok: true,
      status: 200,
      data: { ...OPEN_EVALUATION, offeringId: null },
    });
    renderDetail();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Offering no longer exists" }),
    ).toBeDefined();
    expect(fetchOffering).not.toHaveBeenCalled();
    expect(screen.queryAllByRole("slider")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Save draft" })).toBeNull();
  });
});
