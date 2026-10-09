import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SignedOutPrompt } from "@/shared/ui";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/**
 * The signed-out prompt (app-shell "Protected content gate"; design.md D1):
 * the consumer's message and a primary "Sign in" button that calls
 * `onSignIn` synchronously inside its click, with no navigation.
 */

const TEXT = "fx-signed-out";
const SIGN_IN_LABEL = "fx-sign-in";

describe("SignedOutPrompt", () => {
  it("lays the signed-out branch out as a column 1rem apart, the button at its own width", () => {
    render(
      <SignedOutPrompt
        text={TEXT}
        signInLabel={SIGN_IN_LABEL}
        onSignIn={() => {}}
      />,
    );

    const message = screen.getByText(TEXT);
    expect(message.tagName).toBe("P");
    expect(message.className).toBe("type-body");
    expect(message.parentElement!.className).toBe(
      "flex flex-col items-start gap-4",
    );
  });
});
