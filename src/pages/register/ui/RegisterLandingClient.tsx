"use client";

import type { ReactNode } from "react";
import { LoadingStatus } from "@/shared/ui";
import { useAnonymousOnly } from "../model/use-anonymous-only";
import { RegisterOption } from "./RegisterOption";

// ─── UI-specific types (declared before the component) ───

export type RegisterLandingTexts = {
  loading: string;
  specialistTitle: string;
  specialistText: string;
  specialistAction: string;
  coffeeshopTitle: string;
  coffeeshopText: string;
  coffeeshopAction: string;
};

export type RegisterLandingClientProps = {
  locale: string;
  texts: RegisterLandingTexts;
};

/**
 * The client region of the registration landing (design.md D2 and D3; specs
 * "Registration landing" and "Registration landing session gate"). Behind the
 * slice's anonymous-only gate it shows the loading status while the session
 * resolves, nothing when authenticated, and otherwise the two options,
 * specialist first, each opening its registration route.
 */
export function RegisterLandingClient({
  locale,
  texts,
}: RegisterLandingClientProps): ReactNode {
  const state = useAnonymousOnly(locale);

  if (state === "authenticated") return null;
  if (state === "loading") return <LoadingStatus text={texts.loading} />;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <RegisterOption
        title={texts.specialistTitle}
        text={texts.specialistText}
        actionLabel={texts.specialistAction}
        href={`/${locale}/register`}
      />
      <RegisterOption
        title={texts.coffeeshopTitle}
        text={texts.coffeeshopText}
        actionLabel={texts.coffeeshopAction}
        href={`/${locale}/register/coffeeshop`}
      />
    </div>
  );
}
