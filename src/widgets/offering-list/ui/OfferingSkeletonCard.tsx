import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/ui";

// ─── Settled pieces (shapes only, no interface text; design.md D11) ───
const PLACEHOLDER_CLASSES = ["animate-pulse", "bg-surface-section", "rounded-field"].join(
  " ",
);

/**
 * One loading placeholder of the offerings list (the landing spec "Loading";
 * design.md D9, D10). The home screen renders several of these as the
 * `Suspense` fallback around `VerifiedOfferings`. It stands in the list's place
 * as a card and renders shapes only, so neither the empty nor the error
 * message can appear while loading.
 */
export function OfferingSkeletonCard(): ReactNode {
  return (
    <Card>
      <CardContent>
        <div className={cn(PLACEHOLDER_CLASSES, "h-4 w-1/4")} />
        <div className={cn(PLACEHOLDER_CLASSES, "h-6 w-2/3")} />
        <div className={cn(PLACEHOLDER_CLASSES, "h-4 w-1/2")} />
      </CardContent>
    </Card>
  );
}
