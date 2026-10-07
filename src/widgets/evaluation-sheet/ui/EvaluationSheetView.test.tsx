import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { OfferingResult } from "@/entities/offering";
import type { EvaluationItem } from "@/shared/api";
import { EVALUATION, SHEET_TEXTS, TAXONOMIES } from "./sheet-fixtures";

/**
 * The view's async wrapper (design.md D1, D4, D5; summary §5.3; spec
 * "Read-only evaluation view"; tasks 3.3).
 */

const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const fetchEvaluation = vi.fn<(ulid: string) => Promise<EvaluationItem>>();
vi.mock("@/entities/evaluation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/evaluation")>()),
  fetchEvaluation: (ulid: string) => fetchEvaluation(ulid),
}));
const fetchOffering = vi.fn<(ulid: string) => Promise<OfferingResult>>();
vi.mock("@/entities/offering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/offering")>()),
  fetchOffering: (ulid: string) => fetchOffering(ulid),
}));
const fetchTaxonomies = vi.fn();
vi.mock("@/entities/taxonomy", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/taxonomy")>()),
  fetchTaxonomies: () => fetchTaxonomies(),
}));

import { EvaluationSheetView, EvaluationSheetViewSkeleton } from "./EvaluationSheetView";
import type { EvaluationViewTexts } from "./EvaluationSheetView";

const TEXTS: EvaluationViewTexts = {
  ...SHEET_TEXTS,
  eyebrow: "Evaluation",
  coffeeshopCaption: "Coffeeshop:",
  roasterCaption: "Roaster:",
  closedOnLabel: "Closed on",
  viewOfferingLabel: "View offering",
  offeringUnavailableLabel: "Offering unavailable",
  offeringMissingLabel: "Offering no longer exists",
  errorMessage: "The evaluation could not be loaded.",
  retryLabel: "Retry",
};

const BACK: ReactNode = <a href="/en/evaluations">Back</a>;
const DATE = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(
  new Date(EVALUATION.closedAt as string),
);

async function renderView() {
  render(await EvaluationSheetView({ locale: "en", ulid: EVALUATION.ulid as string, back: BACK, texts: TEXTS }));
}

beforeEach(() => {
  notFound.mockClear();
  fetchEvaluation.mockReset().mockResolvedValue(EVALUATION);
  fetchOffering.mockReset().mockResolvedValue({
    status: "found",
    offering: {
      ulid: "01JOFFERA",
      location: { name: "Tazavera Gràcia" },
      coffeeInventory: { coffee: { name: "Huila El Mirador" }, roastery: { name: "Nómada" } },
    },
  });
  fetchTaxonomies.mockReset().mockResolvedValue({ data: TAXONOMIES });
});
afterEach(cleanup);

describe("EvaluationSheetViewSkeleton (spec: Loading the view)", () => {
  it("shows the back link and three bars, then two skeleton cards", () => {
    const { container } = render(<EvaluationSheetViewSkeleton back={BACK} />);
    const [first, second] = Array.from(container.querySelectorAll("section"));
    expect(first!.querySelector("a")?.textContent).toBe("Back");
    const bars = first!.querySelector("[aria-hidden='true']") as HTMLElement;
    expect(bars.className).toContain("gap-2");
    expect(bars.children).toHaveLength(3);
    expect(second!.querySelectorAll(".rounded-container")).toHaveLength(2);
  });
});

describe("EvaluationSheetView (design.md D1, D4)", () => {
  it("renders the header block and the presentation of a closed evaluation", async () => {
    await renderView();
    expect(screen.getByText("Evaluation").className).toContain("type-eyebrow-strong");
    expect(screen.getByRole("heading", { level: 1, name: "Huila El Mirador" })).toBeDefined();
    expect(screen.getByText("Coffeeshop: Tazavera Gràcia").className).toContain("type-label");
    expect(screen.getByText("Roaster: Nómada")).toBeDefined();
    expect(screen.getByText(`Closed on ${DATE}`).className).toContain("type-meta");
    expect(screen.getByRole("link", { name: "View offering" }).getAttribute("href")).toBe(
      "/en/offerings/01JOFFERA",
    );
    expect(screen.getByRole("heading", { level: 2, name: "Context" })).toBeDefined();
    expect(fetchOffering).toHaveBeenCalledWith("01JOFFERA");
  });

  it("renders the 404 page for an evaluation that is not closed", async () => {
    fetchEvaluation.mockResolvedValue({ ...EVALUATION, status: "open" });
    await expect(renderView()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("shows offeringUnavailable as the h1 when the offering read failed, keeping the presentation", async () => {
    fetchOffering.mockResolvedValue({ status: "failed" });
    await renderView();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Offering unavailable");
    expect(screen.queryByText(/^Coffeeshop:/)).toBeNull();
    expect(screen.queryByRole("link", { name: "View offering" })).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Context" })).toBeDefined();
  });

  it("shows the offering-missing h1 for a null offeringId with no offering read", async () => {
    fetchEvaluation.mockResolvedValue({ ...EVALUATION, offeringId: null });
    await renderView();
    expect(fetchOffering).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Offering no longer exists");
    expect(screen.queryByText(/^Roaster:/)).toBeNull();
    expect(screen.queryByRole("link", { name: "View offering" })).toBeNull();
    expect(screen.getByRole("link", { name: "Back" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "Context" })).toBeDefined();
  });

  it.each([
    ["evaluation", () => fetchEvaluation.mockRejectedValue(new Error("404"))],
    ["taxonomy", () => fetchTaxonomies.mockRejectedValue(new Error("500"))],
  ])("keeps the back link and shows the error with Retry when the %s read fails", async (_, fail) => {
    fail();
    const container = document.body;
    await renderView();
    const [first, second] = Array.from(container.querySelectorAll("section"));
    expect(first!.textContent).toBe("Back");
    expect(second!.textContent).toContain("The evaluation could not be loaded.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });
});
