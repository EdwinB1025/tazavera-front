"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { BeanMark } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the components) ───

type BeansProps = {
  value: number | null;
  sizeClasses: string;
  labelId: string;
  describedBy: string | undefined;
};

export type BeanMeterProps = BeansProps & { valueLabel: string };

export type BeanRadiosProps = BeansProps & {
  onChange: (value: number) => void;
  disabled?: boolean;
  required?: boolean;
  invalid: boolean;
};

// ─── Treatment classes (design.md D3) ───
// Each bean is a square without padding or border, sized by `size`; `sm` only
// reaches the read-only display (D2). Hover changes only the cursor; disabled
// is 50% opacity with a not-allowed cursor (the `add-base-control` rule).

const BEAN_CLASSES = [
  "shrink-0",
  "rounded-full",
  "cursor-pointer",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

const BEANS_CLASSES = "flex flex-nowrap gap-1";

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

/** The read-only beans: a non-focusable meter whose partial bean is a cut. */
export function BeanMeter({
  value,
  valueLabel,
  sizeClasses,
  labelId,
  describedBy,
}: BeanMeterProps): ReactNode {
  const score = value ?? 0;
  const whole = Math.floor(score);
  // One decimal: the fraction in tenths keeps the cut exact (6.4 → 60%).
  const tenths = Math.round(score * 10) % 10;
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={9}
      aria-valuenow={score}
      aria-valuetext={valueLabel}
      aria-labelledby={labelId}
      aria-describedby={describedBy}
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
  );
}

/**
 * The interactive beans: the Radix RadioGroup primitive supplies the roles,
 * the checked state, clicks, `disabled` and `required`; one own key handler
 * covers the six keys of the contract, which the primitive does not provide.
 */
export function BeanRadios({
  value,
  onChange,
  disabled,
  required,
  invalid,
  sizeClasses,
  labelId,
  describedBy,
}: BeanRadiosProps): ReactNode {
  const beanRefs = useRef<(HTMLButtonElement | null)[]>([]);
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
    <RadioGroupPrimitive.Root
      value={value === null ? "" : String(value)}
      onValueChange={(next) => onChange(Number(next))}
      disabled={disabled}
      required={required}
      orientation="horizontal"
      tabIndex={-1}
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-invalid={invalid ? "true" : undefined}
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
  );
}
