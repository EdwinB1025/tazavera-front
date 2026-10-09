"use client";

import type { ReactNode } from "react";
import { Field, Textarea } from "@/shared/ui";
import { Plus } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type NoteFieldProps = {
  /** The note field's label. */
  label: string;
  addLabel: string;
  removeLabel: string;
  /** The note: `null` while closed, its text (possibly empty) once open. */
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  /** The closed evaluation's presentation: the note as text, no actions. */
  readOnly?: boolean;
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
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");
const OPEN_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * The optional note of an axis and part (design.md D14; spec "Notes"): closed
 * behind "Add note", with an `aria-hidden` `Plus` after its text (add-note-plus-icon
 * design.md D1); once open, a `Field` with a `Textarea` and the remove-note
 * control aligned to the end, which drops the note and its text.
 * Read-only, an existing note shows as `type-body` text under its label.
 */
export function NoteField({
  label,
  addLabel,
  removeLabel,
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: NoteFieldProps): ReactNode {
  if (readOnly) {
    return value ? (
      <div className={OPEN_CLASSES}>
        <p className="type-label">{label}</p>
        <p className="type-body">{value}</p>
      </div>
    ) : null;
  }
  if (value === null) {
    return (
      <button
        type="button"
        className={`${LINK_BUTTON_CLASSES} self-start inline-flex items-center gap-2`}
        disabled={disabled}
        onClick={() => onChange("")}
      >
        {addLabel}
        <Plus className="size-4 shrink-0" aria-hidden="true" />
      </button>
    );
  }
  return (
    <div className={OPEN_CLASSES}>
      <Field label={label}>
        <Textarea
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </Field>
      <button
        type="button"
        className={`${LINK_BUTTON_CLASSES} self-end`}
        disabled={disabled}
        onClick={() => onChange(null)}
      >
        {removeLabel}
      </button>
    </div>
  );
}
