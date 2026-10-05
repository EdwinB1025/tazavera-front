"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type RetryButtonProps = {
  label: string;
};

/**
 * The retry action of the list's error state (design.md D9; the landing spec
 * "Retry reloads"). Activation calls `router.refresh()` — an event handler,
 * hence a Client Component — so the route's Server Components re-run their
 * data requests and the list loads again through its loading state.
 */
export function RetryButton({ label }: RetryButtonProps): ReactNode {
  const router = useRouter();
  return <Button onClick={() => router.refresh()}>{label}</Button>;
}
