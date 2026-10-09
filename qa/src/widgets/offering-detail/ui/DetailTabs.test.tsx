import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DetailTabs } from "@/widgets/offering-detail/ui/DetailTabs";

/**
 * Detail tabs tests (add-offering-catalog design.md D7; spec "Detail tabs in
 * the address"). The tab value lives in the address: the selected tab comes
 * from the route's `tab` value and a selection pushes `?tab={value}` at the
 * same route. The app router hook is mocked — test infrastructure only.
 */

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

beforeEach(() => {
  router.push.mockReset();
});

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

const ULID = "01K6A3M8Q2V7XH4T9B5N1RCW0D";
const LABELS = {
  inventory: "texts.tabInventory",
  consensus: "texts.tabConsensus",
  provisional: "texts.tabProvisional",
};

function renderTabs(active: "inventory" | "consensus") {
  return render(
    <DetailTabs
      active={active}
      locale="es"
      ulid={ULID}
      labels={LABELS}
      inventory={<p>Inventory panel</p>}
      consensus={<p>Consensus panel</p>}
      provisional="Provisional panel"
    />,
  );
}

describe("DetailTabs (design.md D7)", () => {
  it("renders the two tab labels from the texts", () => {
    renderTabs("inventory");
    expect(screen.getByRole("tab", { name: LABELS.inventory })).toBeDefined();
    expect(screen.getByRole("tab", { name: LABELS.consensus })).toBeDefined();
  });

  it("pushes ?tab=inventory when switching back", () => {
    renderTabs("consensus");
    fireEvent.mouseDown(screen.getByRole("tab", { name: LABELS.inventory }), {
      button: 0,
      ctrlKey: false,
    });
    expect(router.push).toHaveBeenCalledWith(
      `/es/offerings/${ULID}?tab=inventory`,
    );
  });
});
