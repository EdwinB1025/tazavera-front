"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ExploreButtonProps = {
  label: string;
};

/**
 * The hero's primary action (design.md D10; the landing spec "Entry page
 * hero" — "Explore scrolls to the offerings"). Activation scrolls the
 * verified offerings list — the block's root element `#offerings` (design.md
 * D9) — into view on the same page and pushes no route. It is an event
 * handler, hence a Client Component; the label arrives as a prop (design.md
 * D11).
 */
export function ExploreButton({ label }: ExploreButtonProps): ReactNode {
  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    document
      .getElementById("offerings")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <Button variant="action-3" onClick={handleClick}>{label}</Button>;
}
