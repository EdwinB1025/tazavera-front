"use client";

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { signIn, useSession } from "@/features/auth";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** The gate's texts, from the `evaluations` catalog (design.md D14). */
export type EvaluationsAccessTexts = {
  message: string;
  signInLabel: string;
};

export type EvaluationsAccessProps = {
  texts: EvaluationsAccessTexts;
  children: ReactNode;
};

const MESSAGE_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");

/**
 * The access gate every evaluation route renders around its content
 * (design.md D13; spec "Sign-in to the evaluation routes"). While the session
 * is `loading` it renders nothing; `anonymous` gets the message with the
 * "Sign in" button, which starts the sign-in for the current route inside the
 * click (popup: the visitor stays on the route); a signed-in user whose role
 * is not `specialist` gets the 404 page.
 */
export function EvaluationsAccess({ texts, children }: EvaluationsAccessProps): ReactNode {
  const session = useSession();

  if (session.state === "loading") {
    return null;
  }
  if (session.state === "anonymous") {
    return (
      <div className={MESSAGE_CLASSES}>
        <p className="type-body">{texts.message}</p>
        <Button
          onClick={() => signIn(`${window.location.pathname}${window.location.search}`)}
        >
          {texts.signInLabel}
        </Button>
      </div>
    );
  }
  if (session.user.role !== "specialist") {
    notFound();
  }
  return children;
}
