import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

/**
 * The delete flow of a row (design.md D4 and its error table; spec "Row
 * actions"; tasks 3.6): Delete opens `ConfirmDialog`; confirming sends
 * `deleteAnEvaluation` with the dialog pending, then reports the deletion;
 * dismissing sends nothing; a `403` shows the "not yours" text and any other
 * failure the generic one, in the dialog's `error`.
 */

const deleteAnEvaluation = vi.fn();
vi.mock("@/entities/evaluation", () => ({
  deleteAnEvaluation: (...args: unknown[]) => deleteAnEvaluation(...args),
}));

import { DeleteEvaluationAction } from "./DeleteEvaluationAction";
import type { DeleteEvaluationTexts } from "./DeleteEvaluationAction";

const TEXTS: DeleteEvaluationTexts = {
  deleteLabel: "Delete",
  deleteTitle: "Delete this evaluation?",
  deleteDescription: "The evaluation and its scores will be removed.",
  deleteConfirmLabel: "Delete evaluation",
  deleteCancelLabel: "Cancel",
  notYoursMessage: "This evaluation is not yours.",
  failureMessage: "Something went wrong. Try again later.",
};

const ULID = "01JEVAL0000000000000000001";
const onDeleted = vi.fn();

function open() {
  render(<DeleteEvaluationAction ulid={ULID} texts={TEXTS} onDeleted={onDeleted} />);
  const trigger = screen.getByRole("button", { name: "Delete" });
  expect(trigger.className).toContain("bg-action-2-bg");
  fireEvent.click(trigger);
  return screen.getByRole("alertdialog");
}

beforeEach(() => {
  deleteAnEvaluation.mockReset();
  onDeleted.mockReset();
});

afterEach(cleanup);

describe("DeleteEvaluationAction (design.md D4)", () => {
  it("sends the deletion on confirm, shows the pending state, then reports the deletion", async () => {
    let resolve: (value: unknown) => void = () => {};
    deleteAnEvaluation.mockReturnValue(new Promise((done) => (resolve = done)));
    open();
    fireEvent.click(screen.getByRole("button", { name: "Delete evaluation" }));
    expect(deleteAnEvaluation).toHaveBeenCalledWith(ULID);
    expect(
      screen.getByRole("button", { name: "Delete evaluation" }).getAttribute("aria-disabled"),
    ).toBe("true");
    resolve({ ok: true, status: 200, data: null });
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith(ULID));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("sends nothing when the dialog is dismissed", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(deleteAnEvaluation).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("shows the not-yours text on a 403, with nothing resent", async () => {
    deleteAnEvaluation.mockResolvedValue({ ok: false, status: 403 });
    open();
    fireEvent.click(screen.getByRole("button", { name: "Delete evaluation" }));
    expect(await screen.findByText(TEXTS.notYoursMessage)).toBeDefined();
    expect(screen.queryByText(TEXTS.failureMessage)).toBeNull();
    expect(deleteAnEvaluation).toHaveBeenCalledTimes(1);
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
