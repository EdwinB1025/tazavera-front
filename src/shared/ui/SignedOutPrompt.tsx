"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";

// ─── UI-specific types (declared before the component) ───

export type SignedOutPromptProps = {
  text: string;
  signInLabel: string;
  /** Starts sign in, inside the click (the popup must open within it). */
  onSignIn: () => void;
};

/**
 * The signed-out block of a protected view (app-shell "Protected content
 * gate"; design.md D1): the message and a primary "Sign in" button, a column
 * 1rem apart with the button at its own width. The click calls `onSignIn`
 * synchronously and nothing navigates.
 */
export function SignedOutPrompt({
  text,
  signInLabel,
  onSignIn,
}: SignedOutPromptProps): ReactNode {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="type-body">{text}</p>
      <Button variant="primary" type="button" onClick={() => onSignIn()}>
        {signInLabel}
      </Button>
    </div>
  );
}
