import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { List, MapIcon } from "./icons";
import { ViewToggle } from "./ViewToggle";

afterEach(() => {
  cleanup();
});

/**
 * View toggle (add-coffeeshop-directory design.md D13; spec "Directory view
 * toggle").
 */

const ITEMS = [
  { value: "list", label: "Lista", icon: List },
  { value: "map", label: "Mapa", icon: MapIcon },
];

describe("ViewToggle", () => {
  it("is a group named by its label with the matching item pressed (spec: Default view)", () => {
    render(<ViewToggle label="Vista" value="list" items={ITEMS} onValueChange={() => {}} />);
    const group = screen.getByRole("group", { name: "Vista" });
    expect(group.className).toBe("inline-flex gap-2");
    const list = screen.getByRole("radio", { name: "Lista" });
    expect(list.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Mapa" }).getAttribute("aria-checked")).toBe("false");
    expect(list.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(new Set(list.className.split(" "))).toEqual(
      new Set(
        "inline-flex items-center gap-2 min-h-10 px-3 py-2 border border-action-3-border rounded-field type-label focus-visible:focus-ring bg-action-3-bg text-action-3-text data-[state=on]:bg-action-3-bg-hover data-[state=on]:text-action-3-text-hover".split(
          " ",
        ),
      ),
    );
  });

  it("moves the focus with an arrow key and chooses the focused item; the pressed one never unpresses (spec: Keyboard)", () => {
    const onValueChange = vi.fn();
    render(<ViewToggle label="Vista" value="list" items={ITEMS} onValueChange={onValueChange} />);
    const list = screen.getByRole("radio", { name: "Lista" });
    list.focus();
    fireEvent.keyDown(list, { key: "ArrowRight" });
    const map = screen.getByRole("radio", { name: "Mapa" });
    expect(document.activeElement).toBe(map);
    // Enter or Space activates the focused button natively; jsdom does not, so
    // the activation is the click those keys produce.
    fireEvent.click(map);
    expect(onValueChange).toHaveBeenCalledWith("map");
    onValueChange.mockReset();
    fireEvent.click(list);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
