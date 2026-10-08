"use client";

import { useRouter } from "next/navigation";
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
  ContactSection,
  DangerZone,
  ExternalLink,
  PasswordForm,
  ProfileForm,
  type ContactSectionTexts,
  type DangerZoneTexts,
  type PasswordFormTexts,
  type ProfileFormTexts,
} from "@/features/user-account";
import {
  Card,
  CardContent,
  LoadingStatus,
  SessionGate,
  SignedOutPrompt,
} from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type AccountClientTexts = ContactSectionTexts &
  DangerZoneTexts &
  PasswordFormTexts &
  ProfileFormTexts & {
    loading: string;
    signedOutText: string;
    signIn: string;
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
 * the five sections in order; the page never redirects on its own.
 */
export function AccountClient({ locale, texts }: AccountClientProps): ReactNode {
  const session = useSession();
  const router = useRouter();
  const profileHeadingId = useId();
  const passwordHeadingId = useId();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <SessionGate
      session={session}
      loading={
        <Card variant="section">
          <CardContent>
            <LoadingStatus text={texts.loading} />
          </CardContent>
        </Card>
      }
      signedOut={
        <Card variant="section">
          <CardContent>
            <SignedOutPrompt
              text={texts.signedOutText}
              signInLabel={texts.signIn}
              onSignIn={() => signIn()}
            />
          </CardContent>
        </Card>
      }
    >
      {(user) => (
        <div className="flex flex-col gap-4">
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
          <ContactSection
            ulid={user.ulid ?? ""}
            locale={locale}
            texts={texts}
            requestProfileWrite={requestProfileWrite}
          />
          <AccountSection
            heading={texts.passwordHeading}
            headingId={passwordHeadingId}
          >
            <PasswordForm
              ulid={user.ulid ?? ""}
              locale={locale}
              labelledBy={passwordHeadingId}
              texts={texts}
              requestProfileWrite={requestProfileWrite}
            />
          </AccountSection>
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
              signOut={() => signOut(router.push)}
              requestProfileWrite={requestProfileWrite}
            />
          </AccountSection>
        </div>
      )}
    </SessionGate>
  );
}
