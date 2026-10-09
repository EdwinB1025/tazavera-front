"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";

// ─── UI-specific types (declared before the component) ───

export type SignedOutPromptProps = {
  text: string;
  signInLabel: string;
  /** Starts sign in, inside the click (the popup must open within it). */
  onSignIn: () => void;
  /**
   * The message's element: `h1` where the view has no page heading of its own
   * (label-landmarks-and-headings design.md D3). Defaults to `p`.
   */
  messageAs?: "p" | "h1";
};

/**
 * The signed-out block of a protected view (app-shell "Protected content
 * gate"; design.md D1): the message and a primary "Sign in" button, a column
 * 1rem apart with the button at its own width. The click calls `onSignIn`
 * synchronously and nothing navigates. The message keeps the body type style
 * whatever its element.
 */
export function SignedOutPrompt({
  text,
  signInLabel,
  onSignIn,
  messageAs: Message = "p",
}: SignedOutPromptProps): ReactNode {
  return (
    <div className="flex flex-col items-start gap-4">
      <Message className="type-body">{text}</Message>
      <Button variant="primary" type="button" onClick={() => onSignIn()}>
        {signInLabel}
      </Button>
    </div>
  );
}
