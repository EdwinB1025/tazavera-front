"use client";

import { useId, type ReactNode } from "react";
import { BeanMeter, BeanRadios } from "./BeanScaleBeans";
import { ControlMessages, useControlMessages } from "./ControlMessages";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used or redefined here: this change consumes no API
// operation and every text is a prop supplied by the consuming capability
// (design.md D2). The readOnly contract is enforced by a discriminated union
// rather than a runtime assertion: `onChange` is required unless `readOnly`,
// and bean size `sm` is rejected unless `readOnly` (design summary §1: `sm` is
// below the 24px target). Tests pin these with `@ts-expect-error` cases and
// `npx tsc --noEmit`, the `Textarea` precedent.

export type BeanScaleSize = "sm" | "md" | "lg" | "responsive";

export type BeanScaleProps = {
  label: ReactNode;
  value: number | null; // 1..9, or 0..9 with one decimal when readOnly
  valueText: string;
  disabled?: boolean;
  required?: boolean;
  help?: ReactNode;
  error?: ReactNode;
} & (
  | { readOnly: true; valueLabel: string; onChange?: never; size?: BeanScaleSize }
  | {
      readOnly?: false;
      valueLabel?: never;
      onChange: (value: number) => void;
      size?: Exclude<BeanScaleSize, "sm">;
    }
);

// ─── Treatment classes (design.md D3) ───
// Each bean is a square without padding or border, sized by `size`; `sm` only
// reaches the read-only display (D2). Hover changes only the cursor; disabled
// is 50% opacity with a not-allowed cursor (the `add-base-control` rule). The
// key handling lives with the beans (BeanScaleBeans).

const SIZE_CLASSES: Record<BeanScaleSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  responsive: "size-6 md:size-8",
};

const BEAN_CLASSES = [
  "shrink-0",
  "rounded-full",
  "cursor-pointer",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

const ROW_CLASSES = "flex flex-wrap items-center gap-x-3 gap-y-1";
const VALUE_TEXT_CLASSES = "type-body italic tabular-nums text-text-primary";

/**
 * Tazavera bean scale.
 *
 * Affective score 1..9 per the `form-fields` spec ("Bean scale") and design.md
 * (D2, D3, D4): the interactive beans are a Radix RadioGroup with an own key
 * handler (BeanRadios). The scale is its own field (the `RadioGroup`
 * contract): it renders its label and binds its own help and error, help
 * before error. `readOnly` renders a non-focusable meter whose partial bean
 * is a geometric cut (BeanMeter).
 */
export function BeanScale(props: BeanScaleProps): ReactNode {
  const { label, value, valueText, disabled, required, help, error, size = "responsive" } =
    props;
  const labelId = useId();
  const messages = useControlMessages(help, error);
  const sizeClasses = SIZE_CLASSES[size];
  const beans = { value, labelId, describedBy: messages.describedBy };

  return (
    <div>
      <span id={labelId} className="type-label mb-2 block">
        {label}
      </span>
      <div className={ROW_CLASSES}>
        {props.readOnly ? (
          <BeanMeter {...beans} valueLabel={props.valueLabel} sizeClasses={sizeClasses} />
        ) : (
          <BeanRadios
            {...beans}
            onChange={props.onChange}
            disabled={disabled}
            required={required}
            invalid={messages.hasError}
            beanClasses={`${BEAN_CLASSES} ${sizeClasses}`}
          />
        )}
        <span className={VALUE_TEXT_CLASSES}>{valueText}</span>
      </div>
      <ControlMessages ids={messages} help={help} error={error} />
    </div>
  );
}
