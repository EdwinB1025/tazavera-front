import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

/**
 * The public list's presentation (design.md D4, D6, D7; spec "Public
 * evaluations list"; tasks 2.5): loading, rows with pagination, the two
 * empty states, the error with Retry and the result count.
 */

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/en/evaluations",
  useSearchParams: () => new URLSearchParams(),
}));

const clearFilters = vi.fn((props: { label: string; keep: readonly string[] }) => (
  <button type="button">{props.label}</button>
));
vi.mock("@/shared/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/ui")>()),
  ClearFiltersButton: (props: { label: string; keep: readonly string[] }) => clearFilters(props),
}));

import { PublicEvaluationRowCard } from "@/widgets/evaluation-row";
import { EvaluationListPresentation, EvaluationListSkeleton } from "./EvaluationListPresentation";
import type { PublicEvaluationRow } from "./EvaluationListPresentation";
import { ROW_TEXTS, TEXTS, evaluation, offering } from "./fixtures";

/** The row slot, composed as the host page composes it. */
function renderRow(row: PublicEvaluationRow) {
  return (
    <PublicEvaluationRowCard
      evaluation={row.evaluation}
      offering={row.offering}
      locale="en"
      texts={ROW_TEXTS}
    />
  );
}

const A = offering("01JOFFERA", "Huila");

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
  clearFilters.mockClear();
});
afterEach(cleanup);

describe("EvaluationListSkeleton (spec: Loading the list)", () => {
  it("renders three hidden row placeholders 1rem apart in a busy region", () => {
    const { container } = render(<EvaluationListSkeleton />);
    const region = container.querySelector("[aria-busy='true']") as HTMLElement;
    expect(region.className).toContain("gap-4");
    expect(region.children).toHaveLength(3);
    for (const card of region.children) expect(card.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("EvaluationListPresentation (design.md D4, D6)", () => {
  it("renders one row per evaluation and the pagination keeping the query", () => {
    render(
      <EvaluationListPresentation
        result={{
          state: "success",
          rows: [
            { evaluation: evaluation("01JEVAL1", "01JOFFERA"), offering: A },
            { evaluation: evaluation("01JEVAL2", "01JOFFERA"), offering: A },
          ],
          meta: { current_page: 2, last_page: 3, total: 32 },
        }}
        filtered
        locale="en"
        query={{ offeringId: "01JOFFERA", page: "2" }}
        texts={TEXTS} renderRow={renderRow}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 2, name: "Huila" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(router.push).toHaveBeenCalledWith("/en/evaluations?offeringId=01JOFFERA&page=3");
  });

  it("shows the empty message and no Clear all on an empty page with no facet", () => {
    render(<EvaluationListPresentation result={{ state: "empty" }} filtered={false} locale="en" query={{}} texts={TEXTS} renderRow={renderRow} />);
    expect(screen.getByText("There are no evaluations yet.")).toBeDefined();
    expect(clearFilters).not.toHaveBeenCalled();
  });

  it("shows noMatches and the shared Clear all keeping the sort keys on an empty filtered page", () => {
    render(<EvaluationListPresentation result={{ state: "empty" }} filtered locale="en" query={{}} texts={TEXTS} renderRow={renderRow} />);
    expect(screen.getByText("No results match these filters.")).toBeDefined();
    expect(clearFilters).toHaveBeenCalledWith({ label: "Clear all", keep: ["orderBy", "orderDirection"] });
  });

  it("shows the error message with Retry, which reloads the same address", () => {
    render(<EvaluationListPresentation result={{ state: "error" }} filtered locale="en" query={{}} texts={TEXTS} renderRow={renderRow} />);
    expect(screen.getByText("The evaluations could not be loaded.")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(router.refresh).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
  });
});
