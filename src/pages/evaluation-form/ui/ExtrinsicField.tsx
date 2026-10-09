"use client";

import type { ReactNode } from "react";
import { Field, Textarea } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ExtrinsicFieldProps = {
  label: string;
  /** The field's text, `null` when empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** The closed evaluation's presentation: the value as text under its label. */
  readOnly: boolean;
};

const READ_ONLY_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * One optional extrinsic field of the Extrinsic group (spec "Evaluation form";
 * add-extrinsic-fields): a labelled text area, its text sent as is and an
 * empty one as `null`. Read-only, a value shows as the read-only notes do and
 * an empty field shows nothing.
 */
export function ExtrinsicField({ label, value, onChange, readOnly }: ExtrinsicFieldProps): ReactNode {
  if (readOnly) {
    return value ? (
      <div className={READ_ONLY_CLASSES}>
        <p className="type-label">{label}</p>
        <p className="type-body">{value}</p>
      </div>
    ) : null;
  }
  return (
    <Field label={label}>
      <Textarea value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} />
    </Field>
  );
}
