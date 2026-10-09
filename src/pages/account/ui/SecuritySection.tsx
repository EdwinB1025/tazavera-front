"use client";

import type { ReactNode } from "react";
import { AccountSection, ExternalLink } from "@/features/user-account";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type SecuritySectionTexts = {
  securityHeading: string;
  securityDescription: string;
  changePassword: string;
  twoFactor: string;
  passkeys: string;
  verifyEmail: string;
  emailVerifiedStatus: string;
};

export type SecuritySectionProps = {
  texts: SecuritySectionTexts;
  /** The session user's `emailVerifiedAt`; absent shows no email verification entry. */
  emailVerifiedAt?: string | null;
  /** Starts the identity check and opens the Change password view. */
  onChangePassword: () => void;
};

/**
 * The Security section (design.md D3; spec "Grouped security section"):
 * "Change password", then the email verification entry (add-email-verification-status
 * design.md D2), two-factor authentication and passkeys, the links external
 * same-tab links to the API's pages.
 */
export function SecuritySection({
  texts,
  emailVerifiedAt,
  onChangePassword,
}: SecuritySectionProps): ReactNode {
  const securityUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/security`;
  return (
    <AccountSection heading={texts.securityHeading} description={texts.securityDescription}>
      <div className="flex flex-col items-start gap-4">
        <Button variant="action-4" size="base" onClick={onChangePassword}>
          {texts.changePassword}
        </Button>
        <ul className="type-body flex flex-col gap-2">
          {emailVerifiedAt === null && (
            <li>
              <ExternalLink href={`${process.env.NEXT_PUBLIC_API_URL}/email/verify`}>
                {texts.verifyEmail}
              </ExternalLink>
            </li>
          )}
          {typeof emailVerifiedAt === "string" && <li>{texts.emailVerifiedStatus}</li>}
          <li>
            <ExternalLink href={securityUrl}>{texts.twoFactor}</ExternalLink>
          </li>
          <li>
            <ExternalLink href={securityUrl}>{texts.passkeys}</ExternalLink>
          </li>
        </ul>
      </div>
    </AccountSection>
  );
}
