import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { EvaluationRowCard } from "@/widgets/evaluation-row/ui/EvaluationRowCard";
import type { EvaluationRowCardTexts } from "@/widgets/evaluation-row/ui/EvaluationRowCard";

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

  it("renders an empty aside and no date line for a null score and a null closedAt", () => {
    const { container } = render(
      <EvaluationRowCard
        variant="public"
        evaluation={{ ...CLOSED, cuppingScore: null, closedAt: null }}
        offering={OFFERING}
        locale="en"
        texts={TEXTS}
      />,
    );
    expect(screen.queryByText("/100")).toBeNull();
    expect(screen.queryByText(/^Closed on/)).toBeNull();
    const aside = container.querySelector(".lg\\:w-1\\/4");
    expect(aside?.childElementCount).toBe(0);
  });

  it("shows offeringUnavailable with no captions and no View offering when the offering read failed", () => {
    render(<EvaluationRowCard variant="public" evaluation={CLOSED} offering={null} locale="en" texts={TEXTS} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Offering unavailable");
    expect(screen.queryByText(/^Coffeeshop:/)).toBeNull();
    expect(screen.queryByRole("link", { name: /^View offering/ })).toBeNull();
    expect(screen.getByRole("link", { name: `View Offering unavailable, ${DATE}` })).toBeDefined();
  });

  it("omits the date and its comma from the suffix when closedAt is null", () => {
    render(
      <EvaluationRowCard
        variant="public"
        evaluation={{ ...CLOSED, offeringId: null, closedAt: null }}
        offering={null}
        locale="en"
        texts={TEXTS}
      />,
    );
    expect(screen.getByRole("link", { name: "View Offering no longer exists" })).toBeDefined();
  });
});

describe("EvaluationRowCard, specialist variant (design.md D6)", () => {
  it("keeps the status badge and renders its own actions instead of the public links", () => {
    render(
      <EvaluationRowCard
        variant="specialist"
        evaluation={CLOSED}
        offering={OFFERING}
        locale="en"
        texts={TEXTS}
        actions={<button type="button">Delete</button>}
      />,
    );
    expect(screen.getByText("Closed").className).toContain("bg-badge-verified-bg");
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
