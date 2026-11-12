"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/features/auth";
import { NewLocationForm, type LocationFormTexts } from "@/features/location-management";
import type { GeocodeOutcome } from "@/shared/lib/geocoding";
import { LoadingStatus, SessionGate, SignedOutPrompt } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type FirstLocationClientTexts = LocationFormTexts & {
  loading: string;
  signedOutText: string;
  signIn: string;
};

export type FirstLocationClientProps = {
  locale: string;
  /** The page `h1`'s id: it takes focus when the step opens (design.md D6). */
  headingId: string;
  texts: FirstLocationClientTexts;
};

/**
 * The first location step's client region (require-first-location-on-
 * registration D3, D4, D6; offering-management "First location step", "First
 * location step session gate", "First location step form"). It mirrors
 * `ManageLocationsClient`'s gate and renders the new-location form, whose
 * secondary action ("Later") opens `/{locale}` and whose `201` replaces the
 * route with `/{locale}/manage/locations`. Focus moves to the page heading on
 * mount; no locations read is sent.
 */
export function FirstLocationClient({
  locale,
  headingId,
  texts,
}: FirstLocationClientProps): ReactNode {
  const session = useSession();
  const router = useRouter();
  // The page's lookup cache; a state initialiser, since it is read during render.
  const [geocodeCache] = useState(() => new Map<string, GeocodeOutcome>());
  const route = `/${locale}/manage/locations/first`;

  useEffect(() => {
    document.getElementById(headingId)?.focus();
  }, [headingId]);

  return (
    <SessionGate
      session={session}
      loading={<LoadingStatus text={texts.loading} />}
      signedOut={
        <SignedOutPrompt
          text={texts.signedOutText}
          signInLabel={texts.signIn}
          onSignIn={() => signIn(route)}
        />
      }
      allows={(user) => user.role === "coffeeshop"}
    >
      {() => (
        <NewLocationForm
          texts={texts}
          geocodeCache={geocodeCache}
          onCancel={() => router.push(`/${locale}`)}
          onCreated={() => router.replace(`/${locale}/manage/locations`)}
        />
      )}
    </SessionGate>
  );
}
