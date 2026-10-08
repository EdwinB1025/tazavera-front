import type { ReactNode } from "react";
import { RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type OfferingViewButtonProps = {
  ulid: string;
  locale: string;
  label: string;
};

/**
 * The View action of an offering card (fix-production-aut-findings design.md
 * D3): an action button opening the offering's detail route. The card's
 * consumers decide who sees it and supply it in the card's actions.
 */
export function OfferingViewButton({
  ulid,
  locale,
  label,
}: OfferingViewButtonProps): ReactNode {
  return (
    <RouteButton href={`/${locale}/offerings/${ulid}`} variant="action-3" size="sm">
      {label}
    </RouteButton>
  );
}
