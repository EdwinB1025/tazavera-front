"use client";

import { useState, useSyncExternalStore } from "react";
import { splitFieldErrors, type FieldErrors } from "@/shared/api";

/**
 * Hooks the pulled shadcn components need (design.md D6).
 *
 * `useIsMobile` reports the below-`md` viewport (design.md D11: 768px), the
 * switch the sheet and the sidebar overlay work from.
 */

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** A form's `422` messages and whether one names no field (show-field-validation-errors D3). */
export type ServerFieldErrors<F extends string> = {
  errors: Partial<Record<F, string>>;
  /** A key named no field, or no field got a message: the form-level error shows. */
  unmatched: boolean;
  /** Stores a `422`'s messages; returns `unmatched`. */
  show: (map: FieldErrors) => boolean;
  /** Drops one field's message, when the user edits that field. */
  clear: (field: F) => void;
  /** Drops every message, when the form is submitted again. */
  reset: () => void;
};

/**
 * The state of a form's `422` messages (show-field-validation-errors design.md
 * D3; form-fields "Server validation errors"), keyed by the form's `fields`
 * and the API key `aliases`.
 */
export function useServerFieldErrors<F extends string>(
  fields: readonly F[],
  aliases?: Readonly<Record<string, F>>,
): ServerFieldErrors<F> {
  const [state, setState] = useState<{ errors: Partial<Record<F, string>>; unmatched: boolean }>({
    errors: {},
    unmatched: false,
  });
  const show = (map: FieldErrors) => {
    const split = splitFieldErrors(map, fields, aliases);
    setState({ errors: split.fields, unmatched: split.unmatched });
    return split.unmatched;
  };
  const clear = (field: F) =>
    setState((current) => {
      if (current.errors[field] === undefined) return current;
      const errors = { ...current.errors };
      delete errors[field];
      return { ...current, errors };
    });
  const reset = () => setState({ errors: {}, unmatched: false });
  return { ...state, show, clear, reset };
}
