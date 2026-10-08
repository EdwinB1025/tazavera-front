import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";

/**
 * One row of "My evaluations" (design.md's card field mapping; spec "My
 * evaluations list" and "Row actions"; tasks 3.3).
 */

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn(), replace: vi.fn() }),
}));

import { SpecialistEvaluationRow as EvaluationRowCard } from "./SpecialistEvaluationRow";
import type { EvaluationRowTexts } from "./SpecialistEvaluationRow";

const TEXTS: EvaluationRowTexts = {
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
  deleteLabel: "Delete",
  deleteTitle: "Delete this evaluation?",
  deleteDescription: "The evaluation and its scores will be removed.",
  deleteConfirmLabel: "Delete evaluation",
  deleteCancelLabel: "Cancel",
  notYoursMessage: "This evaluation is not yours.",
  failureMessage: "Something went wrong. Try again later.",
  offeringMissingLabel: "Offering no longer exists",
};

const OFFERING: OfferingDetail = {
  ulid: "01JOFFER000000000000000001",
  location: { name: "Cafè del Born" },
  coffeeInventory: {
    coffee: { name: "Finca La Esperanza", roastLevel: "medium" },
    roastery: { name: "Nomad" },
  },
};

const CLOSED: EvaluationItem = {
  ulid: "01JEVAL0000000000000000001",
  offeringId: OFFERING.ulid,
  status: "closed",
  cuppingScore: "84.25",
  createdAt: "2026-10-01T16:40:00.000000Z",
  closedAt: "2026-10-02T11:05:30.000000Z",
};

const OPEN: EvaluationItem = {
  ulid: "01JEVAL0000000000000000002",
  offeringId: OFFERING.ulid,
  status: "open",
  cuppingScore: null,
  createdAt: "2026-10-06T09:12:45.000000Z",
  closedAt: null,
};

function renderRow(evaluation: EvaluationItem) {
  return render(
    <EvaluationRowCard
      evaluation={evaluation}
      offering={OFFERING}
      locale="en"
      texts={TEXTS}
      onDeleted={vi.fn()}
    />,
  );
}

afterEach(() => {
  cleanup();
  push.mockReset();
});

describe("EvaluationRowCard (design.md card field mapping)", () => {
  it("renders the score, the scale and the tier badge of a closed row", () => {
    renderRow(CLOSED);
    expect(screen.getByText("84.25").className).toContain("type-score");
    expect(screen.getByText("/100").className).toContain("type-meta");
    const tier = screen.getByText("Good");
    expect(tier.className).toContain("bg-evaluation-rating-good");
    expect(tier.textContent).toBe("Good");
  });

  it("renders the status badge, the coffee name, the closed date and the captions", () => {
    renderRow(CLOSED);
    expect(screen.getByText("Closed").className).toContain("bg-badge-verified-bg");
    const name = screen.getByRole("heading", { name: "Finca La Esperanza" });
    expect(name.className).toContain("type-card-heading");
    const date = name.nextElementSibling as HTMLElement;
    expect(date.className).toContain("type-meta");
    expect(date.textContent).toBe("Closed on 2026-10-02");
    expect(date.querySelector("time")?.getAttribute("dateTime")).toBe(CLOSED.closedAt);
    expect(screen.getByText("Coffeeshop: Cafè del Born").className).toContain("type-label");
    expect(screen.getByText("Roaster: Nomad").className).toContain("type-label");
  });

  it("renders no score, no scale and no rating badge for an open row without a score", () => {
    renderRow(OPEN);
    expect(screen.queryByText("/100")).toBeNull();
    for (const word of ["Exceptional", "Excellent", "Good", "Commercial"]) {
      expect(screen.queryByText(word)).toBeNull();
    }
    expect(screen.getByText("Open").className).toContain("bg-badge-provisional-bg");
    const name = screen.getByRole("heading", { name: "Finca La Esperanza" });
    expect((name.nextElementSibling as HTMLElement).textContent).toBe("Created on 2026-10-06");
  });

  it("offers Edit for an open row and View for a closed one, both opening the form route", () => {
    renderRow(OPEN);
    expect(screen.queryByRole("button", { name: "View" })).toBeNull();
    const edit = screen.getByRole("button", { name: "Edit" });
    expect(edit.className).toContain("bg-action-3-bg");
    fireEvent.click(edit);
    expect(push).toHaveBeenCalledWith(`/en/manage/evaluations/${OPEN.ulid}`);
    cleanup();
    renderRow(CLOSED);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(push).toHaveBeenLastCalledWith(`/en/manage/evaluations/${CLOSED.ulid}`);
  });
});

describe("EvaluationRowCard: an evaluation of a deleted offering (design.md D17; tasks 12.4)", () => {
  function renderOrphan(evaluation: EvaluationItem) {
    return render(
      <EvaluationRowCard
        evaluation={{ ...evaluation, offeringId: null }}
        offering={null}
        locale="en"
        texts={TEXTS}
        onDeleted={vi.fn()}
      />,
    );
  }

  it("shows the message in place of the coffee name and no captions, keeping status and date", () => {
    renderOrphan(OPEN);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Offering no longer exists");
    expect(screen.queryByText(/^Coffeeshop:/)).toBeNull();
    expect(screen.queryByText(/^Roaster:/)).toBeNull();
    expect(screen.getByText("Open")).toBeDefined();
    expect(screen.getByText("Created on", { exact: false }).textContent).toBe(
      "Created on 2026-10-06",
    );
  });

  it("offers View and Delete and no Edit on an open row, View opening the form route", () => {
    renderOrphan(OPEN);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(push).toHaveBeenCalledWith(`/en/manage/evaluations/${OPEN.ulid}`);
  });

  it("keeps the score row of a closed row", () => {
    renderOrphan(CLOSED);
    expect(screen.getByText("84.25").className).toContain("type-score");
    expect(screen.getByText("/100")).toBeDefined();
    expect(screen.getByRole("button", { name: "View" })).toBeDefined();
  });
});
