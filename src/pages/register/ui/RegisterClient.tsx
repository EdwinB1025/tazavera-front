"use client";

import { useState, type ReactNode } from "react";
import { signIn, signInWithRegistration } from "@/features/auth";
import {
  RegisterForm,
  type RegisterFormTexts,
  type RegisterRole,
} from "@/features/user-account";
import { Card, CardContent, LoadingStatus } from "@/shared/ui";
import { useAnonymousOnly } from "../model/use-anonymous-only";

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
 * locale through the slice's anonymous-only gate (add-register-landing
 * design.md D2), also when the specialist registration itself signed the user
 * in with `signInWithRegistration` (land-on-home-after-registration design.md
 * D1). When the coffeeshop registration signed the user in here, the gate
 * opens the first location step instead (require-first-location-on-
 * registration D1): a "registered here" flag is set before the sign-in starts
 * and cleared when it does not sign the user in.
 */
export function RegisterClient({
  locale,
  role,
  labelledBy,
  texts,
}: RegisterClientProps): ReactNode {
  const [registeredHere, setRegisteredHere] = useState(false);
  const destination =
    role === "coffeeshop" && registeredHere
      ? `/${locale}/manage/locations/first`
      : `/${locale}`;
  const state = useAnonymousOnly(locale, destination);

  async function signInWithToken(
    token: Parameters<typeof signInWithRegistration>[0],
  ): Promise<boolean> {
    setRegisteredHere(true);
    const signedIn = await signInWithRegistration(token);
    if (!signedIn) setRegisteredHere(false);
    return signedIn;
  }

  if (state === "authenticated") return null;

  return (
    <Card variant="section">
      <CardContent>
        <div className="w-full md:mx-auto md:max-w-160">
          {state === "loading" ? (
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
