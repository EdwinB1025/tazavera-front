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

import { InventoryField } from "@/features/offering-management/ui/InventoryField";

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
  it.each([422])("shows the failure row on a %i, with no selectable row", async (status) => {
    request.mockResolvedValue(jsonResponse(status, { message: "nope" }));
    render(<Harness />);
    await search("hui");
    expect(
      screen.getByText("Results could not be loaded", { selector: "[role=presentation]" }),
    ).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.queryByText("nope")).toBeNull();
  });

  it("with an error, shows it under the field and marks the input invalid", () => {
    render(<Harness error="Choose an inventory item." />);
    const error = screen.getByText("Choose an inventory item.");
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(input().getAttribute("aria-describedby")?.split(" ")).toContain(error.id);
  });
});
