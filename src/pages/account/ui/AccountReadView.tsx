"use client";

import type { ReactNode } from "react";
import {
  AccountSection,
  ContactSection,
  ProfileDetails,
  type ContactSectionTexts,
  type ProfileDetailsTexts,
} from "@/features/user-account";
import type { SessionUser } from "@/shared/api";
import { Button } from "@/shared/ui";
import { SecuritySection, type SecuritySectionTexts } from "./SecuritySection";

// ─── UI-specific types (declared before the component) ───

export type AccountReadViewTexts = ContactSectionTexts &
  ProfileDetailsTexts &
  SecuritySectionTexts & {
    profileHeading: string;
    editProfileHeading: string;
  };

export type AccountReadViewProps = {
  user: SessionUser;
  texts: AccountReadViewTexts;
  onEditProfile: () => void;
  onChangePassword: () => void;
};

/**
 * The account page's read mode (design.md D1; spec "Account page modes and
 * their session gate"): Profile read-only with "Edit profile", Contact
 * details and Security.
 */
export function AccountReadView({
  user,
  texts,
  onEditProfile,
  onChangePassword,
}: AccountReadViewProps): ReactNode {
  return (
    <div className="flex flex-col gap-4">
      <AccountSection heading={texts.profileHeading}>
        <ProfileDetails user={user} texts={texts} />
        <div>
          <Button variant="action-4" size="base" onClick={onEditProfile}>
            {texts.editProfileHeading}
          </Button>
        </div>
      </AccountSection>
      <ContactSection ulid={user.ulid ?? ""} texts={texts} />
      <SecuritySection
        texts={texts}
        emailVerifiedAt={user.emailVerifiedAt}
        onChangePassword={onChangePassword}
      />
    </div>
  );
}
