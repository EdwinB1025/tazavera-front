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
};

export type SecuritySectionProps = {
  texts: SecuritySectionTexts;
  /** Starts the identity check and opens the Change password view. */
  onChangePassword: () => void;
};

/**
 * The Security section (design.md D3; spec "Grouped security section"):
 * "Change password", then two-factor authentication and passkeys, both
 * external same-tab links to the API's security page.
 */
export function SecuritySection({ texts, onChangePassword }: SecuritySectionProps): ReactNode {
  const securityUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/security`;
  return (
    <AccountSection heading={texts.securityHeading} description={texts.securityDescription}>
      <div className="flex flex-col items-start gap-4">
        <Button variant="action-4" size="base" onClick={onChangePassword}>
          {texts.changePassword}
        </Button>
        <ul className="type-body flex flex-col gap-2">
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
