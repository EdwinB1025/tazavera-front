"use client";

import { useEffect, useRef, useState } from "react";

// ─── UI-specific types (declared before the hook) ───
// Declared here so the hook and `Combobox.tsx` share them; `Combobox.tsx`
// re-exports them (design.md D2). No generated API type is used: the
// consumer's search function maps its own API response to these options.

export type ComboboxOption = { value: string; label: string; detail?: string };

export type ComboboxSearch = (term: string, signal: AbortSignal) => Promise<ComboboxOption[]>;

export type ComboboxSearchStatus = "idle" | "loading" | "success" | "error";

export type ComboboxSearchState = { status: ComboboxSearchStatus; results: ComboboxOption[] };

/** Minimum trimmed length before a search runs. */
export const MIN_SEARCH_LENGTH = 2;

/** Wait after the last change before a search runs, in milliseconds. */
const SEARCH_DELAY_MS = 300;

const IDLE: ComboboxSearchState = { status: "idle", results: [] };

/**
 * Search state of a combobox in search mode (design.md D9). Under two
 * trimmed characters it stays idle and runs nothing; otherwise it waits
 * 300 ms after the last change, aborts the previous search, calls
 * `search(term.trim(), signal)` and reports loading, then success or error.
 * The resolution of an aborted call is ignored.
 */
export function useComboboxSearch(search: ComboboxSearch, term: string): ComboboxSearchState {
  const [state, setState] = useState<ComboboxSearchState>(IDLE);
  const controllerRef = useRef<AbortController | null>(null);
  const trimmed = term.trim();
  const active = trimmed.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setState((current) => ({ status: "loading", results: current.results }));
      search(trimmed, controller.signal).then(
        (results) => {
          if (!controller.signal.aborted) setState({ status: "success", results });
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          if (error instanceof DOMException && error.name === "AbortError") return;
          setState({ status: "error", results: [] });
        },
      );
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active, search, trimmed]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return active ? state : IDLE;
}
