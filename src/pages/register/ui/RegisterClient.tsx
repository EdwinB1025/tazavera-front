"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signIn, signInWithRegistration, useSession } from "@/features/auth";
import {
  RegisterForm,
  type RegisterFormTexts,
  type RegisterRole,
} from "@/features/user-account";
import type { RegistrationToken } from "@/shared/api";
import { Card, CardContent, LoadingStatus } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type RegisterClientTexts = RegisterFormTexts & {
  loading: string;
};

export type RegisterClientProps = {
  locale: string;
  role: RegisterRole;
  /** The id of the page heading that names the form (design.md D9). */
  labelledBy: string;
  texts: RegisterClientTexts;
};

/**
 * The client region of a registration route (design.md D1 and D8; spec
 * "Registration routes"). It is the injection seam: the session comes from
 * `useSession()` and `signIn` from `@/features/auth`, passed to the
 * user-account pieces as props. While the session resolves it shows the
 * loading status; an authenticated session opens the root of the active
 * locale through the App Router's `replace`, so the in-memory tokens survive,
 * or the account page when the registration itself signed the user in with
 * `signInWithRegistration` (sign-in-after-registration design.md D4).
 */
export function RegisterClient({
  locale,
  role,
  labelledBy,
  texts,
}: RegisterClientProps): ReactNode {
  const session = useSession();
  const router = useRouter();
  const authenticated = session.state === "authenticated";
  // Where an authenticated session goes: the locale root, or the account page
  // after a registration sign-in (sign-in-after-registration design.md D4).
  const destination = useRef<string | null>(null);

  useEffect(() => {
    if (authenticated) router.replace(destination.current ?? `/${locale}`);
  }, [authenticated, locale, router]);

  async function signInWithToken(token: RegistrationToken): Promise<boolean> {
    destination.current = `/${locale}/account`;
    const signedIn = await signInWithRegistration(token);
    if (!signedIn) destination.current = null;
    return signedIn;
  }

  if (authenticated) return null;

  return (
    <Card variant="section">
      <CardContent>
        <div className="w-full md:mx-auto md:max-w-160">
          {session.state === "loading" ? (
            <LoadingStatus text={texts.loading} />
          ) : (
            <RegisterForm
              role={role}
              labelledBy={labelledBy}
              texts={texts}
              signIn={() => signIn()}
              signInWithToken={signInWithToken}
              cancelHref={`/${locale}`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
