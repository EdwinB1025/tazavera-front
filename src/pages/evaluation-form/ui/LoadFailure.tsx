"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type LoadFailureProps = {
  message: string;
  retryLabel: string;
  /** Re-runs the load; refreshes the route's server reads when absent. */
  onRetry?: () => void;
};

const FAILURE_CLASSES = ["flex", "flex-col", "items-start", "gap-4"].join(" ");

/**
 * The form's load failure (spec "The form cannot be loaded"; design.md's
 * error table): the failure message with a retry action in the content's
 * place. Without `onRetry` the retry refreshes the route, so its server reads
 * run again.
 */
export function LoadFailure({ message, retryLabel, onRetry }: LoadFailureProps): ReactNode {
  const router = useRouter();
  return (
    <div className={FAILURE_CLASSES}>
      <p className="type-body">{message}</p>
      <Button onClick={onRetry ?? (() => router.refresh())}>{retryLabel}</Button>
    </div>
  );
}
