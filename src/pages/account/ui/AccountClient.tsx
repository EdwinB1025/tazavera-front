"use client";

import { useId, type ReactNode } from "react";
import {
  refreshProfile,
  requestProfileWrite,
  signIn,
  signOut,
  useSession,
} from "@/features/auth";
import {
  AccountSection,
  DangerZone,
  ExternalLink,
  ProfileForm,
  SessionGate,
  type DangerZoneTexts,
  type ProfileFormTexts,
  type SessionGateTexts,
} from "@/features/user-account";

// ─── UI-specific types (declared before the component) ───

export type AccountClientTexts = SessionGateTexts &
  DangerZoneTexts &
  ProfileFormTexts & {
    profileHeading: string;
    profileDescription: string;
    passwordHeading: string;
    securityHeading: string;
    securityDescription: string;
    securityLink: string;
    dangerZoneHeading: string;
  };

export type AccountClientProps = {
  locale: string;
  texts: AccountClientTexts;
};

/**
 * The account page's client region (design.md D1, D4, D6 and D10; spec
 * "Account page and its session gate"). It is the injection seam: the session
 * comes from `useSession()` and the auth actions from `@/features/auth`,
 * passed to the user-account pieces as props. An authenticated session shows
 * the four sections in order; the page never redirects on its own.
 */
export function AccountClient({ locale, texts }: AccountClientProps): ReactNode {
  const session = useSession();
  const profileHeadingId = useId();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <SessionGate session={session} texts={texts} signIn={() => signIn()}>
      {(user) => (
        <>
          <AccountSection
            heading={texts.profileHeading}
            headingId={profileHeadingId}
            description={texts.profileDescription}
          >
            <ProfileForm
              user={user}
              locale={locale}
              labelledBy={profileHeadingId}
              texts={texts}
              refreshProfile={refreshProfile}
              requestProfileWrite={requestProfileWrite}
            />
          </AccountSection>
          <AccountSection heading={texts.passwordHeading}>{null}</AccountSection>
          <AccountSection
            heading={texts.securityHeading}
            description={texts.securityDescription}
          >
            <p className="type-body">
              <ExternalLink href={`${apiUrl}/user/security`}>
                {texts.securityLink}
              </ExternalLink>
            </p>
          </AccountSection>
          <AccountSection heading={texts.dangerZoneHeading}>
            <DangerZone
              ulid={user.ulid ?? ""}
              locale={locale}
              texts={texts}
              signOut={signOut}
              requestProfileWrite={requestProfileWrite}
            />
          </AccountSection>
        </>
      )}
    </SessionGate>
  );
}
