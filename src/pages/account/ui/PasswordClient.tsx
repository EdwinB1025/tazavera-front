"use client";

import { useId, type ReactNode } from "react";
import {
  endProfileWrite,
  requestProfileWrite,
  useProfileWriteScope,
  useSession,
} from "@/features/auth";
import {
  AccountSection,
  PasswordForm,
  type PasswordFormTexts,
} from "@/features/user-account";
import { SessionGate } from "@/shared/ui";
import {
  AccountLoadingCard,
  AccountSignedOutCard,
  type AccountGateTexts,
} from "./AccountGateCards";

// ─── UI-specific types (declared before the component) ───

export type PasswordClientTexts = AccountGateTexts &
  PasswordFormTexts & {
    changePassword: string;
  };

export type PasswordClientProps = {
  locale: string;
  texts: PasswordClientTexts;
};

/**
 * The Change password view's client region (design.md D4; spec "Change
 * password view"): the account page's session gate around one section
 * holding the password form, its states and reactive step-up unchanged.
 */
export function PasswordClient({ locale, texts }: PasswordClientProps): ReactNode {
  const session = useSession();
  const headingId = useId();
  // Leaving the view ends the step-up's action (scope-write-token-to-action design.md D4).
  useProfileWriteScope(true);
  return (
    <SessionGate
      session={session}
      loading={<AccountLoadingCard texts={texts} />}
      signedOut={<AccountSignedOutCard texts={texts} />}
    >
      {(user) => (
        <AccountSection heading={texts.changePassword} headingId={headingId}>
          <PasswordForm
            ulid={user.ulid ?? ""}
            locale={locale}
            labelledBy={headingId}
            texts={texts}
            requestProfileWrite={requestProfileWrite}
            endProfileWrite={endProfileWrite}
          />
        </AccountSection>
      )}
    </SessionGate>
  );
}
