import type { ReactNode } from "react";
import type { Session, SessionUser } from "@/shared/api";
import { Button, Card, CardContent } from "@/shared/ui";
import { LoadingStatus } from "./LoadingStatus";

// ─── UI-specific types (declared before the component) ───

export type SessionGateTexts = {
  loading: string;
  signedOutText: string;
  signIn: string;
};

export type SessionGateProps = {
  session: Session;
  texts: SessionGateTexts;
  /** Starts sign in for the current route, inside the click (design.md D1). */
  signIn: () => void;
  /** The content of an authenticated session. */
  children: (user: SessionUser) => ReactNode;
};

/**
 * The account page's session gate (spec "Account page and its session gate";
 * design.md D6 and D10): one card with the loading status while the session
 * resolves, one card with the signed-out text and "Sign in" while it is
 * anonymous — with no redirect — and the content for an authenticated
 * session.
 */
export function SessionGate({
  session,
  texts,
  signIn,
  children,
}: SessionGateProps): ReactNode {
  if (session.state === "authenticated") return children(session.user);

  return (
    <Card variant="section">
      {session.state === "loading" ? (
        <CardContent>
          <LoadingStatus text={texts.loading} />
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-4">
          <p className="type-body">{texts.signedOutText}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="base" onClick={() => signIn()}>
              {texts.signIn}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
