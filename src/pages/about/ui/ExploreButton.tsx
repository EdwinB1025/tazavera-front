"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ExploreButtonProps = {
  locale: string;
  label: string;
};

/**
 * The closing primary action of the about page (design.md D10; the landing
 * spec "About us page" — "Closing action"). Activation opens the entry page
 * of the active locale through the app router (`useRouter().push`, the
 * documented button navigation of `use-router.md`). It is an event handler,
 * hence a Client Component; the label arrives as a prop (design.md D11).
 */
export function ExploreButton({
  locale,
  label,
}: ExploreButtonProps): ReactNode {
  const router = useRouter();

  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    router.push(`/${locale}`);
  };

  return <Button variant="action-3" onClick={handleClick}>{label}</Button>;
}
