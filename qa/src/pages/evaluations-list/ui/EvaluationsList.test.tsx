import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";

/**
 * The "My evaluations" list (design.md D1, endpoint 1, the error table; spec
 * "My evaluations list"; tasks 3.4): loading, rows in API order with their
 * offerings, empty, failure with retry, and the pagination.
 */

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/en/manage/evaluations",
  useSearchParams: () => new URLSearchParams(),
}));

const listMyEvaluations = vi.fn();
const deleteAnEvaluation = vi.fn();
vi.mock("@/entities/evaluation", () => ({
  listMyEvaluations: (...args: unknown[]) => listMyEvaluations(...args),
  deleteAnEvaluation: (...args: unknown[]) => deleteAnEvaluation(...args),
}));

const fetchOffering = vi.fn();
vi.mock("@/entities/offering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/offering")>()),
  fetchOffering: (...args: unknown[]) => fetchOffering(...args),
}));

import { parseEvaluationFilters } from "@/features/evaluation-facets";
import { EvaluationsList } from "@/pages/evaluations-list/ui/EvaluationsList";
import type { EvaluationsListProps, EvaluationsListTexts } from "@/pages/evaluations-list/ui/EvaluationsList";

const TEXTS: EvaluationsListTexts = {
  heading: "My evaluations",
  openLabel: "Open",
  closedLabel: "Closed",
  createdOnLabel: "Created on",
  closedOnLabel: "Closed on",
  coffeeshopCaption: "Coffeeshop:",
  roasterCaption: "Roaster:",
  editLabel: "Edit",
  viewLabel: "View",
  ratingExceptionalLabel: "Exceptional",
  ratingExcellentLabel: "Excellent",
  ratingGoodLabel: "Good",
  ratingCommercialLabel: "Commercial",
  navigationLabel: "Pagination",
  previousLabel: "Previous",
  nextLabel: "Next",
  pageLabel: "Page {page}",
  emptyMessage: "You have no evaluations yet.",
  loadErrorMessage: "Your evaluations could not be loaded.",
  retryLabel: "Retry",
  deleteLabel: "Delete",
  deleteTitle: "Delete this evaluation?",
  deleteDescription: "The evaluation and its scores will be removed.",
  deleteConfirmLabel: "Delete evaluation",
  deleteCancelLabel: "Cancel",
  notYoursMessage: "This evaluation is not yours.",
  failureMessage: "Something went wrong. Try again later.",
  offeringMissingLabel: "Offering no longer exists",
  noMatches: "No results match these filters.",
};

const NO_FILTERS = parseEvaluationFilters({});

/** The list with no filter on page 1, overridden per case. */
function List(props: Partial<EvaluationsListProps>) {
  return (
    <EvaluationsList locale="en" texts={TEXTS} values={NO_FILTERS} page={1} query={{}} {...props} />
  );
}

function offering(ulid: string, name: string): OfferingDetail {
  return {
    ulid,
    location: { name: `${name} shop` },
    coffeeInventory: { coffee: { name, roastLevel: "medium" }, roastery: { name: `${name} roaster` } },
  };
}

const OFFERINGS: Record<string, OfferingDetail> = {
  "01JOFFERA": offering("01JOFFERA", "Alpha"),
  "01JOFFERB": offering("01JOFFERB", "Beta"),
};

const ITEMS: EvaluationItem[] = [
  { ulid: "01JEVAL3", offeringId: "01JOFFERB", status: "open", cuppingScore: null, createdAt: "2026-10-06T09:00:00Z", closedAt: null },
  { ulid: "01JEVAL2", offeringId: "01JOFFERA", status: "closed", cuppingScore: "86.00", createdAt: "2026-10-03T09:00:00Z", closedAt: "2026-10-04T09:00:00Z" },
  { ulid: "01JEVAL1", offeringId: "01JOFFERA", status: "open", cuppingScore: null, createdAt: "2026-10-01T09:00:00Z", closedAt: null },
];

function page(data: EvaluationItem[], meta = { current_page: 1, last_page: 1, per_page: 15, total: data.length }) {
  return { ok: true, status: 200, data: { data, meta } };
}

beforeEach(() => {
  listMyEvaluations.mockReset();
  fetchOffering.mockReset();
  fetchOffering.mockImplementation(async (ulid: string) => ({ status: "found", offering: OFFERINGS[ulid] }));
});

afterEach(cleanup);

describe("EvaluationsList (spec: My evaluations list)", () => {

  it("announces Results: 0 in the empty state", async () => {
    listMyEvaluations.mockResolvedValue(page([]));
    render(<List resultCountText="Results: {count}" />);
    await screen.findByText(TEXTS.emptyMessage);
    expect(screen.getByRole("status").textContent).toBe("Results: 0");
  });

  it("renders no Pagination for a single page", async () => {
    listMyEvaluations.mockResolvedValue(page(ITEMS));
    render(<List />);
    const list = await screen.findByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    await waitFor(() => expect(screen.queryByRole("button", { name: "Next" })).toBeNull());
  });
});
