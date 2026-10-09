"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { refreshProfile, requestProfileWrite, signOut, useSession } from "@/features/auth";
import { SessionGate } from "@/shared/ui";
import { AccountEditView, type AccountEditViewTexts } from "./AccountEditView";
import {
  AccountLoadingCard,
  AccountSignedOutCard,
  type AccountGateTexts,
} from "./AccountGateCards";
import { AccountReadView, type AccountReadViewTexts } from "./AccountReadView";

// ─── UI-specific types (declared before the component) ───

export type AccountClientTexts = AccountGateTexts &
  AccountReadViewTexts &
  AccountEditViewTexts;

export type AccountClientProps = {
  locale: string;
  texts: AccountClientTexts;
};

/**
 * The account page's client region (design.md D1, D2 and D6; spec "Account
 * page modes and their session gate"). It is the injection seam: the session
 * comes from `useSession()` and the auth actions from `@/features/auth`. The
 * `edit=1` query picks edit mode; "Edit profile" and "Change password" start
 * the identity check inside the click, then open their route. The page never
 * redirects on its own.
 */
export function AccountClient({ locale, texts }: AccountClientProps): ReactNode {
  const session = useSession();
  const router = useRouter();
  const editing = useSearchParams()?.get("edit") === "1";
  const accountRoute = `/${locale}/account`;
  const editRoute = `${accountRoute}?edit=1`;
  const passwordRoute = `${accountRoute}/password`;

  function changePassword(): void {
    requestProfileWrite(passwordRoute);
    router.push(passwordRoute);
  }

  return (
    <SessionGate
      session={session}
      loading={<AccountLoadingCard texts={texts} />}
      signedOut={<AccountSignedOutCard texts={texts} />}
    >
      {(user) =>
        editing ? (
          <AccountEditView
            user={user}
            locale={locale}
            texts={texts}
            onDone={() => router.replace(accountRoute, { scroll: false })}
            onChangePassword={changePassword}
            signOut={() => signOut(router.push)}
          />
        ) : (
          <AccountReadView
            user={user}
            texts={texts}
            onEditProfile={() => {
              requestProfileWrite(editRoute);
              router.replace(editRoute, { scroll: false });
            }}
            onChangePassword={changePassword}
            refreshProfile={refreshProfile}
          />
        )
      }
    </SessionGate>
  );
}
