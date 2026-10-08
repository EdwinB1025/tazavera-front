import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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
