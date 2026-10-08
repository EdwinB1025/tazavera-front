import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { OfferingResult } from "@/entities/offering";

/**
 * The public list's async fetch component (design.md D1, D4, D6; spec
 * "Public evaluations list"; tasks 2.5): the list read, one offering read per
 * distinct non-null `offeringId`, and the per-row offering states.
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/en/evaluations",
  useSearchParams: () => new URLSearchParams(),
}));

const fetchEvaluations = vi.fn();
vi.mock("@/entities/evaluation", async (importOriginal) => ({
  loadEvaluationOfferings: (await importOriginal<typeof import("@/entities/evaluation")>())
    .loadEvaluationOfferings,
  fetchEvaluations: (...args: unknown[]) => fetchEvaluations(...args),
}));

const fetchOffering = vi.fn<(ulid: string) => Promise<OfferingResult>>();
vi.mock("@/entities/offering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/offering")>()),
  fetchOffering: (ulid: string) => fetchOffering(ulid),
}));

import { EvaluationRowCard } from "@/widgets/evaluation-row";
import { PublicEvaluationList } from "@/widgets/public-evaluation-list/ui/PublicEvaluationList";
import type { PublicEvaluationRow } from "@/widgets/public-evaluation-list/ui/EvaluationListPresentation";
import { ROW_TEXTS, TEXTS } from "@/widgets/public-evaluation-list/ui/fixtures";

/** The row slot, composed as the host page composes it. */
function renderRow(row: PublicEvaluationRow) {
  return (
    <EvaluationRowCard
      variant="public"
      evaluation={row.evaluation}
      offering={row.offering}
      locale="en"
      texts={ROW_TEXTS}
    />
  );
}

const QUERY = { evaluationType: "specialist", status: "closed", page: 1 } as const;

async function renderList() {
  render(await PublicEvaluationList({ locale: "en", query: QUERY, searchParams: {}, filtered: false, texts: TEXTS, renderRow }));
}

beforeEach(() => {
  fetchEvaluations.mockReset();
  fetchOffering.mockReset();
});
afterEach(cleanup);

describe("PublicEvaluationList (design.md D4, D6)", () => {

  it("renders the empty message on an empty page", async () => {
    fetchEvaluations.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } });
    await renderList();
    expect(screen.getByText("There are no evaluations yet.")).toBeDefined();
    expect(fetchOffering).not.toHaveBeenCalled();
  });
});
