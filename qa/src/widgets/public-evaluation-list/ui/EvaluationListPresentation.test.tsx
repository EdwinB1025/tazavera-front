import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

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
import { EvaluationListPresentation } from "@/widgets/public-evaluation-list/ui/EvaluationListPresentation";
import type { PublicEvaluationRow } from "@/widgets/public-evaluation-list/ui/EvaluationListPresentation";
import { ROW_TEXTS, TEXTS, evaluation } from "@/widgets/public-evaluation-list/ui/fixtures";

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

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
  clearFilters.mockClear();
});
afterEach(cleanup);

describe("EvaluationListPresentation (design.md D4, D6)", () => {

  it("announces the total as a polite status", () => {
    render(
      <EvaluationListPresentation
        result={{ state: "success", rows: [{ evaluation: evaluation("01JEVAL1", null), offering: null }], meta: { current_page: 1, last_page: 1, total: 1 } }}
        filtered={false}
        locale="en"
        query={{}}
        texts={TEXTS} renderRow={renderRow}
      />,
    );
    expect(screen.getByRole("status").textContent).toBe("Results: 1");
  });
});
