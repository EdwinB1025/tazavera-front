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
  tabProvisional: "texts.tabProvisional",
  viewEvaluationsLabel: "texts.viewEvaluationsLabel",
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
  tab: "inventory" | "consensus" | "provisional" = "inventory",
) {
  return render(
    <OfferingDetailContent
      result={result}
      locale="es"
      ulid={ULID}
      tab={tab}
      session={ANONYMOUS}
      texts={TEXTS}
      provisional={<p>Provisional panel error</p>}
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
      screen.getAllByRole("link", { name: TEXTS.backLabel })[0].getAttribute("href"),
    ).toBe("/es/offerings");
  });

  it("Back link at the end", () => {
    renderContent(SUCCESS);
    const links = screen.getAllByRole("link", { name: TEXTS.backLabel });
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/es/offerings", "/es/offerings"]);
    const panel = screen.getByRole("tabpanel");
    expect(panel.contains(links[1])).toBe(false);
    expect(panel.compareDocumentPosition(links[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders the header block and the tabs in one section on the page background, 2rem apart (spec: Detail on the page background; design.md D9)", () => {
    const { container } = renderContent(SUCCESS);
    const sections = container.querySelectorAll("section");
    expect(sections).toHaveLength(1);
    const section = sections[0];
    expect(section.className.split(/\s+/)).toContain("bg-surface-page");
    expect(container.querySelector('[class~="bg-surface-section"]')).toBeNull();
    const back = screen.getAllByRole("link", { name: TEXTS.backLabel })[0];
    const heading = screen.getByRole("heading", { level: 1 });
    const tablist = screen.getByRole("tablist");
    for (const element of [back, heading, tablist]) {
      expect(section.contains(element)).toBe(true);
    }
    const blocks = section.firstElementChild!;
    expect(blocks.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["flex", "flex-col", "gap-8"]),
    );
    const blockOf = (element: Element): Element => {
      let item = element;
      while (item.parentElement !== blocks) item = item.parentElement!;
      return item;
    };
    expect(blockOf(back)).not.toBe(blockOf(tablist));
    expect(blockOf(back)).toBe(blockOf(heading));
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
