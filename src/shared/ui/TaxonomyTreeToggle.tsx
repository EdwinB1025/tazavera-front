"use client";

import type { ReactNode } from "react";
import type { TaxonomyTreeTexts } from "./TaxonomyTree";

// ─── UI-specific types (declared before the component) ───

export type TaxonomyTreeToggleProps = {
  open: boolean;
  /** Id of the child list it shows and hides. */
  controls: string;
  /** The note's label, filled into the accessible name. */
  label: string;
  onToggle: () => void;
  texts: TaxonomyTreeTexts;
};

// ─── Settled classes (collapse-taxonomy-trees design.md D4; unify-taste-trees
// D2): inside the badge, the border and the glyph take the badge's label colour ───
const TOGGLE_CLASSES = [
  "inline-flex",
  "size-6",
  "shrink-0",
  "items-center",
  "justify-center",
  "rounded-field",
  "border",
  "border-current",
  "type-button",
  "focus-visible:focus-ring",
].join(" ");

// The visible glyphs: plus while closed, minus sign (U+2212) while open.
const GLYPH_CLOSED = "+";
const GLYPH_OPEN = "−";

/**
 * Shows or hides a taxonomy note's children (collapse-taxonomy-trees
 * design.md D4): named from the catalog with the note's label, the glyph
 * hidden from assistive technologies.
 */
export function TaxonomyTreeToggle({
  open,
  controls,
  label,
  onToggle,
  texts,
}: TaxonomyTreeToggleProps): ReactNode {
  const name = (open ? texts.hideNotesLabel : texts.showNotesLabel).replace(
    "{label}",
    label,
  );
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={name}
      onClick={onToggle}
      className={TOGGLE_CLASSES}
    >
      <span aria-hidden="true">{open ? GLYPH_OPEN : GLYPH_CLOSED}</span>
    </button>
  );
}
