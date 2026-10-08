import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

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

import { EvaluationDetail } from "@/pages/evaluation-form/ui/EvaluationDetail";
import { FORM_TEXTS, OFFERING, OPEN_EVALUATION, TAXONOMIES } from "@/pages/evaluation-form/ui/form-fixtures";

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
  it("shows a loading state while the evaluation loads", () => {
    getMyEvaluation.mockReturnValue(new Promise(() => {}));
    const { container } = renderDetail();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });
});
