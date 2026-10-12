"use client";

import type { MouseEvent, ReactNode } from "react";
import { AccountSection, ExternalLink } from "@/features/user-account";
import { apiWebPageUrl } from "@/shared/api";
import { openSecurityPopup } from "@/shared/lib/security-popup";
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
  /** Reloads the session's profile from `GET /user` once an API popup closes. */
  refreshProfile: () => Promise<void>;
};

/**
 * The Security section (design.md D3; spec "Grouped security section"):
 * "Change password", then the email verification entry (add-email-verification-status
 * design.md D2), two-factor authentication and passkeys, the links to the
 * API's pages opening in a popup window that reloads the profile when it
 * closes (open-security-pages-in-popup design.md D3).
 */
export function SecuritySection({
  texts,
  emailVerifiedAt,
  onChangePassword,
  refreshProfile,
}: SecuritySectionProps): ReactNode {
  const securityUrl = apiWebPageUrl("/user/security");
  const openPopup = (event: MouseEvent<HTMLAnchorElement>): void =>
    openSecurityPopup(event, () => void refreshProfile());
  return (
    <AccountSection heading={texts.securityHeading} description={texts.securityDescription}>
      <div className="flex flex-col items-start gap-4">
        <Button variant="action-4" size="base" onClick={onChangePassword}>
          {texts.changePassword}
        </Button>
        <ul className="type-body flex flex-col gap-2">
          {emailVerifiedAt === null && (
            <li>
              <ExternalLink
                href={apiWebPageUrl("/email/verify")}
                onClick={openPopup}
              >
                {texts.verifyEmail}
              </ExternalLink>
            </li>
          )}
          {typeof emailVerifiedAt === "string" && <li>{texts.emailVerifiedStatus}</li>}
          <li>
            <ExternalLink href={securityUrl} onClick={openPopup}>{texts.twoFactor}</ExternalLink>
          </li>
          <li>
            <ExternalLink href={securityUrl} onClick={openPopup}>{texts.passkeys}</ExternalLink>
          </li>
        </ul>
      </div>
    </AccountSection>
  );
}
