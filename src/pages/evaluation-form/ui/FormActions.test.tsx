import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FormActions } from "./FormActions";

/**
 * The form's actions (design.md D4, D14; the summary §9; tasks 6.1): Save
 * draft (`primary`) and Close evaluation (`action-2`), the `role="status"`
 * region beside them, a sticky bar below `md` and an actions row from `md`.
 */

// Cancel is a route button (render-navigation-actions-as-buttons); the app
// router is mocked — test infrastructure only.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(cleanup);

function renderActions(props: Partial<Parameters<typeof FormActions>[0]> = {}) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(
    <FormActions
      saveLabel="Save draft"
      closeLabel="Close evaluation"
      cancelLabel="Cancel"
      cancelHref="/es/manage/evaluations"
      onSave={onSave}
      onClose={onClose}
      busy={null}
      message={null}
      {...props}
    />,
  );
  return { onSave, onClose };
}

describe("FormActions (design.md D4, D14)", () => {
  it("shows the message in a status region beside the actions", () => {
    renderActions({ message: "Draft saved." });
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Draft saved.");
    const bar = screen.getByRole("button", { name: "Save draft" }).closest("[data-slot='actions']")!;
    expect(bar.contains(status)).toBe(true);
  });
});
