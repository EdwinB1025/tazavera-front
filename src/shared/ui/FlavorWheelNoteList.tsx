"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "@/shared/ui/icons";
import { Collapsible, CollapsibleBody, CollapsibleHeader } from "./Collapsible";
import { cn } from "@/shared/lib/utils";
import {
  SWATCH_CLASSES,
  descriptionId,
  swatchStyle,
  type Row,
} from "./flavor-wheel-tree";
import type { FlavorWheelNode } from "./flavor-wheel-types";

export type FlavorWheelNoteListProps = {
  rows: Row[];
  expanded: ReadonlySet<string>;
  activeId: string | null;
  /** The tree's accessible name (texts.label). */
  label: string;
  notesToggle: string;
  legend: (node: FlavorWheelNode) => string;
  registerRow: (id: string, element: HTMLLIElement | null) => void;
  /** Pointer enter or focus on a row: the note becomes active. */
  onHover: (node: FlavorWheelNode) => void;
  onActivate: (node: FlavorWheelNode) => void;
  onKeyDown: (event: KeyboardEvent<HTMLLIElement>, index: number) => void;
};

type NoteRowProps = Omit<FlavorWheelNoteListProps, "rows" | "label" | "notesToggle"> & {
  row: Row;
  index: number;
  tabStop: string | null;
};

const ROW_CLASSES =
  "flex min-h-10 cursor-pointer items-center gap-2 rounded-field px-2 py-1 text-text-primary hover:bg-surface-section focus-visible:focus-ring";
const ROW_INDENT = ["", "ms-6", "ms-12"];

/** One tree row: chevron, swatch, name and legend (design.md D6–D7). */
function NoteRow({
  row: { node, depth, setSize, position },
  index,
  tabStop,
  expanded,
  activeId,
  legend,
  registerRow,
  onHover,
  onActivate,
  onKeyDown,
}: NoteRowProps): ReactNode {
  const isParent = node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isActive = node.id === activeId;
  const Chevron = isExpanded ? ChevronDown : ChevronRight;
  return (
    <li
      role="treeitem"
      aria-label={`${node.name}, ${node.countLabel}`}
      aria-level={depth + 1}
      aria-setsize={setSize}
      aria-posinset={position}
      aria-expanded={isParent ? isExpanded : undefined}
      // The active note's row is the selected one (label-landmarks-and-headings D4).
      aria-selected={isActive}
      aria-describedby={
        isActive && node.description !== null
          ? descriptionId(node.id)
          : undefined
      }
      tabIndex={node.id === tabStop ? 0 : -1}
      ref={(element) => registerRow(node.id, element)}
      className={cn(
        ROW_CLASSES,
        isActive && "bg-surface-section",
        ROW_INDENT[depth],
      )}
      onPointerEnter={() => onHover(node)}
      onFocus={() => onHover(node)}
      onClick={() => onActivate(node)}
      onKeyDown={(event) => onKeyDown(event, index)}
    >
      {isParent ? (
        <Chevron className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <span className="size-4 shrink-0" aria-hidden="true" />
      )}
      <span
        className={SWATCH_CLASSES}
        style={swatchStyle(node)}
        aria-hidden="true"
      />
      <span className="type-body min-w-0 flex-1 break-words">{node.name}</span>
      <span className="type-body shrink-0 tabular-nums">{legend(node)}</span>
    </li>
  );
}

/**
 * The note list behind its expand control: a flat `role="tree"` of the
 * visible notes, the wheel's accessible equivalent (design.md D6–D7).
 */
export function FlavorWheelNoteList({
  rows,
  label,
  notesToggle,
  ...rowProps
}: FlavorWheelNoteListProps): ReactNode {
  // The list's single tab stop: the active row, or the first row (D6).
  const tabStop = rows.some((r) => r.node.id === rowProps.activeId)
    ? rowProps.activeId
    : rows[0].node.id;
  return (
    <Collapsible>
      <CollapsibleHeader>{notesToggle}</CollapsibleHeader>
      <CollapsibleBody>
        <ul role="tree" aria-label={label} className="flex flex-col gap-1 pt-2">
          {rows.map((row, index) => (
            <NoteRow
              key={row.node.id}
              row={row}
              index={index}
              tabStop={tabStop}
              {...rowProps}
            />
          ))}
        </ul>
      </CollapsibleBody>
    </Collapsible>
  );
}
