import type { ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───
// The consumer supplies both parts; no generated API type is involved.

export type LabelValueRowProps = {
  label: ReactNode;
  value: ReactNode;
};

// ─── Settled classes (design.md D5) ───
// The term at the start and the value at the end, at least 1rem apart; the
// value wraps below the term when the row is too narrow. No margin, padding,
// border or radius: the consumer's grid spaces the rows.
const ROW_CLASSES = [
  "flex",
  "flex-wrap",
  "items-baseline",
  "justify-between",
  "gap-4",
].join(" ");

/**
 * Tazavera label/value row (the `content-structure` spec: "Label/value row").
 * One `<div>` wrapping a `<dt>` and a `<dd>`, so the consumer wraps its rows
 * in one `<dl>` and keeps description semantics. The row contributes no text
 * or data of its own.
 */
export function LabelValueRow({ label, value }: LabelValueRowProps): ReactNode {
  return (
    <div className={ROW_CLASSES}>
      <dt className="type-label">{label}</dt>
      <dd className="type-body">{value}</dd>
    </div>
  );
}
