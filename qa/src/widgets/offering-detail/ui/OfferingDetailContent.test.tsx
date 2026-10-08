import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { OfferingDetail, Session } from "@/shared/api";
import { OfferingDetailContent } from "@/widgets/offering-detail/ui/OfferingDetailContent";
import type {
  OfferingDetailResult,
  OfferingDetailTexts,
} from "@/widgets/offering-detail/ui/OfferingDetailContent";

/**
 * Detail presentation tests (add-offering-catalog design.md D8, D9; specs
 * "Offering detail page" — "Back link", "Error and retry", "Retry reloads" —
 * and "Detail tabs in the address"). The tabs and the retry action are client
 * components; the app router hook is mocked — test infrastructure only.
 */

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
});

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

const ULID = "01K6A3M8Q2V7XH4T9B5N1RCW0D";

const TEXTS = {
  backLabel: "texts.backLabel",
  errorMessage: "texts.errorMessage",
  retryLabel: "texts.retryLabel",
  tabInventory: "texts.tabInventory",
  tabConsensus: "texts.tabConsensus",
  verifiedLabel: "texts.verifiedLabel",
  provisionalLabel: "texts.provisionalLabel",
  coffeeshopCaption: "texts.coffeeshopCaption",
  roasterCaption: "texts.roasterCaption",
  evaluateLabel: "texts.evaluateLabel",
} as OfferingDetailTexts;

const OFFERING: OfferingDetail = {
  ulid: ULID,
  verificationStatus: "verified",
  location: { name: "Tazavera Gràcia" },
  coffeeInventory: {
    coffee: { name: "Huila El Mirador" },
    roastery: { name: "Nómada Roasters" },
  },
};

const ANONYMOUS: Session = { state: "anonymous" };

function renderContent(
  result: OfferingDetailResult,
  tab: "inventory" | "consensus" = "inventory",
) {
  return render(
    <OfferingDetailContent
      result={result}
      locale="es"
      ulid={ULID}
      tab={tab}
      session={ANONYMOUS}
      texts={TEXTS}
      provisional="Provisional panel"
    />,
  );
}

const SUCCESS: OfferingDetailResult = {
  state: "success",
  offering: OFFERING,
  taxonomies: [],
};

describe("OfferingDetailContent", () => {
  it("renders the header and the two tabs on success, with the tab of the address selected", () => {
    renderContent(SUCCESS, "consensus");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Huila El Mirador",
    );
    expect(
      screen
        .getByRole("tab", { name: TEXTS.tabConsensus })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(screen.queryByText(TEXTS.errorMessage)).toBeNull();
  });
});
