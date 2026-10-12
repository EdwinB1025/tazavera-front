"use client";

import { useEffect, useRef } from "react";
import type { Session } from "@/shared/api";
import { forgetRememberedFilters } from "@/shared/lib/filter-query";

/**
 * Forgets the editing lists' kept filters and order with the session
 * (remember-list-preferences design.md D4; spec "Remembered filters forgotten
 * with the session"): when it becomes anonymous — a sign out from any place
 * or an ended session — and when another user becomes signed in. The last
 * user's `ulid` lives only in memory; nothing about the user is stored.
 */
export function useForgetListPreferences(session: Session): void {
  const lastUlid = useRef<string | null>(null);
  const ulid = session.state === "authenticated" ? (session.user.ulid ?? null) : null;

  useEffect(() => {
    if (session.state === "anonymous") {
      forgetRememberedFilters();
      lastUlid.current = null;
      return;
    }
    if (session.state !== "authenticated") return;
    if (lastUlid.current !== null && lastUlid.current !== ulid) forgetRememberedFilters();
    lastUlid.current = ulid;
  }, [session.state, ulid]);
}
