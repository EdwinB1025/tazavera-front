import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";

// The token client and the auth feature are mocked so nothing reaches the
// network or the popup flow. Test infrastructure only.
vi.mock("@/shared/api", () => ({ request: vi.fn(), publicRequest: vi.fn() }));
vi.mock("@/features/auth", () => ({
  requestProfileWrite: vi.fn(),
  signIn: vi.fn(),
  useSession: vi.fn(),
}));

import { DeleteOfferingsDialog } from "./DeleteOfferingsDialog";

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
};

type Overrides = Partial<Parameters<typeof DeleteOfferingsDialog>[0]>;

function renderDialog(overrides: Overrides = {}) {
  const props = {
    target: { kind: "one" as const, ulid: "01A" },
    pending: false,
    error: "none" as const,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    texts: TEXTS,
    ...overrides,
  };
  render(<DeleteOfferingsDialog {...props} />);
  return props;
}

describe("DeleteOfferingsDialog (design.md D7)", () => {
  it("confirms one offering with the single texts, the confirm and the cancel labels", () => {
    renderDialog();

    const dialog = screen.getByRole("alertdialog", { name: TEXTS.deleteOneTitle });
    expect(within(dialog).getByText(TEXTS.deleteOneDescription)).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: TEXTS.deleteConfirmLabel })).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: TEXTS.cancelLabel })).toBeTruthy();
  });

  it("confirms the selected offerings with the bulk texts", () => {
    renderDialog({ target: { kind: "many", ulids: ["01A", "01B"] } });

    const dialog = screen.getByRole("alertdialog", { name: TEXTS.deleteManyTitle });
    expect(within(dialog).getByText(TEXTS.deleteManyDescription)).toBeTruthy();
  });

  it("shows the pending state: confirm busy, cancel unavailable", () => {
    renderDialog({ pending: true });

    const confirm = screen.getByRole("button", { name: TEXTS.deleteConfirmLabel });
    const cancel = screen.getByRole("button", { name: TEXTS.cancelLabel }) as HTMLButtonElement;
    expect(confirm.getAttribute("aria-busy")).toBe("true");
    expect(cancel.disabled).toBe(true);
  });

  it("renders the delete error inside the dialog's single alert region, with no step-up action", () => {
    renderDialog({ error: "failed" });

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0].textContent).toBe(TEXTS.deleteError);
    expect(screen.queryByRole("button", { name: "Confirm your identity" })).toBeNull();
  });
});
