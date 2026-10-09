"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  MIN_SEARCH_LENGTH,
  useComboboxSearch,
  type ComboboxOption,
  type ComboboxSearch,
  type ComboboxSearchState,
} from "./use-combobox-search";
import type { ComboboxTexts } from "./Combobox";

type ComboboxInputArgs = {
  value: ComboboxOption | null;
  onChange: (option: ComboboxOption | null) => void;
  texts: ComboboxTexts;
  options: ComboboxOption[] | undefined;
  search: ComboboxSearch | undefined;
};

/** Search mode never runs: the hook needs a function in local mode too. */
const NO_SEARCH: ComboboxSearch = async () => [];

type ComboboxRows = { shown: ComboboxOption[]; stateText: string | undefined };

/** Rows: the shown options, or one state text in their place. */
function comboboxRows(
  term: string,
  texts: ComboboxTexts,
  options: ComboboxOption[] | undefined,
  searchState: ComboboxSearchState | null,
): ComboboxRows {
  if (searchState === null) {
    const needle = term.toLowerCase();
    const shown = (options ?? []).filter((option) => option.label.toLowerCase().includes(needle));
    return { shown, stateText: shown.length === 0 ? texts.noMatches : undefined };
  }
  if (searchState.status === "error") return { shown: [], stateText: texts.loadError };
  if (searchState.status === "success") {
    const shown = searchState.results;
    return { shown, stateText: shown.length === 0 ? texts.noMatches : undefined };
  }
  return { shown: [], stateText: texts.searching };
}

/**
 * The combobox input state (design.md D2): the term, whether it was typed,
 * the popup state, the rows, the live status and the input's handlers.
 */
export function useComboboxInput({ value, onChange, texts, options, search }: ComboboxInputArgs) {
  const searchMode = search !== undefined;
  // cmdk highlights the first option as soon as the rows change; the next
  // ArrowDown keeps it there instead of moving to the second (spec scenario
  // "Keyboard choice").
  const firstPending = useRef(false);

  const [term, setTerm] = useState(value?.label ?? "");
  // Only typed text searches (refine-facet-controls design.md D3): false
  // while the input holds a label the combobox set itself.
  const [typed, setTyped] = useState(false);
  const [open, setOpen] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    setTerm(value?.label ?? "");
    setTyped(false);
  }

  const searchState = useComboboxSearch(search ?? NO_SEARCH, searchMode && typed ? term : "");
  const { shown, stateText } = comboboxRows(term, texts, options, searchMode ? searchState : null);
  const status = !open
    ? ""
    : (stateText ?? texts.optionCount.replace("{count}", String(shown.length)));

  function changeTerm(next: string): void {
    setTerm(next);
    setTyped(true);
    firstPending.current = true;
    setOpen(searchMode ? next.trim().length >= MIN_SEARCH_LENGTH : next !== "");
  }

  function choose(option: ComboboxOption): void {
    onChange(option);
    setTerm(option.label);
    setTyped(false);
    setOpen(false);
  }

  function clearIfEmpty(): void {
    if (term === "" && value !== null) onChange(null);
  }

  // Abandoned typed text (refine-facet-controls design.md D2): the input
  // shows the chosen value's label again, or empties, and nothing is reported.
  function restore(): void {
    setTerm(value?.label ?? "");
    setTyped(false);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown" && !open && !searchMode && term !== "") {
      event.preventDefault();
      firstPending.current = true;
      setOpen(true);
    } else if (event.key === "ArrowDown" && open && firstPending.current) {
      event.preventDefault();
      firstPending.current = false;
    } else if (event.key === "Enter" && term === "") {
      clearIfEmpty();
    } else if (event.key === "Escape") {
      restore();
    }
  }

  function onBlur(): void {
    if (term === "") {
      setOpen(false);
      clearIfEmpty();
    } else {
      restore();
    }
  }

  return { term, open, setOpen, shown, stateText, status, changeTerm, choose, onKeyDown, onBlur };
}

/**
 * cmdk fixes `aria-expanded="true"` and its own input id, so a layout effect
 * after every render sets `aria-expanded` to the popup state and the visible
 * label's `for` to the input id; inside a `Field` it finds the Field's label
 * by the Field's control id first (design.md D2).
 */
export function useComboboxLabelFor(
  inputRef: RefObject<HTMLInputElement | null>,
  labelRef: RefObject<HTMLLabelElement | null>,
  open: boolean,
  fieldControlId: string | null,
): void {
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.setAttribute("aria-expanded", String(open));
    if (fieldControlId !== null && labelRef.current === null) {
      labelRef.current =
        Array.from(document.getElementsByTagName("label")).find(
          (label) => label.htmlFor === fieldControlId,
        ) ?? null;
    }
    labelRef.current?.setAttribute("for", input.id);
  });
}
