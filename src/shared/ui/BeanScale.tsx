"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { BeanMark } from "@/shared/ui/icons";

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
// is 50% opacity with a not-allowed cursor (the `add-base-control` rule).

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
const BEANS_CLASSES = "flex flex-nowrap gap-1";
const VALUE_TEXT_CLASSES = "type-body italic tabular-nums text-text-primary";

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** The score a key selects from `value` (design.md D3), or null for others. */
function scoreForKey(key: string, value: number | null): number | null {
  const current = value ?? 0;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return Math.min(9, current + 1);
    case "ArrowLeft":
    case "ArrowDown":
      return Math.max(1, current - 1);
    case "Home":
      return 1;
    case "End":
      return 9;
    default:
      return null;
  }
}

/**
 * Tazavera bean scale.
 *
 * Affective score 1..9 per the `form-fields` spec ("Bean scale") and design.md
 * (D2, D3, D4): the Radix RadioGroup primitive supplies the roles, the checked
 * state, clicks, `disabled` and `required`; one own key handler covers the six
 * keys of the contract, which the primitive does not provide. The scale is its
 * own field (the `RadioGroup` contract): it renders its label and binds its
 * own help and error, help before error. `readOnly` renders a non-focusable
 * meter whose partial bean is a geometric cut.
 */
export function BeanScale(props: BeanScaleProps): ReactNode {
  const {
    label,
    value,
    valueText,
    disabled,
    required,
    help,
    error,
    size = "responsive",
  } = props;
  const labelId = useId();
  const helpId = useId();
  const errorId = useId();
  const beanRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // The `RadioGroup` contract: an empty string renders and wires nothing.
  const hasHelp = help != null && help !== "";
  const hasError = error != null && error !== "";
  const describedBy = [
    hasHelp ? helpId : undefined,
    hasError ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const sizeClasses = SIZE_CLASSES[size];

  const labelElement = (
    <span id={labelId} className="type-label mb-2 block">
      {label}
    </span>
  );

  const messages = (
    <>
      {hasHelp && (
        <p id={helpId} className="type-meta mt-1">
          {help}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="type-error mt-1">
          {error}
        </p>
      )}
    </>
  );

  if (props.readOnly) {
    const score = value ?? 0;
    const whole = Math.floor(score);
    // One decimal: the fraction in tenths keeps the cut exact (6.4 → 60%).
    const tenths = Math.round(score * 10) % 10;
    return (
      <div>
        {labelElement}
        <div className={ROW_CLASSES}>
          <div
            role="meter"
            aria-valuemin={0}
            aria-valuemax={9}
            aria-valuenow={score}
            aria-valuetext={props.valueLabel}
            aria-labelledby={labelId}
            aria-describedby={describedBy || undefined}
            className={BEANS_CLASSES}
          >
            {SCORES.map((bean) => (
              <span
                key={bean}
                data-slot="bean"
                className={`relative shrink-0 ${sizeClasses}`}
              >
                <BeanMark variant={bean <= whole ? "on" : "off"} />
                {bean === whole + 1 && tenths > 0 && (
                  <span
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 ${100 - tenths * 10}% 0 0)` }}
                  >
                    <BeanMark variant="on" />
                  </span>
                )}
              </span>
            ))}
          </div>
          <span className={VALUE_TEXT_CLASSES}>{valueText}</span>
        </div>
        {messages}
      </div>
    );
  }

  const { onChange } = props;
  // One tab stop: the checked bean, or bean 1 when nothing is chosen (D3).
  const tabStop = value ?? 1;

  // Capture phase, so the handler acts before the primitive's own arrow
  // handling and its focus-followed click, and stops both (design.md D3).
  function handleKeyDownCapture(event: KeyboardEvent<HTMLDivElement>): void {
    const target = scoreForKey(event.key, value);
    if (target === null || disabled) return;
    event.preventDefault();
    event.stopPropagation();
    if (target !== value) onChange(target);
    beanRefs.current[target - 1]?.focus();
  }

  return (
    <div>
      {labelElement}
      <div className={ROW_CLASSES}>
        <RadioGroupPrimitive.Root
          value={value === null ? "" : String(value)}
          onValueChange={(next) => onChange(Number(next))}
          disabled={disabled}
          required={required}
          orientation="horizontal"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError ? "true" : undefined}
          onKeyDownCapture={handleKeyDownCapture}
          className={BEANS_CLASSES}
        >
          {SCORES.map((bean) => (
            <RadioGroupPrimitive.Item
              key={bean}
              ref={(node) => {
                beanRefs.current[bean - 1] = node;
              }}
              value={String(bean)}
              aria-label={String(bean)}
              tabIndex={!disabled && bean === tabStop ? 0 : -1}
              className={`${BEAN_CLASSES} ${sizeClasses}`}
            >
              <BeanMark
                variant={value !== null && bean <= value ? "on" : "off"}
              />
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroupPrimitive.Root>
        <span className={VALUE_TEXT_CLASSES}>{valueText}</span>
      </div>
      {messages}
    </div>
  );
}
