"use client";

import type { ReactNode } from "react";
import { NoteField } from "./NoteField";

// ─── UI-specific types (declared before the component) ───

export type ExtrinsicFieldProps = {
  label: string;
  /** The open note field's label. */
  noteLabel: string;
  addLabel: string;
  removeLabel: string;
  /** The field's text: `null` while closed, its text (possibly empty) once open. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** The closed evaluation's presentation: the value as text under its label. */
  readOnly: boolean;
};

const FIELD_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * One optional extrinsic field of the Extrinsic group (spec "Evaluation form";
 * add-extrinsic-fields; refine-evaluation-flow D2): its label always shown,
 * then the note control Overall's note uses, closed behind "Add note" until
 * opened or loaded with a value; an unopened or empty field is sent as `null`.
 * Read-only, a value shows as the read-only notes do and an empty field shows
 * nothing.
 */
export function ExtrinsicField({
  label,
  noteLabel,
  addLabel,
  removeLabel,
  value,
  onChange,
  readOnly,
}: ExtrinsicFieldProps): ReactNode {
  if (readOnly) {
    return value ? (
      <div className={FIELD_CLASSES}>
        <p className="type-label">{label}</p>
        <p className="type-body">{value}</p>
      </div>
    ) : null;
  }
  return (
    <div className={FIELD_CLASSES}>
      <p className="type-label">{label}</p>
      <NoteField
        label={noteLabel}
        addLabel={addLabel}
        removeLabel={removeLabel}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
