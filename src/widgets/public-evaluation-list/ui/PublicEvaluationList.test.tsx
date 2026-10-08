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
vi.mock("@/entities/evaluation", () => ({
  fetchEvaluations: (...args: unknown[]) => fetchEvaluations(...args),
}));

const fetchOffering = vi.fn<(ulid: string) => Promise<OfferingResult>>();
vi.mock("@/entities/offering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/offering")>()),
  fetchOffering: (ulid: string) => fetchOffering(ulid),
}));

import { EvaluationRowCard } from "@/widgets/evaluation-row";
import { PublicEvaluationList } from "./PublicEvaluationList";
import type { PublicEvaluationRow } from "./EvaluationListPresentation";
import { ROW_TEXTS, TEXTS, evaluation, offering } from "./fixtures";

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
  it("reads each distinct non-null offering once and renders the null row as offering-missing", async () => {
    fetchEvaluations.mockResolvedValue({
      data: [
        evaluation("01JEVAL1", "01JOFFERA"),
        evaluation("01JEVAL2", "01JOFFERA"),
        evaluation("01JEVAL3", "01JOFFERB"),
        evaluation("01JEVAL4", null),
      ],
      meta: { current_page: 1, last_page: 1, total: 4 },
    });
    fetchOffering.mockImplementation(async (ulid) => ({
      status: "found",
      offering: offering(ulid, ulid === "01JOFFERA" ? "Huila" : "Sidama"),
    }));
    await renderList();
    expect(fetchEvaluations).toHaveBeenCalledWith(QUERY);
    expect(fetchOffering.mock.calls.map(([ulid]) => ulid).sort()).toEqual(["01JOFFERA", "01JOFFERB"]);
    expect(screen.getAllByRole("heading", { level: 2, name: "Huila" })).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 2, name: "Sidama" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "Offering no longer exists" })).toBeDefined();
  });

  it("renders offeringUnavailable on the row whose offering read failed, leaving its siblings", async () => {
    fetchEvaluations.mockResolvedValue({
      data: [evaluation("01JEVAL1", "01JOFFERA"), evaluation("01JEVAL2", "01JOFFERB")],
      meta: { current_page: 1, last_page: 1, total: 2 },
    });
    fetchOffering.mockImplementation(async (ulid) =>
      ulid === "01JOFFERA" ? { status: "found", offering: offering(ulid, "Huila") } : { status: "failed" },
    );
    await renderList();
    expect(screen.getByRole("heading", { level: 2, name: "Huila" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "Offering unavailable" })).toBeDefined();
  });

  it("renders the error state when the list read rejects", async () => {
    fetchEvaluations.mockRejectedValue(new Error("422"));
    await renderList();
    expect(screen.getByText("The evaluations could not be loaded.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
  });

  it("renders the empty message on an empty page", async () => {
    fetchEvaluations.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } });
    await renderList();
    expect(screen.getByText("There are no evaluations yet.")).toBeDefined();
    expect(fetchOffering).not.toHaveBeenCalled();
  });
});
