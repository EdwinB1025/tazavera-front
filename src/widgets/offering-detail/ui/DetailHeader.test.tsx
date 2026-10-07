import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { OfferingDetail, Session } from "@/shared/api";
import { DetailHeader } from "./DetailHeader";

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

const SPECIALIST: Session = {
  state: "authenticated",
  user: { role: "specialist" },
};
const OTHER_ROLE: Session = {
  state: "authenticated",
  user: { role: "coffeeshop" },
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
  it("renders the status badge, the coffee name heading and the two captions with the API's names (spec: Header)", () => {
    const { container } = renderHeader();
    expect(screen.getByText(TEXTS.verifiedLabel)).toBeDefined();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Huila El Mirador",
    );
    expect(
      screen.getByText(`${TEXTS.coffeeshopCaption} Tazavera Gràcia`).className,
    ).toContain("type-label");
    expect(
      screen.getByText(`${TEXTS.roasterCaption} Nómada Roasters`).className,
    ).toContain("type-label");
    // No score in the header.
    expect(container.textContent).not.toContain("84.25");
    expect(container.querySelector(".type-score")).toBeNull();
  });

  it("renders the provisional badge for a provisional offering", () => {
    renderHeader({ ...OFFERING, verificationStatus: "provisional" });
    expect(screen.getByText(TEXTS.provisionalLabel)).toBeDefined();
    expect(screen.queryByText(TEXTS.verifiedLabel)).toBeNull();
  });

  it("renders the Evaluate link for a signed-in specialist (spec: Evaluate link for specialists)", () => {
    renderHeader(OFFERING, SPECIALIST);
    expect(
      screen
        .getByRole("link", { name: TEXTS.evaluateLabel })
        .getAttribute("href"),
    ).toBe(`/es/manage/evaluations/new?offering=${ULID}`);
  });

  it("renders no Evaluate link for an anonymous viewer or another role (spec: No Evaluate link for other viewers)", () => {
    for (const session of [ANONYMOUS, OTHER_ROLE]) {
      const { unmount } = renderHeader(OFFERING, session);
      expect(
        screen.queryByRole("link", { name: TEXTS.evaluateLabel }),
      ).toBeNull();
      unmount();
    }
  });
});
