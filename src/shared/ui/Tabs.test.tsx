import { describe, it, expect, afterEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/Tabs";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Tabs tests (design.md D6; content-structure "Tabs"). jsdom has no CSS
 * engine: the presentation is verified by exact class tokens, variant
 * prefixes included.
 */

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function Fixture({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="inventory">Inventory data</TabsTrigger>
        <TabsTrigger value="consensus">Consensus</TabsTrigger>
      </TabsList>
      <TabsContent value="inventory">Inventory panel</TabsContent>
      <TabsContent value="consensus">Consensus panel</TabsContent>
    </Tabs>
  );
}

/** A consumer that owns the selected value (the controlled contract). */
function Controlled({ initial = "inventory" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <Fixture value={value} onValueChange={setValue} />;
}

/** Activates a trigger the way a pointer does (Radix selects on mouse down). */
function press(element: Element) {
  fireEvent.mouseDown(element, { button: 0, ctrlKey: false });
}

describe("Tabs", () => {
  it("renders exactly one panel; the other panel renders nothing", () => {
    render(<Controlled />);
    const panels = screen.getAllByRole("tabpanel");
    expect(panels).toHaveLength(1);
    expect(panels[0].textContent).toBe("Inventory panel");
    expect(screen.queryByText("Consensus panel")).toBeNull();
  });

  it("marks an activated tab selected and shows its panel", () => {
    render(<Controlled />);
    const consensus = screen.getByRole("tab", { name: "Consensus" });
    expect(consensus.getAttribute("aria-selected")).toBe("false");
    press(consensus);
    expect(consensus.getAttribute("aria-selected")).toBe("true");
    expect(
      screen
        .getByRole("tab", { name: "Inventory data" })
        .getAttribute("aria-selected"),
    ).toBe("false");
    expect(screen.getByRole("tabpanel").textContent).toBe("Consensus panel");
    expect(screen.queryByText("Inventory panel")).toBeNull();
  });

  it("selects the focused tab with Enter", () => {
    render(<Controlled />);
    const consensus = screen.getByRole("tab", { name: "Consensus" });
    consensus.focus();
    fireEvent.keyDown(consensus, { key: "Enter" });
    expect(consensus.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Consensus panel");
  });

  it("moves the focus with the arrow keys without changing the visible panel", async () => {
    const onValueChange = vi.fn();
    render(<Fixture value="inventory" onValueChange={onValueChange} />);
    const inventory = screen.getByRole("tab", { name: "Inventory data" });
    const consensus = screen.getByRole("tab", { name: "Consensus" });
    inventory.focus();
    // Radix moves the roving focus on the next tick.
    fireEvent.keyDown(inventory, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(consensus));
    fireEvent.keyDown(consensus, { key: "ArrowLeft" });
    await waitFor(() => expect(document.activeElement).toBe(inventory));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tabpanel").textContent).toBe("Inventory panel");
  });

  it("follows the controlled value and reports selections through onValueChange", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Fixture value="consensus" onValueChange={onValueChange} />,
    );
    expect(screen.getByRole("tabpanel").textContent).toBe("Consensus panel");
    press(screen.getByRole("tab", { name: "Inventory data" }));
    expect(onValueChange).toHaveBeenCalledWith("inventory");
    // The consumer owns the value: nothing changes until it passes a new one.
    expect(screen.getByRole("tabpanel").textContent).toBe("Consensus panel");
    rerender(<Fixture value="inventory" onValueChange={onValueChange} />);
    expect(screen.getByRole("tabpanel").textContent).toBe("Inventory panel");
  });

  it("carries the D6 classes on the list, the triggers and the selected trigger", () => {
    render(<Controlled />);
    const list = screen.getByRole("tablist");
    expect(classTokens(list)).toEqual(
      expect.arrayContaining(["flex", "border-b", "border-border-subtle"]),
    );
    for (const trigger of screen.getAllByRole("tab")) {
      expect(classTokens(trigger)).toEqual(
        expect.arrayContaining([
          "type-label",
          "text-text-secondary",
          "focus-visible:focus-ring",
          "data-[state=active]:text-text-primary",
          "data-[state=active]:border-border-accent",
        ]),
      );
    }
    const selected = screen.getByRole("tab", { name: "Inventory data" });
    expect(selected.getAttribute("data-state")).toBe("active");
    expect(
      screen.getByRole("tab", { name: "Consensus" }).getAttribute("data-state"),
    ).toBe("inactive");
  });
});
