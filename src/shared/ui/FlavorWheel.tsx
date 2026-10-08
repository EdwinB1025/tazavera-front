"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { layoutWheel } from "./flavor-wheel-geometry";
import { FlavorWheelChart } from "./FlavorWheelChart";
import { handleTreeKey } from "./flavor-wheel-keys";
import { FlavorWheelNoteList } from "./FlavorWheelNoteList";
import { FlavorWheelPanel } from "./FlavorWheelPanel";
import { arrangeRoots, findNode, visibleRows } from "./flavor-wheel-tree";
import { useFlavorWheelState } from "./use-flavor-wheel-state";

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

// ─── Treatment classes (stack-flavor-wheel-layout D1) ───
// Stacked on every width: the wheel, the group legend when groups are set
// apart, the description panel, then the note list.

const LAYOUT_CLASSES = "flex flex-col gap-6";
const WHEEL_CLASSES = "mx-auto aspect-square w-full max-w-128";
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
  const wheel = useFlavorWheelState();
  const { expanded, activeId, idPrefix, setActiveId, activate } = wheel;

  if (total === 0 || givenNodes.length === 0) {
    return <p className="type-body">{texts.emptyMessage}</p>;
  }

  const { nodes, grouped, groupOrder, legendGroups } = arrangeRoots(
    givenNodes,
    groups,
  );
  // The wheel draws every level; expansion only changes the note list (D2).
  const { segments, groupArcs } = layoutWheel(
    nodes,
    grouped ? groupOrder : undefined,
  );
  const groupName = (id: string): string =>
    groups?.find((group) => group.id === id)?.name ?? "";
  const rows = visibleRows(nodes, expanded);
  const active = activeId === null ? null : findNode(nodes, activeId);
  const legend = (node: FlavorWheelNode): string => `${node.count}/${total}`;
  const hover = (node: FlavorWheelNode): void => setActiveId(node.id);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    index: number,
  ): void => {
    if (handleTreeKey(event.key, { ...wheel, rows, index, nodes })) {
      event.preventDefault();
    }
  };

  return (
    <figure>
      <figcaption className="sr-only">{texts.label}</figcaption>
      <div className={LAYOUT_CLASSES}>
        <div className={WHEEL_CLASSES}>
          <FlavorWheelChart
            segments={segments}
            groupArcs={groupArcs}
            total={total}
            activeId={activeId}
            idPrefix={idPrefix}
            legend={legend}
            groupName={groupName}
            onHover={hover}
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
            registerRow={wheel.registerRow}
            onHover={hover}
            onActivate={activate}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </figure>
  );
}
