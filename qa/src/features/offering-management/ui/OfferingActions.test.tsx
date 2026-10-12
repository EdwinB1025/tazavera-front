import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { OfferingSummary } from "@/shared/api";
import { OfferingActions } from "@/features/offering-management/ui/OfferingActions";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The card `actions` content: Delete alone (fix-offering-card-actions-layout
 * design.md D2). Its accessible name and the footer layout are covered by the
 * validation suite; these check its visible text and its treatment.
 */

const TEXTS = { deleteLabel: "Delete" };

const OFFERING: OfferingSummary = {
  ulid: "01A",
  location: { ulid: "L01A", name: "Tazavera Gràcia" },
  coffeeInventory: { coffee: { name: "Huila El Mirador" } },
};

function renderActions() {
  return render(<OfferingActions offering={OFFERING} onDelete={() => {}} texts={TEXTS} />);
}

// The `action-2` treatment at the compact size with its leading icon
// (Button's own classes for `variant="action-2" size="sm"`).
const DELETE_CLASSES = [
  "type-button inline-flex items-center justify-center gap-2 rounded-pill",
  "focus-visible:focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
  "border bg-action-2-bg text-action-2-text border-action-2-border",
  "enabled:hover:bg-action-2-bg-hover enabled:hover:text-action-2-text-hover",
  "h-8 px-3 min-w-action-sm whitespace-nowrap",
].join(" ");

describe("OfferingActions (fix-offering-card-actions-layout design.md D2)", () => {
  it("shows only its visible label while its name adds the coffee and the location", () => {
    renderActions();

    const remove = screen.getByRole("button", {
      name: "Delete Huila El Mirador — Tazavera Gràcia",
    });
    expect(remove.textContent).toBe(TEXTS.deleteLabel);
  });

  it("renders Delete with the action-2 treatment, the compact size and the Trash2 icon", () => {
    renderActions();

    const remove = screen.getByRole("button");
    expect(remove.className).toBe(DELETE_CLASSES);
    expect(remove.querySelector("svg.lucide-trash-2")).not.toBeNull();
  });
});
