"use client";

import { Fragment, useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/utils";
import {
  VIEWBOX,
  arcPath,
  fitLabel,
  labelFontSize,
  labelPath,
  labelRadius,
  layoutWheel,
  type WheelSegment,
} from "./flavor-wheel-geometry";
import { taxonomyColorRule } from "./taxonomy-color";

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
  children: FlavorWheelNode[];
};

export type FlavorWheelTexts = {
  label: string;
  hint: string;
  emptyMessage: string;
  notesToggle: string; // the note list's expand control (review round 1)
};

export type FlavorWheelProps = {
  nodes: FlavorWheelNode[];
  total: number;
  texts: FlavorWheelTexts;
};

// ─── Treatment classes (design.md D8; design-summary §6) ───

const LAYOUT_CLASSES =
  "flex flex-col gap-6 @2xl:grid @2xl:grid-cols-[minmax(0,32rem)_minmax(16rem,1fr)] @2xl:grid-rows-[auto_auto_1fr] @2xl:gap-x-8 @2xl:gap-y-6";
const WHEEL_CLASSES =
  "mx-auto aspect-square w-full max-w-128 @2xl:row-span-3 @2xl:mx-0 @2xl:self-start";
const PANEL_CLASSES =
  "flex min-h-24 flex-col gap-2 rounded-field border border-border-subtle p-4";
const ROW_CLASSES =
  "flex min-h-10 cursor-pointer items-center gap-2 rounded-field px-2 py-1 text-text-primary hover:bg-surface-section focus-visible:focus-ring";
const TOGGLE_CLASSES =
  "type-body flex min-h-10 cursor-pointer items-center gap-2 self-start rounded-field px-2 py-1 text-text-primary hover:bg-surface-section focus-visible:focus-ring @2xl:justify-self-start";
const ROW_INDENT = ["", "ms-6", "ms-12"];
const SWATCH_CLASSES = "size-3 shrink-0 rounded-check";

/** A visible note row in wheel order (depth-first), with its tree position. */
type Row = {
  node: FlavorWheelNode;
  depth: number;
  setSize: number;
  position: number;
  parentId: string | null;
};

function visibleRows(
  nodes: FlavorWheelNode[],
  expanded: ReadonlySet<string>,
  depth = 0,
  parentId: string | null = null,
): Row[] {
  return nodes.flatMap((node, index) => [
    { node, depth, setSize: nodes.length, position: index + 1, parentId },
    ...(expanded.has(node.id)
      ? visibleRows(node.children, expanded, depth + 1, node.id)
      : []),
  ]);
}

function findNode(
  nodes: FlavorWheelNode[],
  id: string,
): FlavorWheelNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

function descendantIds(node: FlavorWheelNode): string[] {
  return node.children.flatMap((child) => [child.id, ...descendantIds(child)]);
}

function descriptionId(id: string): string {
  return `flavor-wheel-desc-${id}`;
}

/** The swatch's data colour at its depth opacity (design.md D4). */
function swatchStyle(node: FlavorWheelNode): CSSProperties {
  return {
    backgroundColor: node.color,
    opacity: taxonomyColorRule(node.color, node.level).opacity,
  };
}

/**
 * A segment's arched label (design.md D5): one `<text>` per line, set on a
 * `<textPath>` along an unfilled arc near the segment's outer edge. Nothing
 * is drawn at rest when not even the name fits.
 */
function SegmentLabel({
  segment,
  legend,
  idPrefix,
}: {
  segment: WheelSegment<FlavorWheelNode>;
  legend: string;
  idPrefix: string;
}): ReactNode {
  const fit = fitLabel(segment, segment.node.name, legend);
  if (fit === "active") return null;
  const size = labelFontSize(segment.ring);
  const lines =
    fit === "both" ? [segment.node.name, legend] : [segment.node.name];
  // Nested in its own group so the segment's direct `<path>` stays its arc.
  return (
    <g>
      {lines.map((line, index) => {
        const id = `${idPrefix}-label-${segment.node.id}-${index}`;
        return (
          <Fragment key={index}>
            <path
              id={id}
              d={labelPath(
                labelRadius(segment, index as 0 | 1),
                segment.start,
                segment.end,
              )}
              fill="none"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size}
              fill="currentColor"
              className="pointer-events-none select-none"
            >
              <textPath href={`#${id}`} startOffset="50%">
                {line}
              </textPath>
            </text>
          </Fragment>
        );
      })}
    </g>
  );
}

/**
 * The name of an active note whose label cannot fit even arched (design.md
 * D5): the name alone on a half-circle centred on the segment's mid-angle,
 * in the primary text colour over a halo of the card colour, since it
 * overflows onto the neighbouring segments. Drawn last; nothing for a label
 * that fits.
 */
function ActiveName({
  segment,
  legend,
  idPrefix,
}: {
  segment: WheelSegment<FlavorWheelNode>;
  legend: string;
  idPrefix: string;
}): ReactNode {
  if (fitLabel(segment, segment.node.name, legend) !== "active") return null;
  const id = `${idPrefix}-active-name`;
  const mid = (segment.start + segment.end) / 2;
  return (
    <>
      <path
        id={id}
        d={labelPath(labelRadius(segment, 0), mid - 90, mid + 90)}
        fill="none"
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={labelFontSize(segment.ring)}
        strokeWidth={4}
        paintOrder="stroke"
        strokeLinejoin="round"
        className="pointer-events-none select-none fill-text-primary stroke-surface-card"
      >
        <textPath href={`#${id}`} startOffset="50%">
          {segment.node.name}
        </textPath>
      </text>
    </>
  );
}

/**
 * Interactive flavor wheel (the `feedback` spec: "Flavor wheel", "Flavor wheel
 * note list"). An in-house SVG sunburst of the notes, a fixed description
 * panel and a flat tree of note rows, which is the wheel's accessible
 * equivalent: the SVG is `aria-hidden` and its segments are pointer targets
 * only (design.md D6–D7).
 */
export function FlavorWheel({
  nodes,
  total,
  texts,
}: FlavorWheelProps): ReactNode {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const listId = useId();
  const idPrefix = useId();
  const rowElements = useRef(new Map<string, HTMLLIElement>());

  if (total === 0 || nodes.length === 0) {
    return <p className="type-body">{texts.emptyMessage}</p>;
  }

  const { segments } = layoutWheel(nodes, expanded);
  const rows = visibleRows(nodes, expanded);
  const active = activeId === null ? null : findNode(nodes, activeId);
  const activeSegment = segments.find((s) => s.node.id === activeId);
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

  // The list's single tab stop: the active row, or the first row (D6).
  const tabStop = rows.some((r) => r.node.id === activeId)
    ? activeId
    : rows[0].node.id;

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
      <div className={LAYOUT_CLASSES}>
        <div className={WHEEL_CLASSES}>
          <svg
            viewBox={VIEWBOX}
            aria-hidden="true"
            focusable="false"
            className="block size-full"
          >
            {segments.map((segment) => {
              const { node } = segment;
              const rule = taxonomyColorRule(node.color, node.level);
              return (
                <g
                  key={node.id}
                  data-note={node.id}
                  data-taxonomy=""
                  className="cursor-pointer"
                  style={
                    {
                      "--taxonomy-label": rule.label,
                      "--taxonomy-label-dark": rule.labelDark,
                    } as CSSProperties
                  }
                  onPointerEnter={() => setActiveId(node.id)}
                  onClick={() => activate(node)}
                >
                  <path
                    d={arcPath(
                      segment.inner,
                      segment.outer,
                      segment.start,
                      segment.end,
                    )}
                    fill={node.color}
                    fillOpacity={rule.opacity}
                    className="stroke-surface-card"
                    strokeWidth={4}
                  />
                  <SegmentLabel
                    segment={segment}
                    legend={legend(node)}
                    idPrefix={idPrefix}
                  />
                </g>
              );
            })}
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={28}
              className="fill-text-primary font-serif font-bold"
            >
              {total}
            </text>
            {activeSegment ? (
              <path
                d={arcPath(
                  activeSegment.inner,
                  activeSegment.outer,
                  activeSegment.start,
                  activeSegment.end,
                )}
                className="pointer-events-none stroke-text-primary"
                fill="none"
                strokeWidth={3}
              />
            ) : null}
            {activeSegment ? (
              <ActiveName
                segment={activeSegment}
                legend={legend(activeSegment.node)}
                idPrefix={idPrefix}
              />
            ) : null}
          </svg>
        </div>

        <div data-slot="flavor-wheel-panel" className={PANEL_CLASSES}>
          {active ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={SWATCH_CLASSES}
                  style={swatchStyle(active)}
                  aria-hidden="true"
                />
                <span className="type-subheading">{active.name}</span>
                <span className="type-body ms-auto tabular-nums">
                  {legend(active)}
                </span>
              </div>
              {active.description !== null ? (
                <p id={descriptionId(active.id)} className="type-body">
                  {active.description}
                </p>
              ) : null}
            </>
          ) : (
            <p className="type-body">{texts.hint}</p>
          )}
        </div>

        <button
          type="button"
          aria-expanded={listOpen}
          aria-controls={listId}
          className={TOGGLE_CLASSES}
          onClick={() => setListOpen((open) => !open)}
        >
          {listOpen ? (
            <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          )}
          {texts.notesToggle}
        </button>

        <ul
          id={listId}
          hidden={!listOpen}
          role="tree"
          aria-label={texts.label}
          className="flex flex-col gap-1"
        >
          {rows.map(({ node, depth, setSize, position }, index) => {
            const isParent = node.children.length > 0;
            const isExpanded = expanded.has(node.id);
            const isActive = node.id === activeId;
            const Chevron = isExpanded ? ChevronDown : ChevronRight;
            return (
              <li
                key={node.id}
                role="treeitem"
                aria-label={`${node.name}, ${node.countLabel}`}
                aria-level={depth + 1}
                aria-setsize={setSize}
                aria-posinset={position}
                aria-expanded={isParent ? isExpanded : undefined}
                aria-describedby={
                  isActive && node.description !== null
                    ? descriptionId(node.id)
                    : undefined
                }
                tabIndex={node.id === tabStop ? 0 : -1}
                ref={(element) => {
                  if (element) rowElements.current.set(node.id, element);
                  else rowElements.current.delete(node.id);
                }}
                className={cn(
                  ROW_CLASSES,
                  isActive && "bg-surface-section",
                  ROW_INDENT[depth],
                )}
                onPointerEnter={() => setActiveId(node.id)}
                onFocus={() => setActiveId(node.id)}
                onClick={() => activate(node)}
                onKeyDown={(event) => handleKeyDown(event, index)}
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
                <span className="type-body min-w-0 flex-1 break-words">
                  {node.name}
                </span>
                <span className="type-body shrink-0 tabular-nums">
                  {legend(node)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}
