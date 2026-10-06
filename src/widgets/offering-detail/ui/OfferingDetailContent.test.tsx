import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { OfferingDetail, Session } from "@/shared/api";
import { OfferingDetailContent } from "./OfferingDetailContent";
import type {
  OfferingDetailResult,
  OfferingDetailTexts,
} from "./OfferingDetailContent";

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
    />,
  );
}

const SUCCESS: OfferingDetailResult = {
  state: "success",
  offering: OFFERING,
  taxonomies: [],
};

describe("OfferingDetailContent", () => {
  it("renders the back link to the offerings route of the locale (spec: Back link)", () => {
    renderContent(SUCCESS);
    expect(
      screen.getByRole("link", { name: TEXTS.backLabel }).getAttribute("href"),
    ).toBe("/es/offerings");
  });

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

  it("renders the back link, then the message and the retry action below it, and no tabs on error (spec: Error and retry)", () => {
    const { container } = renderContent({ state: "error" });
    const back = screen.getByRole("link", { name: TEXTS.backLabel });
    const message = screen.getByText(TEXTS.errorMessage);
    const retry = screen.getByRole("button", { name: TEXTS.retryLabel });
    expect(
      back.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      message.compareDocumentPosition(retry) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(message.className).toContain("type-body");
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(container.querySelector("h1")).toBeNull();
  });

  it("calls router.refresh() when the retry action is activated (spec: Retry reloads)", () => {
    renderContent({ state: "error" });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.retryLabel }));
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });
});
