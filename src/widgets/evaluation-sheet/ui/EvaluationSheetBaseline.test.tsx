import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { EVALUATION, SHEET_TEXTS, TAXONOMIES } from "./sheet-fixtures";

/**
 * The provisional tab's async wrapper (design.md D4, D8, D9; summary §5.4;
 * spec "Provisional evaluation tab on the offering detail"; tasks 4.1).
 */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const fetchEvaluations = vi.fn();
vi.mock("@/entities/evaluation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/evaluation")>()),
  fetchEvaluations: (...args: unknown[]) => fetchEvaluations(...args),
}));
const fetchTaxonomies = vi.fn();
vi.mock("@/entities/taxonomy", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/taxonomy")>()),
  fetchTaxonomies: () => fetchTaxonomies(),
}));

import { EvaluationSheetBaseline, EvaluationSheetSkeleton } from "./EvaluationSheetBaseline";
import type { EvaluationBaselineTexts } from "./EvaluationSheetBaseline";

const TEXTS: EvaluationBaselineTexts = {
  ...SHEET_TEXTS,
  emptyMessage: "This offering has no provisional evaluation yet.",
  errorMessage: "The provisional evaluation could not be loaded.",
  retryLabel: "Retry",
};

async function renderPanel() {
  render(await EvaluationSheetBaseline({ locale: "en", offeringUlid: "01JOFFERA", texts: TEXTS }));
}

beforeEach(() => {
  fetchEvaluations.mockReset();
  fetchTaxonomies.mockReset().mockResolvedValue({ ok: true, data: { data: TAXONOMIES } });
});
afterEach(cleanup);

describe("EvaluationSheetBaseline (design.md D4, D9)", () => {
  it("renders two skeleton cards while loading", () => {
    const { container } = render(<EvaluationSheetSkeleton />);
    expect(container.querySelectorAll(".rounded-container")).toHaveLength(2);
  });

  it("requests the newest baseline and renders the sheet of the first item", async () => {
    fetchEvaluations.mockResolvedValue({
      ok: true,
      data: { data: [EVALUATION, { ...EVALUATION, cuppingScore: "70.00" }], meta: {} },
    });
    await renderPanel();
    expect(fetchEvaluations).toHaveBeenCalledWith({
      offeringId: "01JOFFERA",
      evaluationType: "baseline",
      orderBy: "created_at",
      orderDirection: "desc",
    });
    expect(screen.getByText("84.25")).toBeDefined();
    expect(screen.queryByText("70.00")).toBeNull();
  });

  it("shows the empty message centred with no box on an empty page", async () => {
    fetchEvaluations.mockResolvedValue({ ok: true, data: { data: [], meta: {} } });
    await renderPanel();
    const message = screen.getByText("This offering has no provisional evaluation yet.");
    expect(message.className).toContain("text-center");
    expect(message.className).toContain("type-body");
  });

  it("shows the error message with Retry when the read fails", async () => {
    fetchEvaluations.mockResolvedValue({ ok: false, kind: "error" });
    await renderPanel();
    expect(screen.getByText("The provisional evaluation could not be loaded.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });
});
