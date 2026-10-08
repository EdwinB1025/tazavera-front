import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DetailTabs } from "./DetailTabs";
import { toDetailTab } from "../lib/tab";

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

function renderTabs(active: "inventory" | "consensus" | "provisional") {
  return render(
    <DetailTabs
      active={active}
      locale="es"
      ulid={ULID}
      labels={LABELS}
      inventory={<p>Inventory panel</p>}
      consensus={<p>Consensus panel</p>}
      provisional={<p>Provisional panel</p>}
    />,
  );
}

describe("toDetailTab (design.md D7)", () => {
  it("maps an absent tab value to inventory (spec: Default tab)", () => {
    expect(toDetailTab(undefined)).toBe("inventory");
  });

  it("maps consensus and inventory to themselves (spec: Tab named in the address)", () => {
    expect(toDetailTab("consensus")).toBe("consensus");
    expect(toDetailTab("inventory")).toBe("inventory");
  });

  it("falls back to inventory for an unknown or repeated value", () => {
    expect(toDetailTab("ratings")).toBe("inventory");
    expect(toDetailTab(["consensus", "inventory"])).toBe("inventory");
  });
});

describe("DetailTabs (design.md D7)", () => {
  it("selects inventory and renders only its panel when active is inventory (spec: Default tab)", () => {
    renderTabs("inventory");
    expect(
      screen
        .getByRole("tab", { name: LABELS.inventory })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Inventory panel");
    expect(screen.queryByText("Consensus panel")).toBeNull();
  });

  it("selects consensus and renders only its panel when active is consensus (spec: Tab named in the address)", () => {
    renderTabs("consensus");
    expect(
      screen
        .getByRole("tab", { name: LABELS.consensus })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Consensus panel");
    expect(screen.queryByText("Inventory panel")).toBeNull();
  });

  it("pushes ?tab=consensus at the same route and shows its panel on selection (spec: Switching tabs)", () => {
    renderTabs("inventory");
    fireEvent.mouseDown(screen.getByRole("tab", { name: LABELS.consensus }), {
      button: 0,
      ctrlKey: false,
    });
    expect(router.push).toHaveBeenCalledWith(
      `/es/offerings/${ULID}?tab=consensus`,
    );
    expect(screen.getByRole("tabpanel").textContent).toBe("Consensus panel");
    expect(screen.queryByText("Inventory panel")).toBeNull();
  });

  it("puts Provisional evaluation third and pushes ?tab=provisional on selection (add-public-evaluations D9)", () => {
    renderTabs("inventory");
    const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(tabs).toEqual([LABELS.inventory, LABELS.consensus, LABELS.provisional]);
    fireEvent.mouseDown(screen.getByRole("tab", { name: LABELS.provisional }), {
      button: 0,
      ctrlKey: false,
    });
    expect(router.push).toHaveBeenCalledWith(`/es/offerings/${ULID}?tab=provisional`);
    expect(screen.getByRole("tabpanel").textContent).toBe("Provisional panel");
  });
});

describe("toDetailTab with the provisional tab (add-public-evaluations D9)", () => {
  it("maps provisional to itself and an unknown value to inventory", () => {
    expect(toDetailTab("provisional")).toBe("provisional");
    expect(toDetailTab("baseline")).toBe("inventory");
  });
});
