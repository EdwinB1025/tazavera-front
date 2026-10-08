import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
import { EvaluationsList } from "./EvaluationsList";
import type { EvaluationsListProps, EvaluationsListTexts } from "./EvaluationsList";

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
  it("shows a loading state in the list's place while the evaluations load", async () => {
    listMyEvaluations.mockReturnValue(new Promise(() => {}));
    const { container } = render(<List />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText(TEXTS.emptyMessage)).toBeNull();
    expect(screen.queryByText(TEXTS.loadErrorMessage)).toBeNull();
  });

  it("renders one row per evaluation in API order with its offering", async () => {
    listMyEvaluations.mockResolvedValue(page(ITEMS));
    render(<List />);
    const headings = await screen.findAllByRole("heading", { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual(["Beta", "Alpha", "Alpha"]);
    expect(listMyEvaluations).toHaveBeenCalledWith("orderBy=created_at&orderDirection=desc&page=1");
    expect(fetchOffering).toHaveBeenCalledWith("01JOFFERA");
    expect(fetchOffering).toHaveBeenCalledWith("01JOFFERB");
    expect(fetchOffering).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText("Coffeeshop: Alpha shop")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 2, name: "My evaluations" }).className).toContain("type-heading");
  });

  it("requests the filtered page with evaluationListQuery", async () => {
    listMyEvaluations.mockResolvedValue(page(ITEMS, { current_page: 2, last_page: 2, per_page: 15, total: 18 }));
    render(<List page={2} values={parseEvaluationFilters({ status: "open" })} query={{ status: "open", page: "2" }} />);
    await screen.findAllByRole("heading", { level: 3 });
    expect(listMyEvaluations).toHaveBeenCalledWith("status=open&orderBy=created_at&orderDirection=desc&page=2");
  });

  it("shows the empty message for an empty page", async () => {
    listMyEvaluations.mockResolvedValue(page([]));
    render(<List />);
    expect(await screen.findByText(TEXTS.emptyMessage)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  it("shows No results match these filters and the action instead of the empty message with emptyAction", async () => {
    listMyEvaluations.mockResolvedValue(page([]));
    render(<List emptyAction={<button type="button">Clear all</button>} />);
    expect(await screen.findByText(TEXTS.noMatches)).toBeDefined();
    expect(screen.getByRole("button", { name: "Clear all" })).toBeDefined();
    expect(screen.queryByText(TEXTS.emptyMessage)).toBeNull();
  });

  it("keeps the unfiltered empty message without emptyAction", async () => {
    listMyEvaluations.mockResolvedValue(page([]));
    render(<List />);
    expect(await screen.findByText(TEXTS.emptyMessage)).toBeDefined();
    expect(screen.queryByText(TEXTS.noMatches)).toBeNull();
  });

  it("announces the result total in a status element that stays mounted while loading", async () => {
    listMyEvaluations.mockResolvedValueOnce(page(ITEMS, { current_page: 1, last_page: 1, per_page: 15, total: 12 }));
    const { rerender } = render(<List resultCountText="Results: {count}" />);
    await screen.findAllByRole("heading", { level: 3 });
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Results: 12");
    listMyEvaluations.mockReturnValueOnce(new Promise(() => {}));
    rerender(<List resultCountText="Results: {count}" page={2} />);
    await waitFor(() => expect(document.querySelector('[aria-busy="true"]')).not.toBeNull());
    expect(screen.getByRole("status")).toBe(status);
  });

  it("keeps the list's previous height while a new query loads, so the scroll position is kept", async () => {
    const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(2400);
    try {
      listMyEvaluations.mockResolvedValueOnce(page(ITEMS));
      let resolveReload: (value: unknown) => void = () => {};
      listMyEvaluations.mockReturnValueOnce(new Promise((done) => (resolveReload = done)));
      const { container, rerender } = render(<List />);
      await screen.findAllByRole("heading", { level: 3 });
      const block = container.firstElementChild as HTMLElement;
      expect(block.style.minHeight).toBe("");
      rerender(<List values={parseEvaluationFilters({ status: "open" })} />);
      await waitFor(() => expect(container.querySelector('[aria-busy="true"]')).not.toBeNull());
      expect(block.style.minHeight).toBe("2400px");
      resolveReload(page(ITEMS.slice(1)));
      await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
      expect(block.style.minHeight).toBe("");
    } finally {
      height.mockRestore();
    }
  });

  it("shows the failure message with a retry that loads again", async () => {
    listMyEvaluations.mockResolvedValueOnce({ ok: false, status: 500 });
    render(<List />);
    expect(await screen.findByText(TEXTS.loadErrorMessage)).toBeDefined();
    listMyEvaluations.mockResolvedValueOnce(page(ITEMS));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findAllByRole("heading", { level: 3 });
    expect(listMyEvaluations).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(TEXTS.loadErrorMessage)).toBeNull();
  });

  it("renders Pagination over the list route when there is more than one page", async () => {
    listMyEvaluations.mockResolvedValue(page(ITEMS, { current_page: 1, last_page: 3, per_page: 15, total: 40 }));
    render(<List values={parseEvaluationFilters({ status: "open" })} query={{ status: "open" }} />);
    const next = await screen.findByRole("button", { name: "Next" });
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(next);
    expect(push).toHaveBeenCalledWith("/en/manage/evaluations?status=open&page=2");
  });

  it("removes a deleted row and reloads the list without the loading placeholder", async () => {
    listMyEvaluations.mockResolvedValueOnce(page(ITEMS));
    deleteAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: null });
    let resolveReload: (value: unknown) => void = () => {};
    listMyEvaluations.mockReturnValueOnce(new Promise((done) => (resolveReload = done)));
    const { container } = render(<List />);
    await screen.findAllByRole("heading", { level: 3 });
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Delete evaluation" }));
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));
    expect(deleteAnEvaluation).toHaveBeenCalledWith("01JEVAL3");
    expect(listMyEvaluations).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[aria-busy="true"]')).toBeNull();
    resolveReload(page(ITEMS.slice(1)));
    await waitFor(() =>
      expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
        "Alpha",
        "Alpha",
      ]),
    );
  });
});

describe("EvaluationsList: an evaluation of a deleted offering (design.md D17; tasks 12.4)", () => {
  it("requests offerings only for the non-null ids and renders the null row without one", async () => {
    const orphan: EvaluationItem = {
      ulid: "01JEVAL4",
      offeringId: null,
      status: "open",
      cuppingScore: null,
      createdAt: "2026-10-07T09:00:00Z",
      closedAt: null,
    };
    listMyEvaluations.mockResolvedValue(page([orphan, ...ITEMS]));
    render(<List />);
    const headings = await screen.findAllByRole("heading", { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Offering no longer exists",
      "Beta",
      "Alpha",
      "Alpha",
    ]);
    expect(fetchOffering).toHaveBeenCalledTimes(2);
    expect(fetchOffering).toHaveBeenCalledWith("01JOFFERA");
    expect(fetchOffering).toHaveBeenCalledWith("01JOFFERB");
    expect(fetchOffering).not.toHaveBeenCalledWith(null);
    expect(fetchOffering).not.toHaveBeenCalledWith("");
  });
});
