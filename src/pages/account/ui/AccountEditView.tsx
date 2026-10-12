"use client";

import { useId, type ReactNode } from "react";
import { endProfileWrite, refreshProfile, requestProfileWrite } from "@/features/auth";
import {
  AccountSection,
  ContactSection,
  DangerZone,
  ProfileForm,
  type ContactSectionTexts,
  type DangerZoneTexts,
  type ProfileFormTexts,
} from "@/features/user-account";
import type { SessionUser } from "@/shared/api";
import { Button } from "@/shared/ui";
import { SecuritySection, type SecuritySectionTexts } from "./SecuritySection";

// ─── UI-specific types (declared before the component) ───

export type AccountEditViewTexts = ContactSectionTexts &
  DangerZoneTexts &
  ProfileFormTexts &
  SecuritySectionTexts & {
    editProfileHeading: string;
    profileDescription: string;
    done: string;
    dangerZoneHeading: string;
  };

export type AccountEditViewProps = {
  user: SessionUser;
  locale: string;
  texts: AccountEditViewTexts;
  onDone: () => void;
  onChangePassword: () => void;
  signOut: () => void;
};

/**
 * The account page's edit mode (design.md D2; spec "Profile settings"): the
 * profile form with "Done" in place of the read-only profile, Contact
 * details, Security and the Danger zone.
 */
export function AccountEditView({
  user,
  locale,
  texts,
  onDone,
  onChangePassword,
  signOut,
}: AccountEditViewProps): ReactNode {
  const editProfileHeadingId = useId();
  return (
    <div className="flex flex-col gap-4">
      <AccountSection
        heading={texts.editProfileHeading}
        headingId={editProfileHeadingId}
        description={texts.profileDescription}
      >
        <ProfileForm
          user={user}
          locale={locale}
          labelledBy={editProfileHeadingId}
          texts={texts}
          refreshProfile={refreshProfile}
          requestProfileWrite={requestProfileWrite}
          endProfileWrite={endProfileWrite}
        />
        <div>
          <Button variant="action-4" size="base" onClick={onDone}>
            {texts.done}
          </Button>
        </div>
      </AccountSection>
      <ContactSection ulid={user.ulid ?? ""} texts={texts} />
      <SecuritySection
        texts={texts}
        emailVerifiedAt={user.emailVerifiedAt}
        ulid={user.ulid}
        onChangePassword={onChangePassword}
        refreshProfile={refreshProfile}
      />
      <AccountSection heading={texts.dangerZoneHeading}>
        <DangerZone
          ulid={user.ulid ?? ""}
          locale={locale}
          texts={texts}
          signOut={signOut}
          requestProfileWrite={requestProfileWrite}
          endProfileWrite={endProfileWrite}
        />
      </AccountSection>
    </div>
  );
}
