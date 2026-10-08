import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Confirmation dialog tests (the `feedback` spec "Confirmation dialog";
 * design.md D2, D8). Written before the component body exists (task 5.1):
 * `ConfirmDialog` is not exported yet, so the file runs and fails as
 * required.
 *
 * jsdom has no CSS engine: the panel and action layout are asserted through
 * their exact classes, the contract through roles, attributes and focus.
 */

type HostProps = {
  onConfirm?: () => void;
  onOpenChange?: (open: boolean) => void;
  pending?: boolean;
  error?: ReactNode;
  initiallyOpen?: boolean;
};

/** A consumer: a trigger outside the dialog and the controlled open state. */
function Host({
  onConfirm = vi.fn(),
  onOpenChange = vi.fn(),
  pending,
  error,
  initiallyOpen = false,
}: HostProps) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <main>
      <button type="button" onClick={() => setOpen(true)}>
        Delete evaluation
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          setOpen(next);
        }}
        title="Delete this evaluation?"
        description="The evaluation will be removed permanently."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        pending={pending}
        error={error}
      />
    </main>
  );
}

function openFromTrigger(): HTMLElement {
  const trigger = screen.getByRole("button", { name: "Delete evaluation" });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

/**
 * Lets the primitive's timers run: its focus scope restores focus on the tick
 * after unmount, and its outside-pointerdown listener arms on the next tick.
 */
async function nextTick(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function tokensOf(element: Element): string[] {
  return element.getAttribute("class")!.split(/\s+/).filter(Boolean);
}

describe("ConfirmDialog", () => {
  describe("open (spec: Open, Initial focus on the cancellation)", () => {
    it("renders the title in type-card-heading and the description in type-body", () => {
      render(<Host initiallyOpen />);
      expect(tokensOf(screen.getByText("Delete this evaluation?"))).toContain(
        "type-card-heading",
      );
      expect(
        tokensOf(screen.getByText("The evaluation will be removed permanently.")),
      ).toContain("type-body");
    });
  });

  describe("cancelling (spec: Cancelling with Escape, Focus returns to the trigger)", () => {
    it("closes from the cancel action and returns focus to the trigger", async () => {
      render(<Host />);
      const trigger = openFromTrigger();
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByRole("alertdialog")).toBeNull();
      await nextTick();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe("request failed (spec: Request failed)", () => {
    it("renders no error text without an error", () => {
      render(<Host initiallyOpen error="" />);
      expect(document.querySelector(".type-error")).toBeNull();
    });
  });
});
