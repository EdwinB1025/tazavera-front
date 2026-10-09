"use client";

import type { ReactNode, RefObject } from "react";
import { Command } from "cmdk";
import { Popover } from "radix-ui";
import { Check } from "@/shared/ui/icons";
import type { ComboboxOption } from "./use-combobox-search";

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

type ComboboxItemProps = {
  option: ComboboxOption;
  term: string;
  selected: boolean;
  onSelect: () => void;
};

function ComboboxItem({ option, term, selected, onSelect }: ComboboxItemProps): ReactNode {
  return (
    <Command.Item value={option.value} onSelect={onSelect} className={OPTION_CLASSES}>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-option truncate">{highlight(option.label, term)}</span>
        {option.detail && <span className="type-option-detail truncate">{option.detail}</span>}
      </span>
      {selected && <Check className="size-4 shrink-0" aria-hidden="true" />}
    </Command.Item>
  );
}

type ComboboxPopupProps = {
  label: string;
  inputRef: RefObject<HTMLInputElement | null>;
  shown: ComboboxOption[];
  stateText: string | undefined;
  /** The trimmed term, highlighted in each option's label. */
  term: string;
  value: ComboboxOption | null;
  onChoose: (option: ComboboxOption) => void;
};

/** The combobox popup (design.md D2): the state row or the option items. */
export function ComboboxPopup({
  label,
  inputRef,
  shown,
  stateText,
  term,
  value,
  onChoose,
}: ComboboxPopupProps): ReactNode {
  return (
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
              <ComboboxItem
                key={option.value}
                option={option}
                term={term}
                selected={value?.value === option.value}
                onSelect={() => onChoose(option)}
              />
            ))
          )}
        </Command.List>
      </Popover.Content>
    </Popover.Portal>
  );
}
