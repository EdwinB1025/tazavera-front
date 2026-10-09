"use client";

import type { ReactNode } from "react";
import { signIn, useSession } from "@/features/auth";
import { LocationsPanel, type LocationsPanelTexts } from "@/features/location-management";
import { LoadingStatus, SessionGate, SignedOutPrompt } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ManageLocationsClientTexts = LocationsPanelTexts & {
  signedOutText: string;
  signIn: string;
};

export type ManageLocationsClientProps = {
  locale: string;
  /** The page `h1`'s id, passed to the panel (design.md D3). */
  headingId: string;
  texts: ManageLocationsClientTexts;
};

/**
 * The locations page's client region (design.md D2; spec "Access to the
 * locations page"). It is the injection seam: the session comes from
 * `useSession()` and sign in from `@/features/auth`. The shared gate shows the
 * loading status, the signed-out prompt, the 404 for a role other than
 * `coffeeshop`, or the panel.
 */
export function ManageLocationsClient({
  locale,
  headingId,
  texts,
}: ManageLocationsClientProps): ReactNode {
  const session = useSession();
  const route = `/${locale}/manage/locations`;

  return (
    <SessionGate
      session={session}
      loading={<LoadingStatus text={texts.loading} />}
      signedOut={
        <SignedOutPrompt
          text={texts.signedOutText}
          signInLabel={texts.signIn}
          onSignIn={() => signIn(route)}
        />
      }
      allows={(user) => user.role === "coffeeshop"}
    >
      {(user) => (
        <LocationsPanel
          userUlid={user.ulid ?? ""}
          headingId={headingId}
          texts={texts}
        />
      )}
    </SessionGate>
  );
}
