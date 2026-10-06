"use client";

import type { ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used or redefined here: this change consumes no API
// operation and every text is a prop supplied by the consuming capability
// (design.md D2). The rows arrive already built from the consuming capability;
// `value` and `onValueChange` carry taxonomy `ulid`s. The readOnly contract is
// enforced by a discriminated union rather than a runtime assertion:
// `onValueChange` is required unless `readOnly`. Tests pin this with
// `@ts-expect-error` cases and `npx tsc --noEmit`, the `Textarea` precedent.

export type ChipOption = { value: string; label: string; color: string; level: 0 | 1 };
export type ChipRow = { id: string; title?: ReactNode; options: ChipOption[] };

export type DescriptorChipGroupProps = {
  legend: ReactNode;
  rows: ChipRow[];
  value: string[];
  disabled?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  emptyText?: ReactNode; // readOnly only
} & (
  | { readOnly: true; onValueChange?: never }
  | { readOnly?: false; onValueChange: (value: string[]) => void }
);
