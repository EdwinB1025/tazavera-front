"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/features/auth";
import {
  RegisterForm,
  type RegisterFormTexts,
  type RegisterRole,
} from "@/features/user-account";
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
 * locale through the App Router's `replace`, so the in-memory tokens survive.
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

  useEffect(() => {
    if (authenticated) router.replace(`/${locale}`);
  }, [authenticated, locale, router]);

  if (authenticated) return null;

  return (
    <Card variant="section">
      <CardContent>
        <div className="w-full md:max-w-160">
          {session.state === "loading" ? (
            <LoadingStatus text={texts.loading} />
          ) : (
            <RegisterForm
              role={role}
              labelledBy={labelledBy}
              texts={texts}
              signIn={() => signIn()}
              cancelHref={`/${locale}`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
