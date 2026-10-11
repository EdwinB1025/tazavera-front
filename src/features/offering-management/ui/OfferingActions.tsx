"use client";

import type { ReactNode } from "react";
import type { OfferingSummary } from "@/shared/api";
import { Button } from "@/shared/ui";
import { Trash2 } from "@/shared/ui/icons";
import { LABEL_SEPARATOR, offeringIdentification } from "../lib/identification";

// ─── UI-specific types (declared before the component) ───

export type OfferingActionsTexts = {
  deleteLabel: string;
};

export type OfferingActionsProps = {
  offering: OfferingSummary;
  onDelete: () => void;
  texts: OfferingActionsTexts;
};

/**
 * The feature's content of an offering card's `actions` slot (design.md D7;
 * fix-offering-card-actions-layout design.md D2): Delete alone, with no
 * wrapper, so it takes its own cell of the footer's action group. Its
 * accessible name starts with its visible label and names the offering's
 * coffee and location (WCAG 2.5.3). Delete uses the removal treatment settled
 * for Delete (`action-2`, compact, `Trash2`).
 */
export function OfferingActions({
  offering,
  onDelete,
  texts,
}: OfferingActionsProps): ReactNode {
  return (
    <Button
      variant="action-2"
      size="sm"
      icon={Trash2}
      aria-label={`${texts.deleteLabel}${LABEL_SEPARATOR}${offeringIdentification(offering)}`}
      onClick={onDelete}
    >
      {texts.deleteLabel}
    </Button>
  );
}
