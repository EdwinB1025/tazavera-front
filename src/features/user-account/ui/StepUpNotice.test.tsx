import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { StepUpNotice, type StepUpNoticeTexts } from "@/features/user-account";

/**
 * The step-up notice (spec "Writes and the step-up"; design.md D6 and D9):
 * `role="alert"` text and a "Confirm identity" button that starts the
 * write-scope sign in for the account route inside its click.
 */

afterEach(() => {
  cleanup();
});

const TEXTS: StepUpNoticeTexts = {
  stepUpText: "fx-step-up",
  stepUpButton: "fx-confirm-identity",
};

describe("StepUpNotice", () => {
  it("renders its text as an alert and its button from props", () => {
    render(<StepUpNotice locale="es" texts={TEXTS} requestProfileWrite={() => {}} />);
    expect(screen.getByRole("alert").textContent).toBe(TEXTS.stepUpText);
    const button = screen.getByRole("button", { name: TEXTS.stepUpButton });
    expect(button.className).toContain("bg-action-primary");
  });

  it("Confirm identity calls requestProfileWrite once with /{locale}/account, inside the click", () => {
    const requestProfileWrite = vi.fn<(returnRoute: string) => void>();
    render(
      <StepUpNotice
        locale="ca"
        texts={TEXTS}
        requestProfileWrite={requestProfileWrite}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: TEXTS.stepUpButton }));
    expect(requestProfileWrite).toHaveBeenCalledTimes(1);
    expect(requestProfileWrite).toHaveBeenCalledWith("/ca/account");
  });
});
