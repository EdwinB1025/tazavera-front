import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { OfferingDetail, Session } from "@/shared/api";
import { DetailHeader } from "@/widgets/offering-detail/ui/DetailHeader";

/**
 * Detail header tests (add-offering-catalog design.md D9; specs "Header",
 * "Evaluate link for specialists", "No Evaluate link for other viewers").
 */

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

const ULID = "01K6A3M8Q2V7XH4T9B5N1RCW0D";

const TEXTS = {
  verifiedLabel: "texts.verifiedLabel",
  provisionalLabel: "texts.provisionalLabel",
  coffeeshopCaption: "texts.coffeeshopCaption",
  roasterCaption: "texts.roasterCaption",
  evaluateLabel: "texts.evaluateLabel",
  viewEvaluationsLabel: "texts.viewEvaluationsLabel",
};

const OFFERING: OfferingDetail = {
  ulid: ULID,
  cuppingAvg: "84.25",
  verificationStatus: "verified",
  location: { name: "Tazavera Gràcia" },
  coffeeInventory: {
    coffee: { name: "Huila El Mirador" },
    roastery: { name: "Nómada Roasters" },
  },
};
const ANONYMOUS: Session = { state: "anonymous" };

function renderHeader(
  offering: OfferingDetail = OFFERING,
  session: Session = ANONYMOUS,
) {
  return render(
    <DetailHeader
      offering={offering}
      locale="es"
      session={session}
      texts={TEXTS}
    />,
  );
}

describe("DetailHeader", () => {
  it("renders the provisional badge for a provisional offering", () => {
    renderHeader({ ...OFFERING, verificationStatus: "provisional" });
    expect(screen.getByText(TEXTS.provisionalLabel)).toBeDefined();
    expect(screen.queryByText(TEXTS.verifiedLabel)).toBeNull();
  });
});
