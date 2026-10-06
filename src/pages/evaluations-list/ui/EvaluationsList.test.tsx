import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";

/**
 * The "My evaluations" list (design.md D1, endpoint 1, the error table; spec
 * "My evaluations list"; tasks 3.4): loading, rows in API order with their
 * offerings, empty, failure with retry, and the pagination.
 */

const push = vi.fn();
let search = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => search,
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

import { EvaluationsList } from "./EvaluationsList";
import type { EvaluationsListTexts } from "./EvaluationsList";

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
  previousLabel: "Previous",
  nextLabel: "Next",
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
};

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
  search = new URLSearchParams();
  listMyEvaluations.mockReset();
  fetchOffering.mockReset();
  fetchOffering.mockImplementation(async (ulid: string) => ({ status: "found", offering: OFFERINGS[ulid] }));
});

afterEach(cleanup);

describe("EvaluationsList (spec: My evaluations list)", () => {
  it("shows a loading state in the list's place while the evaluations load", async () => {
    listMyEvaluations.mockReturnValue(new Promise(() => {}));
    const { container } = render(<EvaluationsList locale="en" texts={TEXTS} />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText(TEXTS.emptyMessage)).toBeNull();
    expect(screen.queryByText(TEXTS.loadErrorMessage)).toBeNull();
  });

  it("renders one row per evaluation in API order with its offering", async () => {
    listMyEvaluations.mockResolvedValue(page(ITEMS));
    render(<EvaluationsList locale="en" texts={TEXTS} />);
    const headings = await screen.findAllByRole("heading", { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual(["Beta", "Alpha", "Alpha"]);
    expect(listMyEvaluations).toHaveBeenCalledWith(1);
    expect(fetchOffering).toHaveBeenCalledWith("01JOFFERA");
    expect(fetchOffering).toHaveBeenCalledWith("01JOFFERB");
    expect(fetchOffering).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText("Coffeeshop: Alpha shop")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 2, name: "My evaluations" }).className).toContain("type-heading");
  });

  it("requests the page of the route's page query", async () => {
    search = new URLSearchParams("page=2");
    listMyEvaluations.mockResolvedValue(page(ITEMS, { current_page: 2, last_page: 2, per_page: 15, total: 18 }));
    render(<EvaluationsList locale="en" texts={TEXTS} />);
    await screen.findAllByRole("heading", { level: 3 });
    expect(listMyEvaluations).toHaveBeenCalledWith(2);
  });

  it("shows the empty message for an empty page", async () => {
    listMyEvaluations.mockResolvedValue(page([]));
    render(<EvaluationsList locale="en" texts={TEXTS} />);
    expect(await screen.findByText(TEXTS.emptyMessage)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  it("shows the failure message with a retry that loads again", async () => {
    listMyEvaluations.mockResolvedValueOnce({ ok: false, status: 500 });
    render(<EvaluationsList locale="en" texts={TEXTS} />);
    expect(await screen.findByText(TEXTS.loadErrorMessage)).toBeDefined();
    listMyEvaluations.mockResolvedValueOnce(page(ITEMS));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findAllByRole("heading", { level: 3 });
    expect(listMyEvaluations).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(TEXTS.loadErrorMessage)).toBeNull();
  });

  it("renders Pagination over the list route when there is more than one page", async () => {
    listMyEvaluations.mockResolvedValue(page(ITEMS, { current_page: 1, last_page: 3, per_page: 15, total: 40 }));
    render(<EvaluationsList locale="en" texts={TEXTS} />);
    const next = await screen.findByRole("button", { name: "Next" });
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(next);
    expect(push).toHaveBeenCalledWith("/en/manage/evaluations?page=2");
  });

  it("renders no Pagination for a single page", async () => {
    listMyEvaluations.mockResolvedValue(page(ITEMS));
    render(<EvaluationsList locale="en" texts={TEXTS} />);
    const list = await screen.findByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    await waitFor(() => expect(screen.queryByRole("button", { name: "Next" })).toBeNull());
  });

  it("removes a deleted row and reloads the list without the loading placeholder", async () => {
    listMyEvaluations.mockResolvedValueOnce(page(ITEMS));
    deleteAnEvaluation.mockResolvedValue({ ok: true, status: 200, data: null });
    let resolveReload: (value: unknown) => void = () => {};
    listMyEvaluations.mockReturnValueOnce(new Promise((done) => (resolveReload = done)));
    const { container } = render(<EvaluationsList locale="en" texts={TEXTS} />);
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
