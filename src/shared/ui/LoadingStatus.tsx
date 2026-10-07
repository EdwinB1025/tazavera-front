import type { ReactNode } from "react";
import { Loader2 } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type LoadingStatusProps = {
  text: string;
};

/**
 * The loading status (feedback "Request status messages"): a centred `role="status"` row,
 * the `aria-hidden` `Loader2` spinning only without `prefers-reduced-motion`
 * and its text.
 */
export function LoadingStatus({ text }: LoadingStatusProps): ReactNode {
  return (
    <div role="status" className="flex items-center justify-center gap-2">
      <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" />
      <span className="type-meta">{text}</span>
    </div>
  );
}
