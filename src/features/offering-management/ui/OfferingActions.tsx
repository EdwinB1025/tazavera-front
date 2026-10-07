"use client";

import type { ReactNode } from "react";
import type { OfferingSummary } from "@/shared/api";
import { Button, Checkbox } from "@/shared/ui";
import { Trash2 } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type OfferingActionsTexts = {
  selectLabel: string;
  deleteLabel: string;
};

export type OfferingActionsProps = {
  offering: OfferingSummary;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
  texts: OfferingActionsTexts;
};

// The offering's identification after a control's visible label: coffee name
// and location name (summary §4; no interface text).
const NAME_SEPARATOR = " — ";
const LABEL_SEPARATOR = " ";

// One wrapper: a centred row 0.5rem apart, no box (summary §6.2).
const WRAPPER_CLASSES = ["flex", "items-center", "gap-2"].join(" ");

/**
 * The content of an offering card's `actions` slot (design.md D7; spec
 * "Offering selection"): Select, then Delete. Each control's accessible name
 * starts with its visible label and names the offering's coffee and location
 * (WCAG 2.5.3), so every card's controls are told apart. Delete uses the
 * removal treatment settled for Delete (`action-2`, compact, `Trash2`).
 */
export function OfferingActions({
  offering,
  selected,
  onToggle,
  onDelete,
  texts,
}: OfferingActionsProps): ReactNode {
  const identification = [
    offering.coffeeInventory?.coffee?.name,
    offering.location?.name,
  ]
    .filter(Boolean)
    .join(NAME_SEPARATOR);

  return (
    <div className={WRAPPER_CLASSES}>
      <Checkbox
        checked={selected}
        onChange={onToggle}
        label={
          <>
            {texts.selectLabel}
            {LABEL_SEPARATOR}
            <span className="sr-only">{identification}</span>
          </>
        }
      />
      <Button
        variant="action-2"
        size="sm"
        icon={Trash2}
        aria-label={`${texts.deleteLabel}${LABEL_SEPARATOR}${identification}`}
        onClick={onDelete}
      >
        {texts.deleteLabel}
      </Button>
    </div>
  );
}
