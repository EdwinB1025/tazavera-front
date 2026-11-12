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

// ─── Settled classes (restyle-taxonomy-badge-toggles design.md D1–D3, D5, D6):
// one chip on every badge (surface-textarea fill, text-strong glyph and ring), 14px
// below md and 16px from md in a 24px hit area, at the badge's end, glyph in
// the tree badge text role ───
const TOGGLE_CLASSES = [
  "relative",
  "inline-flex",
  "size-3.5",
  "md:size-4",
  "shrink-0",
  "items-center",
  "justify-center",
  "rounded-check",
  "border",
  "border-current",
  "bg-surface-textarea",
  "text-text-strong",
  "type-tree-badge",
  "ml-1",
  "-mr-1",
  "before:absolute",
  "before:-inset-1.5",
  "md:before:-inset-1.25",
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
