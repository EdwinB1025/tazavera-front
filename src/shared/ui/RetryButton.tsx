"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

// ─── UI-specific types (declared before the component) ───

export type RetryButtonProps = {
  label: string;
};

/**
 * The retry action of an error state (the landing spec "Retry reloads";
 * moved to the shared segment by add-offering-catalog design.md D4).
 * Activation calls `router.refresh()` — an event handler, hence a Client
 * Component — so the route's Server Components re-run their
 * data requests and the block loads again through its loading state.
 */
export function RetryButton({ label }: RetryButtonProps): ReactNode {
  const router = useRouter();
  return <Button onClick={() => router.refresh()}>{label}</Button>;
}
