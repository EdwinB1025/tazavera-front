"use client";

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import type { Session, SessionUser } from "@/shared/api";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ManagementGateTexts = {
  signedOutMessage: string;
  signInLabel: string;
};

export type ManagementGateProps = {
  session: Session;
  /** The route the visitor is on; sign in returns to it. */
  route: string;
  texts: ManagementGateTexts;
  /** `signIn` of `@/features/auth`, injected by the page. */
  onSignIn: (route: string) => void;
  /** The route's loading presentation while the session resolves. */
  loading: ReactNode;
  /** The content of a signed-in coffeeshop. */
  children: (user: SessionUser) => ReactNode;
};

// A column 1rem apart; the button keeps its own width (summary §6.2).
const SIGNED_OUT_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");

/**
 * The session gate of both management routes (design.md D6; spec "Access to
 * the management area"). The session and the sign-in action arrive as props
 * from the page, since a feature never imports another feature. `loading`
 * renders the route's loading presentation; `anonymous` renders the
 * signed-out message and the Sign in button in place of the content, whose
 * click calls sign in synchronously (the popup must open within the
 * activation); another role renders the application's 404.
 */
export function ManagementGate({
  session,
  route,
  texts,
  onSignIn,
  loading,
  children,
}: ManagementGateProps): ReactNode {
  if (session.state === "loading") {
    return loading;
  }
  if (session.state === "anonymous") {
    return (
      <div className={SIGNED_OUT_CLASSES}>
        <p className="type-body">{texts.signedOutMessage}</p>
        <Button variant="primary" onClick={() => onSignIn(route)}>
          {texts.signInLabel}
        </Button>
      </div>
    );
  }
  if (session.user.role !== "coffeeshop") {
    return notFound();
  }
  return children(session.user);
}
