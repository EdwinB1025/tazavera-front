import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// The token client and the auth feature are mocked so nothing reaches the
// network or the popup flow. Test infrastructure only.
vi.mock("@/shared/api", () => ({ request: vi.fn(), publicRequest: vi.fn() }));
vi.mock("@/features/auth", () => ({
  requestProfileWrite: vi.fn(),
  signIn: vi.fn(),
  useSession: vi.fn(),
}));

import { DeleteOfferingsDialog } from "@/features/offering-management/ui/DeleteOfferingsDialog";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The confirmation of both delete flows (design.md D5, D7; spec "Deleting
 * offerings"). Written before `./DeleteOfferingsDialog` exists (task 5.1).
 */

const TEXTS = {
  deleteOneTitle: "Delete this offering?",
  deleteOneDescription: "The offering will be deleted. This cannot be undone.",
  deleteManyTitle: "Delete the selected offerings?",
  deleteManyDescription: "The selected offerings will be deleted. This cannot be undone.",
  deleteConfirmLabel: "Delete",
  cancelLabel: "Cancel",
  deleteError: "It could not be deleted. Try again.",
  stepUpMessage: "To continue, confirm your identity.",
  stepUpLabel: "Confirm your identity",
};

type Overrides = Partial<Parameters<typeof DeleteOfferingsDialog>[0]>;

function renderDialog(overrides: Overrides = {}) {
  const props = {
    target: { kind: "one" as const, ulid: "01A" },
    pending: false,
    error: "none" as const,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    onStepUp: vi.fn(),
    texts: TEXTS,
    ...overrides,
  };
  render(<DeleteOfferingsDialog {...props} />);
  return props;
}

describe("DeleteOfferingsDialog (design.md D7)", () => {
  it("renders nothing without a target", () => {
    renderDialog({ target: null });

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("reports the cancel and the confirm activations", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: TEXTS.deleteConfirmLabel }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onCancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: TEXTS.cancelLabel }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows the delete error in the dialog's alert region on a failure", () => {
    renderDialog({ error: "failed" });

    const [alert] = screen.getAllByRole("alert");
    expect(alert.textContent).toBe(TEXTS.deleteError);
    expect(screen.queryByText(TEXTS.stepUpMessage)).toBeNull();
  });

  it("starts the identity check synchronously within the step-up click and keeps the dialog", () => {
    const props = renderDialog({ error: "step-up" });

    fireEvent.click(screen.getByRole("button", { name: TEXTS.stepUpLabel }));

    expect(props.onStepUp).toHaveBeenCalledTimes(1);
    expect(props.onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });
});
