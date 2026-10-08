"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  VIEWBOX,
  arcPath,
  labelPath,
  type GroupArc,
  type WheelSegment,
} from "./flavor-wheel-geometry";
import { ActiveName, SegmentLabel } from "./FlavorWheelLabels";
import { taxonomyColorRule } from "./taxonomy-color";
import type { FlavorWheelNode } from "./FlavorWheel";

export type FlavorWheelChartProps = {
  segments: WheelSegment<FlavorWheelNode>[];
  groupArcs: GroupArc[];
  total: number;
  activeId: string | null;
  idPrefix: string;
  legend: (node: FlavorWheelNode) => string;
  groupName: (id: string) => string;
  /** Pointer enter on a segment: the note becomes active. */
  onHover: (node: FlavorWheelNode) => void;
  /** Click on a segment: activate, toggling a parent's expansion. */
  onActivate: (node: FlavorWheelNode) => void;
};

type SegmentProps = {
  segment: WheelSegment<FlavorWheelNode>;
  legend: string;
  idPrefix: string;
  onHover: (node: FlavorWheelNode) => void;
  onActivate: (node: FlavorWheelNode) => void;
};

type GroupArcLegendProps = { arc: GroupArc; name: string; idPrefix: string };

// The inner group legend inside the centre hole (D19, chosen values): the
// group's arc at radius 74, 2 units wide, and its name at radius 62.
const GROUP_ARC_RADIUS = 74;
const GROUP_NAME_RADIUS = 62;
const GROUP_NAME_FONT_SIZE = 11;

/** One note's segment: its arc in the taxonomy colour and its arched label. */
function Segment({
  segment,
  legend,
  idPrefix,
  onHover,
  onActivate,
}: SegmentProps): ReactNode {
  const { node } = segment;
  const rule = taxonomyColorRule(node.color, node.level);
  return (
    <g
      data-note={node.id}
      data-taxonomy=""
      className="cursor-pointer"
      style={
        {
          "--taxonomy-label": rule.label,
          "--taxonomy-label-dark": rule.labelDark,
        } as CSSProperties
      }
      onPointerEnter={() => onHover(node)}
      onClick={() => onActivate(node)}
    >
      <path
        d={arcPath(segment.inner, segment.outer, segment.start, segment.end)}
        fill={node.color}
        fillOpacity={rule.opacity}
        className="stroke-surface-card"
        strokeWidth={4}
      />
      <SegmentLabel segment={segment} legend={legend} idPrefix={idPrefix} />
    </g>
  );
}

/** A group's arc and name inside the centre hole (D19). */
function GroupArcLegend({ arc, name, idPrefix }: GroupArcLegendProps): ReactNode {
  const mid = (arc.start + arc.end) / 2;
  const nameId = `${idPrefix}-group-${arc.id}`;
  return (
    <g data-group-legend={arc.id}>
      <path
        d={labelPath(GROUP_ARC_RADIUS, arc.start, arc.end)}
        fill="none"
        strokeWidth={2}
        className="stroke-text-secondary"
      />
      <path
        id={nameId}
        d={labelPath(GROUP_NAME_RADIUS, mid - 90, mid + 90)}
        fill="none"
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={GROUP_NAME_FONT_SIZE}
        className="pointer-events-none select-none fill-text-secondary"
      >
        <textPath href={`#${nameId}`} startOffset="50%">
          {name}
        </textPath>
      </text>
    </g>
  );
}

/**
 * The SVG sunburst (design.md D5–D7): the segments, the group arcs, the
 * centre total and the active note's outline and name. It is `aria-hidden`;
 * the note list is its accessible equivalent.
 */
export function FlavorWheelChart({
  segments,
  groupArcs,
  total,
  activeId,
  idPrefix,
  legend,
  groupName,
  onHover,
  onActivate,
}: FlavorWheelChartProps): ReactNode {
  const activeSegment = segments.find((s) => s.node.id === activeId);
  return (
    <svg
      viewBox={VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className="block size-full"
    >
      {segments.map((segment) => (
        <Segment
          key={segment.node.id}
          segment={segment}
          legend={legend(segment.node)}
          idPrefix={idPrefix}
          onHover={onHover}
          onActivate={onActivate}
        />
      ))}
      {groupArcs.map((arc) => (
        <GroupArcLegend
          key={arc.id}
          arc={arc}
          name={groupName(arc.id)}
          idPrefix={idPrefix}
        />
      ))}
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
  );
}
