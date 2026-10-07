import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  RegisterSuccessPanel,
  type RegisterSuccessPanelTexts,
} from "@/features/user-account";

/**
 * Registration success panel (spec "Registration result"; design.md D9 and
 * D10): a heading that takes focus when the panel mounts, a text and a
 * "Sign in" button that starts sign in synchronously inside its click.
 */

afterEach(() => {
  cleanup();
});

const TEXTS: RegisterSuccessPanelTexts = {
  registerSuccessTitle: "fx-success-title",
  registerSuccessText: "fx-success-text",
  signIn: "fx-sign-in",
};

describe("RegisterSuccessPanel", () => {
  it("renders its heading, text and Sign in from props and focuses the heading", () => {
    render(<RegisterSuccessPanel texts={TEXTS} signIn={() => {}} />);
    const heading = screen.getByRole("heading", { name: TEXTS.registerSuccessTitle });
    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText(TEXTS.registerSuccessText)).toBeTruthy();
    const button = screen.getByRole("button", { name: TEXTS.signIn });
    expect(button.className).toContain("bg-action-primary");
  });

  it("Sign in calls the injected signIn once, synchronously inside the click", () => {
    const signIn = vi.fn<() => void>();
    render(<RegisterSuccessPanel texts={TEXTS} signIn={signIn} />);
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(signIn).toHaveBeenCalledTimes(1);
  });
});
