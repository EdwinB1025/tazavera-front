import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth";
import type { Session } from "@/shared/api";

/**
 * The anonymous-only gate of the registration pages (design.md D2; specs
 * "Registration routes" and "Registration landing session gate"). It returns
 * the session state and, while the session is authenticated, opens the root
 * of the active locale through the App Router's `replace`, so the in-memory
 * tokens survive.
 */
export function useAnonymousOnly(locale: string): Session["state"] {
  const { state } = useSession();
  const router = useRouter();
  const authenticated = state === "authenticated";

  useEffect(() => {
    if (authenticated) router.replace(`/${locale}`);
  }, [authenticated, locale, router]);

  return state;
}
