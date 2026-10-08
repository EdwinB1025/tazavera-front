import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { useState } from "react";
import type { CoffeeInventoryItem } from "@/shared/api";

// The token client is replaced by a spy so the inventory search can be
// driven without the network; the shared combobox runs as shipped. Test
// infrastructure only.
const { request, publicRequest } = vi.hoisted(() => ({
  request: vi.fn(),
  publicRequest: vi.fn(),
}));
vi.mock("@/shared/api", () => ({ request, publicRequest }));

import { InventoryField } from "./InventoryField";

// jsdom lacks ResizeObserver (Radix popper, cmdk list) and scrollIntoView
// (cmdk scrolls the active option into view). Test-only stubs.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  request.mockReset();
});

/**
 * The inventory field (design.md D4, D9, D14; spec "Creating offerings").
 * Written before `./InventoryField` exists (task 6.1).
 */

const TEXTS = {
  inventoryLabel: "Inventory item",
  inventoryHelp: "Type at least 2 letters of the coffee name.",
  inventorySearching: "Searching…",
  inventoryNoMatches: "No matches",
  inventorySearchError: "Results could not be loaded",
  inventoryLotCaption: "Lot:",
  inventoryProducedCaption: "Produced on:",
  optionCount: "Options: {count}",
};

const MIRADOR: CoffeeInventoryItem = {
  ulid: "01I1",
  roastLot: "L-2026-014",
  productionDate: "2026-09-19",
  coffee: { name: "Huila El Mirador", country: "Colombia", process: "washed" },
  roastery: { name: "Nómada Roasters" },
};
const PINK: CoffeeInventoryItem = {
  ulid: "01I2",
  roastLot: "L-2026-020",
  productionDate: "2026-09-25",
  coffee: { name: "Huila Pink Bourbon", country: "", process: "natural" },
  roastery: { name: "Nómada Roasters" },
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const onChangeSpy = vi.fn();

function Harness({ error }: { error?: string }) {
  const [value, setValue] = useState<CoffeeInventoryItem | null>(null);
  return (
    <InventoryField
      value={value}
      onChange={(item) => {
        onChangeSpy(item);
        setValue(item);
      }}
      error={error}
      texts={TEXTS}
    />
  );
}

function input(): HTMLInputElement {
  return screen.getByRole("combobox", { name: /Inventory item/ }) as HTMLInputElement;
}

async function search(text: string): Promise<void> {
  vi.useFakeTimers();
  fireEvent.change(input(), { target: { value: text } });
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
  await act(async () => {});
}

describe("InventoryField (design.md D4, D9)", () => {
  it("renders one required label naming the input, with the typing hint as help", () => {
    render(<Harness />);
    expect(screen.getAllByText("Inventory item")).toHaveLength(1);
    expect(input().hasAttribute("required")).toBe(true);
    expect(input().getAttribute("maxlength")).toBe("150");
    const help = screen.getByText(TEXTS.inventoryHelp);
    expect(input().getAttribute("aria-describedby")).toBe(help.id);
  });

  it("searches GET /coffeeInventory?coffeeName={text} through request", async () => {
    request.mockResolvedValue(jsonResponse(200, { data: [] }));
    render(<Harness />);
    await search("hui");
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toBe("/coffeeInventory?coffeeName=hui");
  });

  it("each row shows the coffee name and roastery · country · process, empty parts skipped", async () => {
    request.mockResolvedValue(jsonResponse(200, { data: [MIRADOR, PINK] }));
    render(<Harness />);
    await search("hui");
    const rows = screen.getAllByRole("option");
    expect(rows).toHaveLength(2);
    expect(rows[0]!.textContent).toContain("Huila El Mirador");
    expect(screen.getByText("Nómada Roasters · Colombia · washed")).toBeTruthy();
    // The empty country leaves no dangling separator.
    expect(screen.getByText("Nómada Roasters · natural")).toBeTruthy();
    expect(rows[1]!.textContent).not.toContain("·  ·");
    expect(rows[1]!.textContent).not.toContain("· ·");
  });

  it("choosing a row sets the item, shows its name and the labelled lot and production date as help", async () => {
    request.mockResolvedValue(jsonResponse(200, { data: [MIRADOR, PINK] }));
    render(<Harness />);
    await search("hui");
    fireEvent.click(screen.getAllByRole("option")[0]!);
    expect(onChangeSpy).toHaveBeenLastCalledWith(MIRADOR);
    expect(input().value).toBe("Huila El Mirador");
    const help = screen.getByText("Lot: L-2026-014 · Produced on: 2026-09-19");
    expect(input().getAttribute("aria-describedby")).toBe(help.id);
    expect(screen.queryByText(TEXTS.inventoryHelp)).toBeNull();
  });

  it("clearing the input clears the choice and the typing hint returns", async () => {
    request.mockResolvedValue(jsonResponse(200, { data: [MIRADOR] }));
    render(<Harness />);
    await search("hui");
    fireEvent.click(screen.getAllByRole("option")[0]!);
    fireEvent.change(input(), { target: { value: "" } });
    fireEvent.blur(input());
    expect(onChangeSpy).toHaveBeenLastCalledWith(null);
    expect(screen.getByText(TEXTS.inventoryHelp)).toBeTruthy();
    expect(screen.queryByText(/Lot:/)).toBeNull();
  });

  it("shows the searching row while the search runs, with no selectable row", async () => {
    request.mockReturnValue(new Promise(() => {}));
    render(<Harness />);
    await search("hui");
    expect(screen.getByText("Searching…", { selector: "[role=presentation]" })).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("shows the no-matches row for an empty result, with no selectable row", async () => {
    request.mockResolvedValue(jsonResponse(200, { data: [] }));
    render(<Harness />);
    await search("zzz");
    expect(screen.getByText("No matches", { selector: "[role=presentation]" })).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it.each([500])("shows the failure row on a %i, with no selectable row", async (status) => {
    request.mockResolvedValue(jsonResponse(status, { message: "nope" }));
    render(<Harness />);
    await search("hui");
    expect(
      screen.getByText("Results could not be loaded", { selector: "[role=presentation]" }),
    ).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.queryByText("nope")).toBeNull();
  });
});
