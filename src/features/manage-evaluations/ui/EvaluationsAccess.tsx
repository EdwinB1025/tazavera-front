"use client";

import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { SessionGate, SignedOutPrompt } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** The gate's texts, from the `evaluations` catalog (design.md D14). */
export type EvaluationsAccessTexts = {
  message: string;
  signInLabel: string;
};

export type EvaluationsAccessProps = {
  session: Session;
  /** Starts sign in for a return route: the auth feature's `signIn`. */
  signIn: (returnRoute: string) => void;
  texts: EvaluationsAccessTexts;
  children: ReactNode;
};

/**
 * The access gate every evaluation route renders around its content
 * (design.md D13; spec "Sign-in to the evaluation routes"), on the shared
 * protected content gate. While the session is `loading` it renders nothing;
 * `anonymous` gets the message, as the page's `h1`
 * (label-landmarks-and-headings D3), with the "Sign in" button, which starts the
 * sign-in for the current route inside the click (popup: the visitor stays on
 * the route); a signed-in user whose role is not `specialist` gets the 404
 * page. The session and `signIn` come from the caller.
 */
export function EvaluationsAccess({
  session,
  signIn,
  texts,
  children,
}: EvaluationsAccessProps): ReactNode {
  return (
    <SessionGate
      session={session}
      loading={null}
      signedOut={
        <SignedOutPrompt
          text={texts.message}
          signInLabel={texts.signInLabel}
          messageAs="h1"
          onSignIn={() => signIn(`${window.location.pathname}${window.location.search}`)}
        />
      }
      allows={(user) => user.role === "specialist"}
    >
      {() => children}
    </SessionGate>
  );
}
