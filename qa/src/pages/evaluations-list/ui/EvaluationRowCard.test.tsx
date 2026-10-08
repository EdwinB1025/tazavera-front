import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";

/**
 * One row of "My evaluations" (design.md's card field mapping; spec "My
 * evaluations list" and "Row actions"; tasks 3.3).
 */

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn(), replace: vi.fn() }),
}));

import { SpecialistEvaluationRow as EvaluationRowCard } from "@/pages/evaluations-list/ui/SpecialistEvaluationRow";
import type { EvaluationRowTexts } from "@/pages/evaluations-list/ui/SpecialistEvaluationRow";

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
  it("renders the footer's actions: Edit or View, and Delete", () => {
    renderRow(OPEN);
    const footerActions = (row: HTMLElement) =>
      Array.from(row.querySelectorAll("button")).map((button) => button.textContent);
    const openFooter = screen.getByRole("button", { name: "Edit" }).parentElement as HTMLElement;
    expect(footerActions(openFooter)).toEqual(["Edit", "Delete"]);
    cleanup();
    renderRow(CLOSED);
    const closedFooter = screen.getByRole("button", { name: "View" }).parentElement as HTMLElement;
    expect(footerActions(closedFooter)).toEqual(["View", "Delete"]);
  });
});
