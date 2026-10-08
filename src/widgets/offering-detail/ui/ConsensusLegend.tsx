import type { ReactNode } from "react";
import type { ChipRow } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** One line of a consensus legend: a note's name and its count. */
export type ConsensusLegendEntry = { label: string; count: number };

export type ConsensusLegendProps = {
  rows: ChipRow[];
  counts: Map<string, number>;
  /** The offering's evaluation count (0 when absent). */
  total: number;
};

// ─── Fixed pieces (no interface text) ───

// The consensus legend: one meta line per identified note, in a fixed 14rem
// column from `md`, the same in every block (design.md D13).
const LEGEND_CLASSES = [
  "flex",
  "flex-col",
  "gap-1",
  "md:w-56",
  "md:shrink-0",
  "break-words",
].join(" ");

/**
 * The consensus legend of a selection (design.md D13): one meta line per
 * shown note, in card order; nothing when no shown note was identified.
 */
export function ConsensusLegend({
  rows,
  counts,
  total,
}: ConsensusLegendProps): ReactNode {
  const legend: ConsensusLegendEntry[] = rows
    .flatMap((row) => row.options)
    .filter((option) => counts.has(option.value))
    .map((option) => ({
      label: option.label,
      count: counts.get(option.value) ?? 0,
    }));
  if (legend.length === 0) {
    return null;
  }
  return (
    <ul className={LEGEND_CLASSES}>
      {legend.map((entry) => {
        const line = `${entry.label} ${entry.count}/${total}`;
        return (
          <li key={entry.label} className="type-meta">
            {line}
          </li>
        );
      })}
    </ul>
  );
}
