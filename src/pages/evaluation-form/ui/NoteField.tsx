"use client";

import type { ReactNode } from "react";
import { Field, Textarea } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type NoteFieldProps = {
  /** The note field's label. */
  label: string;
  addLabel: string;
  removeLabel: string;
  /** The note: `null` while closed, its text (possibly empty) once open. */
  value: string | null;
  onChange: (value: string | null) => void;
};

// "Add note" and the remove-note control are buttons styled as links
// (design.md D14: `type-body`, `text-link`).
const LINK_BUTTON_CLASSES = [
  "type-body",
  "text-text-link",
  "hover:text-text-link-hover",
  "underline",
  "rounded-field",
  "focus-visible:focus-ring",
].join(" ");
const OPEN_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * The optional note of an axis and part (design.md D14; spec "Notes"): closed
 * behind "Add note"; once open, a `Field` with a `Textarea` and the
 * remove-note control aligned to the end, which drops the note and its text.
 */
export function NoteField({
  label,
  addLabel,
  removeLabel,
  value,
  onChange,
}: NoteFieldProps): ReactNode {
  if (value === null) {
    return (
      <button type="button" className={`${LINK_BUTTON_CLASSES} self-start`} onClick={() => onChange("")}>
        {addLabel}
      </button>
    );
  }
  return (
    <div className={OPEN_CLASSES}>
      <Field label={label}>
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
      </Field>
      <button type="button" className={`${LINK_BUTTON_CLASSES} self-end`} onClick={() => onChange(null)}>
        {removeLabel}
      </button>
    </div>
  );
}
