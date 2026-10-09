"use client";

import type { ReactNode } from "react";
import { signIn } from "@/features/auth";
import { Card, CardContent, LoadingStatus, SignedOutPrompt } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type AccountGateTexts = {
  loading: string;
  signedOutText: string;
  signIn: string;
};

/**
 * The loading card of the account views' session gate (design.md D6; spec
 * "Account page modes and their session gate"): a section card with no
 * header band holding the loading status.
 */
export function AccountLoadingCard({ texts }: { texts: AccountGateTexts }): ReactNode {
  return (
    <Card variant="section">
      <CardContent>
        <LoadingStatus text={texts.loading} />
      </CardContent>
    </Card>
  );
}

/**
 * The signed-out card of the account views' session gate: the signed-out
 * text and a "Sign in" that starts sign in for the route the user is on.
 */
export function AccountSignedOutCard({ texts }: { texts: AccountGateTexts }): ReactNode {
  return (
    <Card variant="section">
      <CardContent>
        <SignedOutPrompt
          text={texts.signedOutText}
          signInLabel={texts.signIn}
          onSignIn={() => signIn()}
        />
      </CardContent>
    </Card>
  );
}
