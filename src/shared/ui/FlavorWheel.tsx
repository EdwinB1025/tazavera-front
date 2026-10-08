"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { layoutWheel } from "./flavor-wheel-geometry";
import { FlavorWheelChart } from "./FlavorWheelChart";
import { FlavorWheelNoteList } from "./FlavorWheelNoteList";
import { FlavorWheelPanel } from "./FlavorWheelPanel";
import {
  arrangeRoots,
  descendantIds,
  findNode,
  visibleRows,
} from "./flavor-wheel-tree";

// ─── UI-specific types (declared before the component) ───
// The wheel takes resolved, localized notes as props: no generated API type is
// involved and there is no `locale` (design.md D1).

export type FlavorWheelNode = {
  id: string; // taxonomy ulid
  name: string; // localized name
  description: string | null; // localized description
  color: string; // #RRGGBB data color
  level: 0 | 1 | 2; // from the offering node's own level
  count: number; // evaluators who identified the note
  countLabel: string; // host-composed accessible text
  group?: string; // the root's group id (add-offering-catalog D19); roots only
  children: FlavorWheelNode[];
};

/** A group of roots set apart on the wheel, in wheel order (D19). */
export type FlavorWheelGroup = { id: string; name: string };

export type FlavorWheelTexts = {
  label: string;
  hint: string;
  emptyMessage: string;
  notesToggle: string; // the note list's expand control (review round 1)
  groupsLabel?: string; // the general group legend's accessible name (D19)
};

export type FlavorWheelProps = {
  nodes: FlavorWheelNode[];
  total: number;
  texts: FlavorWheelTexts;
  /** Optional groups of roots; with two or more holding roots they are set apart (D19). */
  groups?: FlavorWheelGroup[];
};

// ─── Treatment classes (design.md D8; design-summary §6) ───

const LAYOUT_CLASSES =
  "flex flex-col gap-6 @2xl:grid @2xl:grid-cols-[minmax(0,32rem)_minmax(16rem,1fr)] @2xl:grid-rows-[auto_1fr] @2xl:gap-x-8 @2xl:gap-y-6";
const WHEEL_CLASSES =
  "mx-auto aspect-square w-full max-w-128 @2xl:row-span-2 @2xl:mx-0 @2xl:self-start";
// With the general group legend, the side column grows one row (D19).
const GROUPED_LAYOUT_CLASSES =
  "flex flex-col gap-6 @2xl:grid @2xl:grid-cols-[minmax(0,32rem)_minmax(16rem,1fr)] @2xl:grid-rows-[auto_auto_1fr] @2xl:gap-x-8 @2xl:gap-y-6";
const GROUPED_WHEEL_CLASSES =
  "mx-auto aspect-square w-full max-w-128 @2xl:row-span-3 @2xl:mx-0 @2xl:self-start";
const GROUP_LEGEND_CLASSES = "flex flex-wrap gap-x-4 gap-y-1";

/**
 * Interactive flavor wheel (the `feedback` spec: "Flavor wheel", "Flavor wheel
 * note list"). An in-house SVG sunburst of the notes, a fixed description
 * panel and a flat tree of note rows, which is the wheel's accessible
 * equivalent: the SVG is `aria-hidden` and its segments are pointer targets
 * only (design.md D6–D7).
 */
export function FlavorWheel({
  nodes: givenNodes,
  total,
  texts,
  groups,
}: FlavorWheelProps): ReactNode {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const idPrefix = useId();
  const rowElements = useRef(new Map<string, HTMLLIElement>());

  if (total === 0 || givenNodes.length === 0) {
    return <p className="type-body">{texts.emptyMessage}</p>;
  }

  const { nodes, grouped, groupOrder, legendGroups } = arrangeRoots(
    givenNodes,
    groups,
  );
  const { segments, groupArcs } = layoutWheel(
    nodes,
    expanded,
    grouped ? groupOrder : undefined,
  );
  const groupName = (id: string): string =>
    groups?.find((group) => group.id === id)?.name ?? "";
  const rows = visibleRows(nodes, expanded);
  const active = activeId === null ? null : findNode(nodes, activeId);
  const legend = (node: FlavorWheelNode): string => `${node.count}/${total}`;

  /** Expand or collapse a parent; collapsing also collapses its descendants. */
  const setExpansion = (node: FlavorWheelNode, open: boolean): void => {
    setExpanded((current) => {
      const next = new Set(current);
      if (open) {
        next.add(node.id);
      } else {
        next.delete(node.id);
        for (const id of descendantIds(node)) next.delete(id);
      }
      return next;
    });
  };

  const toggle = (node: FlavorWheelNode): void => {
    if (node.children.length > 0) setExpansion(node, !expanded.has(node.id));
  };

  /** Activate a note and, when it has children, toggle its expansion. */
  const activate = (node: FlavorWheelNode): void => {
    setActiveId(node.id);
    toggle(node);
  };

  const focusRow = (id: string): void => {
    rowElements.current.get(id)?.focus();
  };

  /** APG Tree View keys over the visible rows, plus Escape (design.md D6). */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    index: number,
  ): void => {
    const { node, parentId } = rows[index];
    const isExpanded = expanded.has(node.id);
    switch (event.key) {
      case "ArrowDown":
        if (index < rows.length - 1) focusRow(rows[index + 1].node.id);
        break;
      case "ArrowUp":
        if (index > 0) focusRow(rows[index - 1].node.id);
        break;
      case "ArrowRight":
        if (node.children.length === 0) break;
        if (isExpanded) focusRow(node.children[0].id);
        else setExpansion(node, true);
        break;
      case "ArrowLeft":
        if (node.children.length > 0 && isExpanded) setExpansion(node, false);
        else if (parentId !== null) focusRow(parentId);
        break;
      case "Home":
        focusRow(rows[0].node.id);
        break;
      case "End":
        focusRow(rows[rows.length - 1].node.id);
        break;
      case "Enter":
      case " ":
        toggle(node);
        break;
      case "Escape": {
        const root = nodes.find(
          (candidate) =>
            candidate.id === node.id ||
            descendantIds(candidate).includes(node.id),
        );
        setExpanded(new Set());
        if (root) focusRow(root.id);
        break;
      }
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <figure className="@container">
      <figcaption className="sr-only">{texts.label}</figcaption>
      <div className={grouped ? GROUPED_LAYOUT_CLASSES : LAYOUT_CLASSES}>
        <div className={grouped ? GROUPED_WHEEL_CLASSES : WHEEL_CLASSES}>
          <FlavorWheelChart
            segments={segments}
            groupArcs={groupArcs}
            total={total}
            activeId={activeId}
            idPrefix={idPrefix}
            legend={legend}
            groupName={groupName}
            onHover={(node) => setActiveId(node.id)}
            onActivate={activate}
          />
        </div>

        {grouped ? (
          <ul aria-label={texts.groupsLabel} className={GROUP_LEGEND_CLASSES}>
            {legendGroups.map((group) => (
              <li key={group.id} className="type-meta">
                {group.name}
              </li>
            ))}
          </ul>
        ) : null}

        <FlavorWheelPanel active={active} legend={legend} hint={texts.hint} />

        <div className="flex flex-col">
          <FlavorWheelNoteList
            rows={rows}
            expanded={expanded}
            activeId={activeId}
            label={texts.label}
            notesToggle={texts.notesToggle}
            legend={legend}
            registerRow={(id, element) => {
              if (element) rowElements.current.set(id, element);
              else rowElements.current.delete(id);
            }}
            onHover={(node) => setActiveId(node.id)}
            onActivate={activate}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </figure>
  );
}
