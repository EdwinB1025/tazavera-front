import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { DescriptorCascade, type CascadeNode } from "@/shared/ui";

afterEach(() => {
  cleanup();
});

/**
 * Descriptor cascade (spec form-fields "Descriptor cascade";
 * cascade-evaluation-descriptors D1, D2): children shown only while their
 * parent is chosen, down to level 2; unchoosing drops the descendants; the
 * read-only cascade keeps a chosen child under its parent's title.
 */

const NODES: CascadeNode[] = [
  {
    value: "fruity",
    label: "Fruity",
    color: "#af5e70",
    level: 0,
    children: [
      {
        value: "berry",
        label: "Berry",
        color: "#c0392b",
        level: 1,
        children: [
          { value: "blackberry", label: "Blackberry", color: "#7a1f35", level: 2, children: [] },
        ],
      },
      { value: "dried-fruit", label: "Dried fruit", color: "#8e44ad", level: 1, children: [] },
    ],
  },
  { value: "floral", label: "Floral", color: "#336699", level: 0, children: [] },
];

function cascade(value: string[], onValueChange: (values: string[]) => void = () => {}) {
  return (
    <DescriptorCascade legend="Aromatics" nodes={NODES} value={value} onValueChange={onValueChange} />
  );
}

function chip(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

describe("DescriptorCascade", () => {
  it("hides a node's children until the node is chosen", () => {
    render(cascade([]));
    expect(screen.queryByRole("button", { name: "Berry" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Fruity" })).toBeNull();
  });

  it("choosing a node reports it alone and then reveals its children unchosen", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(cascade([], onValueChange));
    fireEvent.click(chip("Fruity"));
    expect(onValueChange).toHaveBeenCalledWith(["fruity"]);
    rerender(cascade(["fruity"], onValueChange));
    const row = screen.getByRole("group", { name: "Fruity" });
    expect(within(row).getByRole("button", { name: "Berry" }).getAttribute("aria-pressed")).toBe("false");
    expect(within(row).getByRole("button", { name: "Dried fruit" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("unchoosing a node removes its children and grandchildren", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(cascade(["fruity", "berry", "blackberry", "floral"], onValueChange));
    fireEvent.click(chip("Fruity"));
    expect(onValueChange).toHaveBeenCalledWith(["floral"]);
    rerender(cascade(["floral"], onValueChange));
    expect(screen.queryByRole("group", { name: "Fruity" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Berry" })).toBeNull();
  });

  it("renders the level-2 row right after its parent's row", () => {
    render(cascade(["fruity", "berry"]));
    const level2 = screen.getByRole("group", { name: "Berry" });
    expect(within(level2).getByRole("button", { name: "Blackberry" })).toBeDefined();
    expect(screen.getByRole("group", { name: "Fruity" }).nextElementSibling).toBe(level2);
  });

  it("revealed chips join the arrow-key reading order", () => {
    render(cascade(["fruity"]));
    chip("Fruity").focus();
    fireEvent.keyDown(chip("Fruity"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(chip("Berry"));
  });

  it("read-only, a chosen child without its chosen parent sits under the parent's title", () => {
    render(<DescriptorCascade legend="Aromatics" nodes={NODES} value={["berry"]} readOnly />);
    const row = screen.getByRole("group", { name: "Fruity" });
    expect(row.querySelector("[data-taxonomy]")?.textContent).toBe("Berry");
    expect(screen.queryByRole("button")).toBeNull();
    const badges = Array.from(document.querySelectorAll("[data-taxonomy]")).map((b) => b.textContent);
    expect(badges).not.toContain("Fruity");
  });
});
