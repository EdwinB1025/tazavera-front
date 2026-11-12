import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth";
import type { Session } from "@/shared/api";

/**
 * The anonymous-only gate of the registration pages (design.md D2; specs
 * "Registration routes" and "Registration landing session gate"). It returns
 * the session state and, while the session is authenticated, opens
 * `destination` — the root of the active locale unless the caller passes
 * another (require-first-location-on-registration D1) — through the App
 * Router's `replace`, so the in-memory tokens survive.
 */
export function useAnonymousOnly(
  locale: string,
  destination: string = `/${locale}`,
): Session["state"] {
  const { state } = useSession();
  const router = useRouter();
  const authenticated = state === "authenticated";

  useEffect(() => {
    if (authenticated) router.replace(destination);
  }, [authenticated, destination, router]);

  return state;
}
