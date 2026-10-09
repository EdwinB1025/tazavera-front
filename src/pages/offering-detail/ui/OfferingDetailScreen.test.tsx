import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
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

// The back control is a route button (render-navigation-actions-as-buttons);
// the app router is mocked — test infrastructure only.
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

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
  it("shows the back link, three placeholder bars and two skeleton cards while the offering loads (spec: Loading)", () => {
    block.suspend = true;
    const { container } = render(
      <OfferingDetailScreen locale="es" ulid={ULID} tab={undefined} />,
    );
    const es = getMessages("catalog", "es");
    fireEvent.click(screen.getByRole("button", { name: es.detailBackLabel }));
    expect(router.push).toHaveBeenCalledWith("/es/offerings");
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
