import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { StepUpNotice } from "@/shared/ui";

/**
 * The step-up notice (feedback "Request status messages"; design.md D2):
 * `role="alert"` text and an action that calls the consumer's `onConfirm`
 * inside its click. The return route lives at the consumer.
 */

afterEach(() => {
  cleanup();
});

const TEXT = "fx-step-up";
const ACTION_LABEL = "fx-confirm-identity";

describe("StepUpNotice", () => {
  it("renders its text as an alert and its button from props", () => {
    render(
      <StepUpNotice text={TEXT} actionLabel={ACTION_LABEL} onConfirm={() => {}} />,
    );
    expect(screen.getByRole("alert").textContent).toBe(TEXT);
    const button = screen.getByRole("button", { name: ACTION_LABEL });
    expect(button.className).toContain("bg-action-primary");
  });

  it("Confirm identity calls onConfirm once with no arguments, inside the click", () => {
    const onConfirm = vi.fn<() => void>();
    render(
      <StepUpNotice text={TEXT} actionLabel={ACTION_LABEL} onConfirm={onConfirm} />,
    );
    fireEvent.click(screen.getByRole("button", { name: ACTION_LABEL }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith();
  });
});
