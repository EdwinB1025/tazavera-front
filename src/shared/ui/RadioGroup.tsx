"use client";

import { useId, type ReactNode } from "react";
import { ControlMessages, useControlMessages } from "./ControlMessages";
import {
  FACET_LEGEND_CLASSES,
  FACET_MESSAGE_CLASSES,
  FACET_ROWS_CLASSES,
  type ControlPresentation,
} from "./facet-row";
import { RadioOptionRow } from "./RadioOptionRow";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: the options and every text are supplied
// by the consuming capability. `value`, `defaultValue` and `onChange` live at
// group level (design.md D7).

export type RadioOption = {
  value: string;
  label: ReactNode;
  // add-facet-controls design.md D3 (facet-row presentation): a neutral
  // option never takes the selected look; a hidden option renders its row
  // with the `hidden` attribute and stays in the group.
  neutral?: boolean;
  hidden?: boolean;
};

export type RadioGroupVariant = "default" | "inverse";

export type RadioGroupProps = {
  legend: ReactNode;
  options: RadioOption[];
  name?: string; // shared by the options so keyboard grouping is native
  value?: string; // controlled mode
  defaultValue?: string; // uncontrolled mode
  onChange?: (value: string) => void;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean; // marks each radio input required
  disabled?: boolean;
  variant?: RadioGroupVariant; // explicit prop only (design.md D1.1)
  presentation?: ControlPresentation; // add-facet-controls design.md D3
  id?: string; // fieldset id; else a generated one
};

/**
 * Tazavera radio group.
 *
 * Group name, single choice, dot, hit area and own-field contract per the
 * `form-fields` spec ("Radio group") and design.md (D1.1, D2, D7, D9). The
 * radio group is its own field and is never placed inside a Field: its
 * `fieldset` legend names the group and it binds its own help text and error
 * message to the fieldset from its own props, help before error. The options
 * share one `name`, so keyboard grouping and mutual exclusion are native.
 */
export function RadioGroup({
  legend,
  options,
  name: nameProp,
  value,
  defaultValue,
  onChange,
  help,
  error,
  required,
  disabled,
  variant = "default",
  presentation = "field",
  id,
}: RadioGroupProps): ReactNode {
  const generatedGroupId = useId();
  const groupId = id ?? generatedGroupId;
  const isRow = presentation === "row";
  const legendId = useId();
  const messages = useControlMessages(help, error);
  const generatedName = useId();
  const name = nameProp ?? generatedName;

  // D1.1: the attribute contract renders from the control's own props. An
  // empty string is not a message: `help=""` and `error=""` render nothing and
  // wire nothing. `value` / `defaultValue` / `onChange` stay at group level
  // (design.md D7): no React state mirrors the choice, the dots follow the
  // inputs' real state through CSS. Review round 1: the fieldset is the named
  // group itself for assistive technology (`role="radiogroup"` with
  // `aria-labelledby` on the legend) and keeps `aria-describedby` and
  // `aria-invalid`, which a plain group does not expose.
  const optionRows = options.map((option) => (
    <RadioOptionRow
      key={option.value}
      option={option}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      required={required}
      disabled={disabled}
      hasError={messages.hasError}
      presentation={presentation}
    />
  ));

  return (
    <fieldset
      id={groupId}
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={messages.describedBy}
      aria-invalid={messages.hasError ? "true" : undefined}
      className={variant === "inverse" ? "variant-inverse" : undefined}
    >
      <legend
        id={legendId}
        className={isRow ? FACET_LEGEND_CLASSES : "type-label mb-2"}
      >
        {legend}
      </legend>
      {isRow ? <div className={FACET_ROWS_CLASSES}>{optionRows}</div> : optionRows}
      <ControlMessages
        ids={messages}
        help={help}
        error={error}
        className={isRow ? FACET_MESSAGE_CLASSES : undefined}
      />
    </fieldset>
  );
}
