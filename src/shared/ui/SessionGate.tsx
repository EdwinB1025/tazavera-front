"use client";

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import type { Session, SessionUser } from "@/shared/api";

// ─── UI-specific types (declared before the component) ───

export type SessionGateProps = {
  session: Session;
  /** Rendered while the session resolves. */
  loading: ReactNode;
  /** Rendered while the session is anonymous. */
  signedOut: ReactNode;
  /** When given and false for the signed-in user, the 404 renders. */
  allows?: (user: SessionUser) => boolean;
  /** The content of an allowed signed-in user. */
  children: (user: SessionUser) => ReactNode;
};

/**
 * The protected content gate (app-shell "Protected content gate"; design.md
 * D1): the consumer's `loading` node while the session resolves, its
 * `signedOut` node while it is anonymous — with no redirect — the
 * application's 404 for a signed-in user `allows` rejects and the content
 * for an allowed one. It renders no element of its own.
 */
export function SessionGate({
  session,
  loading,
  signedOut,
  allows,
  children,
}: SessionGateProps): ReactNode {
  if (session.state === "loading") return loading;
  if (session.state === "anonymous") return signedOut;
  if (allows && !allows(session.user)) return notFound();
  return children(session.user);
}
