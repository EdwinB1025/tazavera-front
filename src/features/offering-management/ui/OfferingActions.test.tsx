import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { OfferingSummary } from "@/shared/api";
import { OfferingActions } from "./OfferingActions";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The card `actions` content (design.md D7; spec "Offering selection").
 * Written before `./OfferingActions` exists (task 4.1).
 */

const TEXTS = { selectLabel: "Select", deleteLabel: "Delete" };

const OFFERING: OfferingSummary = {
  ulid: "01A",
  location: { ulid: "L01A", name: "Tazavera Gràcia" },
  coffeeInventory: { coffee: { name: "Huila El Mirador" } },
};

function renderActions(selected = false) {
  const onToggle = vi.fn();
  const onDelete = vi.fn();
  const view = render(
    <OfferingActions
      offering={OFFERING}
      selected={selected}
      onToggle={onToggle}
      onDelete={onDelete}
      texts={TEXTS}
    />,
  );
  return { ...view, onToggle, onDelete };
}

// The `action-2` treatment at the compact size with its leading icon
// (Button's own classes for `variant="action-2" size="sm"`).
const DELETE_CLASSES = [
  "type-button inline-flex items-center justify-center gap-2 rounded-pill",
  "focus-visible:focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
  "border bg-action-2-bg text-action-2-text border-action-2-border",
  "enabled:hover:bg-action-2-bg-hover enabled:hover:text-action-2-text-hover",
  "h-8 px-3",
].join(" ");

describe("OfferingActions (design.md D7)", () => {
  it("renders Select then Delete in one wrapper, a centred row 0.5rem apart", () => {
    const { container } = renderActions();

    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toBe("flex items-center gap-2");
    const select = screen.getByRole("checkbox");
    const remove = screen.getByRole("button");
    expect(wrapper.contains(select) && wrapper.contains(remove)).toBe(true);
    expect(
      select.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("names Select by its label, the coffee and the location", () => {
    renderActions();

    expect(
      screen.getByRole("checkbox", {
        name: "Select Huila El Mirador — Tazavera Gràcia",
      }),
    ).toBeTruthy();
  });

  it("names Delete starting with its visible label, then the coffee and the location", () => {
    renderActions();

    const remove = screen.getByRole("button", {
      name: "Delete Huila El Mirador — Tazavera Gràcia",
    });
    expect(remove.textContent).toBe(TEXTS.deleteLabel);
    expect(remove.getAttribute("aria-label")!.startsWith(remove.textContent!)).toBe(true);
  });

  it("renders Delete with the action-2 treatment, the compact size and the Trash2 icon", () => {
    renderActions();

    const remove = screen.getByRole("button");
    expect(remove.className).toBe(DELETE_CLASSES);
    expect(remove.querySelector("svg.lucide-trash-2")).not.toBeNull();
  });

  it("reflects the selection and reports a toggle and a delete", () => {
    const { onToggle, onDelete } = renderActions(true);

    const select = screen.getByRole("checkbox") as HTMLInputElement;
    expect(select.checked).toBe(true);
    fireEvent.click(select);
    expect(onToggle).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button"));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
