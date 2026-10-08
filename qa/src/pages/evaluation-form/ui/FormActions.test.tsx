import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FormActions } from "@/pages/evaluation-form/ui/FormActions";

/**
 * The form's actions (design.md D4, D14; the summary §9; tasks 6.1): Save
 * draft (`action-3`) and Close evaluation (`primary`), the `role="status"`
 * region beside them, a sticky bar below `md` and an actions row from `md`.
 */

afterEach(cleanup);

function renderActions(props: Partial<Parameters<typeof FormActions>[0]> = {}) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(
    <FormActions
      saveLabel="Save draft"
      closeLabel="Close evaluation"
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
  it("renders Save draft as action-3 and Close evaluation as primary", () => {
    const { onSave, onClose } = renderActions();
    const save = screen.getByRole("button", { name: "Save draft" });
    const close = screen.getByRole("button", { name: "Close evaluation" });
    expect(save.className).toContain("bg-action-3-bg");
    expect(close.className).toContain("bg-action-primary");
    fireEvent.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the status region in place while empty", () => {
    renderActions();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("is a sticky bar below md and an actions row from md", () => {
    renderActions();
    const bar = screen.getByRole("button", { name: "Save draft" }).closest("[data-slot='actions']")!;
    for (const token of [
      "fixed",
      "inset-x-0",
      "bottom-0",
      "bg-surface-card",
      "border-t",
      "border-border-subtle",
      "px-4",
      "py-3",
      "md:static",
      "md:pt-6",
    ]) {
      expect(bar.className).toContain(token);
    }
    const buttons = screen.getByRole("button", { name: "Save draft" }).parentElement!;
    expect(buttons.className).toContain("gap-4");
    expect(buttons.className).toContain("md:justify-end");
  });

  it("marks the busy action as loading", () => {
    renderActions({ busy: "save" });
    expect(screen.getByRole("button", { name: "Save draft" }).getAttribute("aria-disabled")).toBe(
      "true",
    );
  });
});
