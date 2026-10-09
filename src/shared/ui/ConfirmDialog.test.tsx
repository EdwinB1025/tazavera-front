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
    it("is an alert dialog named by its title and described by its description, with the content behind it inert", () => {
      render(<Host />);
      const trigger = openFromTrigger();
      const dialog = screen.getByRole("alertdialog", {
        name: "Delete this evaluation?",
      });
      const description = document.getElementById(
        dialog.getAttribute("aria-describedby")!,
      )!;
      expect(description.textContent).toBe(
        "The evaluation will be removed permanently.",
      );
      expect(trigger.closest('[aria-hidden="true"]')).not.toBeNull();
    });

    it("starts focus on the cancel action, an action-4 Button", () => {
      render(<Host />);
      openFromTrigger();
      const cancel = screen.getByRole("button", { name: "Cancel" });
      expect(document.activeElement).toBe(cancel);
      expect(tokensOf(cancel)).toContain("bg-action-4-bg");
    });
  });

  describe("confirming (spec: Confirming)", () => {
    it("calls onConfirm when the primary confirm action is activated", () => {
      const onConfirm = vi.fn();
      render(<Host initiallyOpen onConfirm={onConfirm} />);
      const confirm = screen.getByRole("button", { name: "Delete" });
      expect(tokensOf(confirm)).toContain("bg-action-2-bg");
      fireEvent.click(confirm);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("cancelling (spec: Cancelling with Escape, Focus returns to the trigger)", () => {
    it("closes on Escape, runs no request and returns focus to the trigger", async () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();
      render(<Host onConfirm={onConfirm} onOpenChange={onOpenChange} />);
      const trigger = openFromTrigger();
      fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.queryByRole("alertdialog")).toBeNull();
      expect(onConfirm).not.toHaveBeenCalled();
      await nextTick();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe("overlay (spec: The overlay does not close)", () => {
    it("stays open on a pointer-down on the overlay", async () => {
      const onOpenChange = vi.fn();
      render(<Host onOpenChange={onOpenChange} />);
      openFromTrigger();
      await nextTick();
      const overlay = document.querySelector(
        '[data-slot="alert-dialog-overlay"]',
      )!;
      expect(tokensOf(overlay)).toEqual([
        "fixed",
        "inset-0",
        "z-50",
        "bg-nav-hover-shadow",
      ]);
      fireEvent.pointerDown(overlay);
      fireEvent.click(overlay);
      expect(screen.getByRole("alertdialog")).toBeDefined();
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("request running (spec: Request running)", () => {
    it("shows the confirm as loading, disables the cancel and ignores Escape", () => {
      const onOpenChange = vi.fn();
      render(<Host initiallyOpen pending onOpenChange={onOpenChange} />);
      const confirm = screen.getByRole("button", { name: "Delete" });
      const cancel = screen.getByRole("button", { name: "Cancel" });
      expect(confirm.getAttribute("aria-busy")).toBe("true");
      expect(cancel.hasAttribute("disabled")).toBe(true);
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole("alertdialog")).toBeDefined();
    });
  });

  describe("request failed (spec: Request failed)", () => {
    it("renders the error in type-error inside an alert region below the description, keeping the confirm activatable", () => {
      const onConfirm = vi.fn();
      render(
        <Host
          initiallyOpen
          onConfirm={onConfirm}
          error="The evaluation could not be deleted."
        />,
      );
      const dialog = screen.getByRole("alertdialog");
      const region = screen.getByRole("alert");
      expect(dialog.contains(region)).toBe(true);
      const message = screen.getByText("The evaluation could not be deleted.");
      expect(region.contains(message)).toBe(true);
      expect(tokensOf(message)).toContain("type-error");
      const description = screen.getByText(
        "The evaluation will be removed permanently.",
      );
      expect(description.compareDocumentPosition(region)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("layout (spec: Actions on a narrow viewport, Actions on a wider viewport, design.md D8)", () => {
    // Scenarios "Actions on a narrow viewport" / "Actions on a wider
    // viewport" (unify-action-button-widths): one end-aligned action group.
    it("groups cancel then confirm in one action group aligned to the end", () => {
      render(<Host initiallyOpen />);
      const cancel = screen.getByRole("button", { name: "Cancel" });
      const confirm = screen.getByRole("button", { name: "Delete" });
      expect(cancel.parentElement).toBe(confirm.parentElement);
      expect(cancel.compareDocumentPosition(confirm)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(tokensOf(cancel.parentElement!)).toEqual(
        expect.arrayContaining(["grid-cols-2", "md:justify-end"]),
      );
      expect([cancel, confirm].some((button) => tokensOf(button).includes("w-full"))).toBe(false);
    });

    it("renders the panel centred on the card surface with a container radius, a shadow, 1.5rem padding and no border", () => {
      render(<Host initiallyOpen />);
      const panel = screen.getByRole("alertdialog");
      const tokens = tokensOf(panel);
      for (const token of [
        "fixed",
        "top-1/2",
        "left-1/2",
        "z-50",
        "-translate-x-1/2",
        "-translate-y-1/2",
        "w-[calc(100%-2rem)]",
        "max-w-lg",
        "bg-surface-card",
        "rounded-container",
        "shadow-lg",
        "p-6",
      ]) {
        expect(tokens).toContain(token);
      }
      expect(tokens.filter((token) => token.startsWith("border"))).toEqual([]);
    });
  });
});
