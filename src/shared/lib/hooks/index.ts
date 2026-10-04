"use client";

import { useSyncExternalStore } from "react";

/**
 * Hooks the pulled shadcn components need (design.md D6).
 *
 * `useIsMobile` reports the below-`md` viewport (design.md D11: 768px), the
 * switch the sheet and the sidebar overlay work from.
 */

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
