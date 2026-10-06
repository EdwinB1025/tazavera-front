"use client";

import { useState, type ReactNode } from "react";
import { Field } from "./Field";
import { Input } from "./Input";

// ─── UI-specific types (declared before the component) ───
// Every text is a prop from the consumer; no generated API type is used.

export type FacetTextFieldProps = {
  label: string;
  value: string; // empty = no value
  onCommit: (value: string) => void; // trimmed; "" = remove
  type?: "search" | "text";
  maxLength: number;
  placeholder?: string;
  help?: string;
  disabled?: boolean;
};

/**
 * Text facet (spec filtering "Text facet"; design.md D5): an inverse text
 * input whose local draft follows the `value` prop. Enter or blur commits
 * the trimmed draft when it differs from the last value given or committed.
 */
export function FacetTextField({
  label,
  value,
  onCommit,
  type = "text",
  maxLength,
  placeholder,
  help,
  disabled,
}: FacetTextFieldProps): ReactNode {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(value);
    setCommitted(value);
  }

  function commit(): void {
    const next = draft.trim();
    if (next === committed) return;
    setCommitted(next);
    onCommit(next);
  }

  return (
    <div className="px-3">
      <Field label={label} help={help} variant="inverse">
        <Input
          type={type}
          value={draft}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            commit();
          }}
          onBlur={commit}
        />
      </Field>
    </div>
  );
}
