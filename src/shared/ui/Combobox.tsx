"use client";

import { useContext, useId, useRef, type ReactNode } from "react";
import { Command } from "cmdk";
import { Popover } from "radix-ui";
import { FieldContext } from "@/shared/ui/field-context";
import { ComboboxPopup } from "./ComboboxPopup";
import { Input, type InputVariant } from "./Input";
import { useComboboxInput, useComboboxLabelFor } from "./use-combobox-input";
import type { ComboboxOption, ComboboxSearch } from "./use-combobox-search";

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

/**
 * Combobox (spec filtering "Combobox"; design.md D9): cmdk `Command` with
 * the project `Input` as its input (`Command.Input asChild`) and a Radix
 * Popover popup. Local mode filters the given options by a case-insensitive
 * "contains"; search mode runs the consumer's search through
 * `useComboboxSearch`. cmdk fixes `aria-expanded="true"` and its own input
 * id, so a layout effect after every render sets `aria-expanded` to the
 * popup state and the visible label's `for` to the input id
 * (`useComboboxLabelFor`; split-oversized-facets design.md D2). Inside a
 * `Field` (design.md D14) it renders no label or help of its own: the input
 * keeps cmdk's id, which cmdk needs to refocus it when results change, and
 * drops cmdk's `aria-labelledby`; the same effect points the Field's label
 * at that id, so the Field's label names it and its help and error describe it.
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
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const input = useComboboxInput({ value, onChange, texts, options, search });
  useComboboxLabelFor(inputRef, labelRef, input.open, field?.controlId ?? null);

  return (
    <div className={variant === "inverse" ? "variant-inverse" : undefined}>
      {!inField && (
        <label ref={labelRef} className="type-label">
          {label}
        </label>
      )}
      <Command label={inField ? undefined : label} shouldFilter={false} vimBindings={false}>
        <Popover.Root open={input.open} onOpenChange={input.setOpen} modal={false}>
          <Popover.Anchor>
            <Command.Input
              asChild
              ref={inputRef}
              value={input.term}
              onValueChange={input.changeTerm}
              onKeyDown={input.onKeyDown}
              onBlur={input.onBlur}
            >
              <Input
                variant={variant}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                aria-describedby={hasHelp ? helpId : undefined}
                {...(inField && { "aria-labelledby": undefined })}
              />
            </Command.Input>
          </Popover.Anchor>
          <ComboboxPopup
            label={label}
            inputRef={inputRef}
            shown={input.shown}
            stateText={input.stateText}
            term={input.term.trim()}
            value={value}
            onChoose={input.choose}
          />
        </Popover.Root>
      </Command>
      {hasHelp && (
        <p id={helpId} className="type-meta mt-1">
          {help}
        </p>
      )}
      <div role="status" className="sr-only">
        {input.status}
      </div>
    </div>
  );
}
