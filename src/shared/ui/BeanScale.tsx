"use client";

import type { ReactNode } from "react";

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
