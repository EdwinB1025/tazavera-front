"use client";

import type { ReactNode } from "react";
import type { OfferingSummary } from "@/shared/api";
import { Checkbox } from "@/shared/ui";
import { LABEL_SEPARATOR, offeringIdentification } from "../lib/identification";

// ─── UI-specific types (declared before the component) ───

export type OfferingSelectTexts = {
  selectLabel: string;
};

export type OfferingSelectProps = {
  offering: OfferingSummary;
  selected: boolean;
  onToggle: () => void;
  texts: OfferingSelectTexts;
};

/**
 * The Select control of an offering card, for the card's badge row
 * (fix-offering-card-actions-layout design.md D2; spec "Offering selection").
 * Its accessible name starts with its visible label and names the offering's
 * coffee and location (WCAG 2.5.3), so every card's Select is told apart.
 */
export function OfferingSelect({
  offering,
  selected,
  onToggle,
  texts,
}: OfferingSelectProps): ReactNode {
  return (
    <Checkbox
      checked={selected}
      onChange={onToggle}
      label={
        <>
          {texts.selectLabel}
          {LABEL_SEPARATOR}
          <span className="sr-only">{offeringIdentification(offering)}</span>
        </>
      }
    />
  );
}
