import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import type { OfferingDetailProps } from "@/widgets/offering-detail";
import { OfferingDetailScreen } from "@/pages/offering-detail";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  block.suspend = false;
  block.props = null;
});

/**
 * Detail screen tests (add-offering-catalog design.md D7–D9; specs "Offering
 * detail page" — "Loading" — and "Detail tabs in the address"). The detail
 * block is an async Server Component — untestable in Vitest — so it is
 * replaced at the widget's public API by a stub that records its props; the
 * skeleton card stub counts the fallback.
 */

const block = vi.hoisted(() => ({
  suspend: false,
  props: null as OfferingDetailProps | null,
}));

vi.mock("@/widgets/offering-detail", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/offering-detail")>();
  return {
    ...actual,
    OfferingDetail: (props: OfferingDetailProps) => {
      block.props = props;
      // Never settles, so the boundary keeps showing its fallback.
      if (block.suspend) throw new Promise<void>(() => {});
      return <div data-testid="detail-block" />;
    },
  };
});

vi.mock("@/widgets/offering-list", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/offering-list")>();
  return {
    ...actual,
    OfferingSkeletonCard: () => <div data-testid="skeleton-card" />,
  };
});

const ULID = "01K6A3M8Q2V7XH4T9B5N1RCW0D";

describe("OfferingDetailScreen", () => {
  it("passes the locale, the ulid and the anonymous session to the detail block", () => {
    render(<OfferingDetailScreen locale="es" ulid={ULID} tab={undefined} />);
    expect(screen.getByTestId("detail-block")).toBeTruthy();
    expect(block.props?.locale).toBe("es");
    expect(block.props?.ulid).toBe(ULID);
    expect(block.props?.session).toEqual({ state: "anonymous" });
  });

  it("maps the tab value: inventory by default, consensus when named, inventory for an unknown value (specs: Default tab, Tab named in the address)", () => {
    const cases: [string | undefined, string][] = [
      [undefined, "inventory"],
      ["consensus", "consensus"],
      ["unknown", "inventory"],
    ];
    for (const [tab, expected] of cases) {
      const { unmount } = render(
        <OfferingDetailScreen locale="es" ulid={ULID} tab={tab} />,
      );
      expect(block.props?.tab).toBe(expected);
      unmount();
    }
  });

  it("feeds the catalog's detail texts and landing's header and retry texts to the block (design.md D16)", () => {
    render(<OfferingDetailScreen locale="ca" ulid={ULID} tab={undefined} />);
    const catalog = getMessages("catalog", "ca");
    const landing = getMessages("landing", "ca");
    expect(block.props?.texts).toEqual(
      expect.objectContaining({
        backLabel: catalog.detailBackLabel,
        errorMessage: catalog.detailErrorMessage,
        tabInventory: catalog.detailTabInventory,
        tabConsensus: catalog.detailTabConsensus,
        retryLabel: landing.listRetryLabel,
        verifiedLabel: landing.cardVerifiedLabel,
        provisionalLabel: landing.cardProvisionalLabel,
        coffeeshopCaption: landing.cardCoffeeshopCaption,
        roasterCaption: landing.cardRoasterCaption,
        evaluateLabel: landing.cardEvaluateLabel,
      }),
    );
  });

  it("shows the back link, three placeholder bars and two skeleton cards while the offering loads (spec: Loading)", () => {
    block.suspend = true;
    const { container } = render(
      <OfferingDetailScreen locale="es" ulid={ULID} tab={undefined} />,
    );
    const es = getMessages("catalog", "es");
    expect(
      screen
        .getByRole("link", { name: es.detailBackLabel })
        .getAttribute("href"),
    ).toBe("/es/offerings");
    const bars = container.querySelectorAll(".animate-pulse");
    expect(bars).toHaveLength(3);
    const sizes = Array.from(bars).map((bar) =>
      (bar.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter((token) => /^[hw]-/.test(token))
        .join(" "),
    );
    expect(sizes).toEqual(["h-4 w-1/4", "h-6 w-2/3", "h-4 w-1/2"]);
    for (const bar of bars) {
      expect(bar.getAttribute("class")).toContain("bg-surface-section");
      expect(bar.getAttribute("class")).toContain("rounded-field");
    }
    expect(screen.getAllByTestId("skeleton-card")).toHaveLength(2);
    expect(screen.queryByTestId("detail-block")).toBeNull();
    expect(container.querySelector("h1")).toBeNull();
  });
});
