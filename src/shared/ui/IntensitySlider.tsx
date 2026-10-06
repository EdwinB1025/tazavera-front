"use client";

import type { ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used or redefined here: this change consumes no API
// operation and every text is a prop supplied by the consuming capability
// (design.md D2). The readOnly contract is enforced by a discriminated union
// rather than a runtime assertion: `onChange` is required unless `readOnly`.
// Tests pin this with `@ts-expect-error` cases and `npx tsc --noEmit`, the
// `Textarea` precedent.

export type IntensitySliderProps = {
  label: ReactNode;
  value: number | null; // 0..15; null renders as 0 (Open 4 a)
  valueText: string;
  valueLabel: string;
  scaleLabels: [string, string, string];
  disabled?: boolean;
  help?: ReactNode;
  error?: ReactNode;
} & (
  | { readOnly: true; onChange?: never }
  | { readOnly?: false; onChange: (value: number) => void }
);
