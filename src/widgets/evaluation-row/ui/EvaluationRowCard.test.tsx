import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { EvaluationRowCard } from "./EvaluationRowCard";
import type { EvaluationRowCardTexts } from "./EvaluationRowCard";

/**
 * The row card of the `evaluation-row` widget (design.md D6; spec "Public
 * evaluations list"; tasks 2.3): the public variant's field mapping and
 * links, the specialist variant's badge and actions slot, and the rows
 * without a coffee name.
 */

const TEXTS: EvaluationRowCardTexts = {
  openLabel: "Open",
  closedLabel: "Closed",
  createdOnLabel: "Created on",
  closedOnLabel: "Closed on",
  coffeeshopCaption: "Coffeeshop:",
  roasterCaption: "Roaster:",
  ratingExceptionalLabel: "Exceptional",
  ratingExcellentLabel: "Excellent",
  ratingGoodLabel: "Good",
  ratingCommercialLabel: "Commercial",
  offeringMissingLabel: "Offering no longer exists",
  viewLabel: "View",
  viewOfferingLabel: "View offering",
  offeringUnavailableLabel: "Offering unavailable",
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

const DATE = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(
  new Date(CLOSED.closedAt as string),
);

afterEach(cleanup);

describe("EvaluationRowCard, public variant (design.md D6)", () => {
  it("maps the score row, the h2, the date line and the captions, with no status badge", () => {
    render(<EvaluationRowCard variant="public" evaluation={CLOSED} offering={OFFERING} locale="en" texts={TEXTS} />);
    expect(screen.getByText("84.25").className).toContain("type-score");
    expect(screen.getByText("/100").className).toContain("type-meta");
    expect(screen.getByText("Good").className).toContain("bg-evaluation-rating-good");
    const heading = screen.getByRole("heading", { level: 2, name: "Finca La Esperanza" });
    expect(heading.className).toContain("type-card-heading");
    const date = screen.getByText(`Closed on ${DATE}`);
    expect(date.className).toContain("type-meta");
    expect(screen.getByText("Coffeeshop: Cafè del Born").className).toContain("type-label");
    expect(screen.getByText("Roaster: Nomad").className).toContain("type-label");
    expect(screen.queryByText("Closed")).toBeNull();
  });

  it("links View and View offering with the coffee name as hidden suffix", () => {
    render(<EvaluationRowCard variant="public" evaluation={CLOSED} offering={OFFERING} locale="en" texts={TEXTS} />);
    const view = screen.getByRole("link", { name: "View Finca La Esperanza" });
    expect(view.getAttribute("href")).toBe(`/en/evaluations/${CLOSED.ulid}`);
    const offering = screen.getByRole("link", { name: "View offering Finca La Esperanza" });
    expect(offering.getAttribute("href")).toBe(`/en/offerings/${OFFERING.ulid}`);
    expect(offering.querySelector(".sr-only")?.textContent).toBe("Finca La Esperanza");
  });

  it("shows the offering-missing heading for a null offeringId, keeping score, date and View", () => {
    render(
      <EvaluationRowCard
        variant="public"
        evaluation={{ ...CLOSED, offeringId: null }}
        offering={null}
        locale="en"
        texts={TEXTS}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Offering no longer exists");
    expect(screen.queryByText(/^Roaster:/)).toBeNull();
    expect(screen.queryByRole("link", { name: /^View offering/ })).toBeNull();
    expect(screen.getByText("84.25")).toBeDefined();
    expect(screen.getByText(`Closed on ${DATE}`)).toBeDefined();
    expect(screen.getByRole("link", { name: `View Offering no longer exists, ${DATE}` })).toBeDefined();
  });
});
