"use client";

import { useContext, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Command } from "cmdk";
import { Popover } from "radix-ui";
import { Check } from "@/shared/ui/icons";
import { FieldContext } from "@/shared/ui/field-context";
import { Input, type InputVariant } from "./Input";
import {
  MIN_SEARCH_LENGTH,
  useComboboxSearch,
  type ComboboxOption,
  type ComboboxSearch,
} from "./use-combobox-search";

// ─── UI-specific types (declared before the component) ───
// `ComboboxOption` and `ComboboxSearch` are declared beside the search hook
// and re-exported here (design.md D2). Options, search and texts come from
// the consumer; no generated API type is used.

export type { ComboboxOption, ComboboxSearch } from "./use-combobox-search";

/** `optionCount` holds a `{count}` placeholder. */
export type ComboboxTexts = {
  searching: string;
  noMatches: string;
  loadError: string;
  optionCount: string;
};

type ComboboxBaseProps = {
  label: string;
  value: ComboboxOption | null;
  onChange: (option: ComboboxOption | null) => void;
  variant?: InputVariant;
  texts: ComboboxTexts;
  help?: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
};

export type ComboboxProps = ComboboxBaseProps &
  (
    | { options: ComboboxOption[]; search?: never } // local mode
    | { search: ComboboxSearch; options?: never } // search mode
  );

// ─── Treatment classes (design.md D9) ───
// The popup copies the nav content of DropdownMenu.tsx plus width and height.

const POPUP_CLASSES =
  "z-50 w-(--radix-popover-trigger-width) max-h-60 overflow-y-auto rounded-field border border-border-strong bg-nav-surface p-1 text-nav-text shadow-md";

const OPTION_CLASSES =
  "relative flex min-h-11 cursor-default select-none items-center gap-2 rounded-field px-3 py-2 text-nav-text data-[selected=true]:bg-nav-hover data-[selected=true]:text-nav-text-hover";

const STATE_ROW_CLASSES = "type-option-detail px-3 py-2";

/** The label with the first case-insensitive occurrence of `term` in bold. */
function highlight(label: string, term: string): ReactNode {
  const index = term === "" ? -1 : label.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return label;
  return (
    <>
      {label.slice(0, index)}
      <strong className="font-bold">{label.slice(index, index + term.length)}</strong>
      {label.slice(index + term.length)}
    </>
  );
}

/** Search mode never runs: the hook needs a function in local mode too. */
const NO_SEARCH: ComboboxSearch = async () => [];

/**
 * Combobox (spec filtering "Combobox"; design.md D9): cmdk `Command` with
 * the project `Input` as its input (`Command.Input asChild`) and a Radix
 * Popover popup. Local mode filters the given options by a case-insensitive
 * "contains"; search mode runs the consumer's search through
 * `useComboboxSearch`. cmdk fixes `aria-expanded="true"` and its own input
 * id, so a layout effect after every render sets `aria-expanded` to the
 * popup state and the visible label's `for` to the input id. Inside a
 * `Field` (design.md D14) it renders no label or help of its own: the
 * input takes the Field's control id and drops cmdk's `aria-labelledby`, so
 * the Field's label names it and the Field's help and error describe it.
 */
export function Combobox({
  label,
  value,
  onChange,
  variant = "default",
  texts,
  help,
  disabled,
  placeholder,
  maxLength,
  options,
  search,
}: ComboboxProps): ReactNode {
  const field = useContext(FieldContext);
  const inField = field !== null;
  const helpId = useId();
  const hasHelp = !inField && help != null && help !== "";
  const labelRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchMode = search !== undefined;
  // cmdk highlights the first option as soon as the rows change; the next
  // ArrowDown keeps it there instead of moving to the second (spec scenario
  // "Keyboard choice").
  const firstPending = useRef(false);

  const [term, setTerm] = useState(value?.label ?? "");
  const [open, setOpen] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    setTerm(value?.label ?? "");
  }

  const trimmed = term.trim();
  const searchState = useComboboxSearch(search ?? NO_SEARCH, searchMode ? term : "");

  // Rows: the shown options, or one state text in their place.
  let shown: ComboboxOption[] = [];
  let stateText: string | undefined;
  if (!searchMode) {
    const needle = term.toLowerCase();
    shown = (options ?? []).filter((option) => option.label.toLowerCase().includes(needle));
    if (shown.length === 0) stateText = texts.noMatches;
  } else if (searchState.status === "error") {
    stateText = texts.loadError;
  } else if (searchState.status === "success") {
    shown = searchState.results;
    if (shown.length === 0) stateText = texts.noMatches;
  } else {
    stateText = texts.searching;
  }
  const status = !open
    ? ""
    : (stateText ?? texts.optionCount.replace("{count}", String(shown.length)));

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.setAttribute("aria-expanded", String(open));
    labelRef.current?.setAttribute("for", input.id);
  });

  function changeTerm(next: string): void {
    setTerm(next);
    firstPending.current = true;
    setOpen(searchMode ? next.trim().length >= MIN_SEARCH_LENGTH : next !== "");
  }

  function choose(option: ComboboxOption): void {
    onChange(option);
    setTerm(option.label);
    setOpen(false);
  }

  function clearIfEmpty(): void {
    if (term === "" && value !== null) onChange(null);
  }

  return (
    <div className={variant === "inverse" ? "variant-inverse" : undefined}>
      {!inField && (
        <label ref={labelRef} className="type-label">
          {label}
        </label>
      )}
      <Command label={inField ? undefined : label} shouldFilter={false} vimBindings={false}>
        <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
          <Popover.Anchor>
            <Command.Input
              asChild
              ref={inputRef}
              value={term}
              onValueChange={changeTerm}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && !open && !searchMode && term !== "") {
                  event.preventDefault();
                  firstPending.current = true;
                  setOpen(true);
                } else if (event.key === "ArrowDown" && open && firstPending.current) {
                  event.preventDefault();
                  firstPending.current = false;
                } else if (event.key === "Enter" && term === "") {
                  clearIfEmpty();
                }
              }}
              onBlur={() => {
                setOpen(false);
                clearIfEmpty();
              }}
            >
              <Input
                variant={variant}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                aria-describedby={hasHelp ? helpId : undefined}
                {...(inField && { id: field.controlId, "aria-labelledby": undefined })}
              />
            </Command.Input>
          </Popover.Anchor>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={4}
              onOpenAutoFocus={(event) => event.preventDefault()}
              onInteractOutside={(event) => {
                if (event.target === inputRef.current) event.preventDefault();
              }}
              // Keep focus in the input when an option is pressed.
              onMouseDown={(event) => event.preventDefault()}
              className={POPUP_CLASSES}
            >
              <Command.List label={label}>
                {stateText !== undefined ? (
                  <div role="presentation" className={STATE_ROW_CLASSES}>
                    {stateText}
                  </div>
                ) : (
                  shown.map((option) => (
                    <Command.Item
                      key={option.value}
                      value={option.value}
                      onSelect={() => choose(option)}
                      className={OPTION_CLASSES}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="type-option truncate">
                          {highlight(option.label, trimmed)}
                        </span>
                        {option.detail && (
                          <span className="type-option-detail truncate">{option.detail}</span>
                        )}
                      </span>
                      {value?.value === option.value && (
                        <Check className="size-4 shrink-0" aria-hidden="true" />
                      )}
                    </Command.Item>
                  ))
                )}
              </Command.List>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </Command>
      {hasHelp && (
        <p id={helpId} className="type-meta mt-1">
          {help}
        </p>
      )}
      <div role="status" className="sr-only">
        {status}
      </div>
    </div>
  );
}
