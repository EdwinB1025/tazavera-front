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

vi.mock("@/widgets/evaluation-sheet", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/widgets/evaluation-sheet")>();
  return {
    ...actual,
    EvaluationSheetBaseline: ({ offeringUlid }: { offeringUlid: string }) => (
      <div data-testid="baseline" data-offering={offeringUlid} />
    ),
  };
});

const ULID = "01K6A3M8Q2V7XH4T9B5N1RCW0D";

describe("OfferingDetailScreen", () => {
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

  it("composes the baseline panel and passes it down as the provisional slot (add-public-evaluations D9)", () => {
    render(<OfferingDetailScreen locale="es" ulid={ULID} tab="provisional" />);
    expect(block.props?.tab).toBe("provisional");
    cleanup();
    render(<>{block.props?.provisional}</>);
    expect(screen.getByTestId("baseline").getAttribute("data-offering")).toBe(ULID);
  });
});
