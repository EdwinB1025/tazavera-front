import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

// The public row's actions are route buttons (fix-production-aut-findings
// design.md D4); the app router is mocked — test infrastructure only.
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

afterEach(() => {
  cleanup();
  router.push.mockReset();
});

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

  it("offers View and View offering as buttons with the coffee name as hidden suffix (spec: Unique row link names)", () => {
    render(<EvaluationRowCard variant="public" evaluation={CLOSED} offering={OFFERING} locale="en" texts={TEXTS} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    screen.getByRole("button", { name: "View Finca La Esperanza" });
    const offering = screen.getByRole("button", { name: "View offering Finca La Esperanza" });
    expect(offering.querySelector(".sr-only")?.textContent).toBe("Finca La Esperanza");
  });

  it("opens the evaluation and the offering from the row's actions (spec: Row actions open their routes)", () => {
    render(<EvaluationRowCard variant="public" evaluation={CLOSED} offering={OFFERING} locale="en" texts={TEXTS} />);
    fireEvent.click(screen.getByRole("button", { name: "View Finca La Esperanza" }));
    expect(router.push).toHaveBeenLastCalledWith(`/en/evaluations/${CLOSED.ulid}`);
    fireEvent.click(screen.getByRole("button", { name: "View offering Finca La Esperanza" }));
    expect(router.push).toHaveBeenLastCalledWith(`/en/offerings/${OFFERING.ulid}`);
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
    expect(screen.queryByRole("button", { name: /^View offering/ })).toBeNull();
    expect(screen.getByText("84.25")).toBeDefined();
    expect(screen.getByText(`Closed on ${DATE}`)).toBeDefined();
    expect(screen.getByRole("button", { name: `View Offering no longer exists, ${DATE}` })).toBeDefined();
  });
});
