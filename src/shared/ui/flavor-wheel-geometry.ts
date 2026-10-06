// ─── Flavor wheel geometry (design.md D5; design-summary §4.2) ───
// Pure functions with no React and no browser global, in SVG user units.
// Angles are degrees, 0 at 12 o'clock, growing clockwise.

/** The constant viewBox: outer radius 200 plus a 4-unit margin. */
export const VIEWBOX = "-204 -204 408 408";

const HOLE = 40;

/** Ring bounds by the deepest level `D` present in the whole tree. */
const RINGS_BY_DEPTH: Record<0 | 1 | 2, number[]> = {
  0: [40, 200],
  1: [40, 110, 200],
  2: [40, 100, 150, 200],
};

const LABEL_FONT_SIZE = [13, 12, 12];
const LINE_HEIGHT = 1.2;
const CHARACTER_WIDTH = 0.6;

/** The structural part of a note the geometry needs. */
export type WheelGeometryNode = {
  id: string;
  count: number;
  children: WheelGeometryNode[];
};

export type RingBounds = { inner: number; outer: number };

export type RingRadii = { hole: number; rings: RingBounds[] };

export type WheelSegment<T extends WheelGeometryNode = WheelGeometryNode> = {
  node: T;
  ring: number;
  inner: number;
  outer: number;
  start: number;
  end: number;
};

/** The arc a label is placed and fitted against. */
export type SegmentArc = Omit<WheelSegment, "node">;

export function ringRadii(depth: 0 | 1 | 2): RingRadii {
  const bounds = RINGS_BY_DEPTH[depth];
  return {
    hole: HOLE,
    rings: bounds
      .slice(0, -1)
      .map((inner, index) => ({ inner, outer: bounds[index + 1] })),
  };
}

function treeDepth(nodes: WheelGeometryNode[]): number {
  return nodes.reduce(
    (deepest, n) =>
      Math.max(deepest, n.children.length ? 1 + treeDepth(n.children) : 0),
    0,
  );
}

/**
 * The visible segments, depth-first in wheel order: each root spans
 * `360° × count / Σ root counts`, each child of an expanded parent spans the
 * parent's span `× count / Σ sibling counts`, filling it.
 */
export function layoutWheel<T extends WheelGeometryNode>(
  nodes: T[],
  expanded: ReadonlySet<string>,
): { radii: RingRadii; segments: WheelSegment<T>[] } {
  const radii = ringRadii(Math.min(treeDepth(nodes), 2) as 0 | 1 | 2);
  const segments: WheelSegment<T>[] = [];

  const place = (siblings: T[], ring: number, start: number, end: number) => {
    const total = siblings.reduce((sum, n) => sum + n.count, 0);
    let cursor = start;
    siblings.forEach((n, index) => {
      const next =
        index === siblings.length - 1
          ? end
          : cursor + ((end - start) * n.count) / total;
      segments.push({
        node: n,
        ring,
        ...radii.rings[ring],
        start: cursor,
        end: next,
      });
      if (expanded.has(n.id) && n.children.length && radii.rings[ring + 1]) {
        place(n.children as T[], ring + 1, cursor, next);
      }
      cursor = next;
    });
  };

  place(nodes, 0, 0, 360);
  return { radii, segments };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000 + 0;
}

function point(radius: number, angle: number): string {
  const radians = (angle * Math.PI) / 180;
  return `${round(radius * Math.sin(radians))} ${round(-radius * Math.cos(radians))}`;
}

/**
 * Path data of an annular segment. A full ring is drawn as two half-arcs on
 * each radius, because one 360° arc command does not render; its inner circle
 * runs counter-clockwise so the hole stays empty.
 */
export function arcPath(
  inner: number,
  outer: number,
  start: number,
  end: number,
): string {
  if (end - start >= 360) {
    const half = start + 180;
    return [
      `M ${point(outer, start)}`,
      `A ${outer} ${outer} 0 0 1 ${point(outer, half)}`,
      `A ${outer} ${outer} 0 0 1 ${point(outer, start)}`,
      "Z",
      `M ${point(inner, start)}`,
      `A ${inner} ${inner} 0 0 0 ${point(inner, half)}`,
      `A ${inner} ${inner} 0 0 0 ${point(inner, start)}`,
      "Z",
    ].join(" ");
  }
  const large = end - start > 180 ? 1 : 0;
  return [
    `M ${point(outer, start)}`,
    `A ${outer} ${outer} 0 ${large} 1 ${point(outer, end)}`,
    `L ${point(inner, end)}`,
    `A ${inner} ${inner} 0 ${large} 0 ${point(inner, start)}`,
    "Z",
  ].join(" ");
}

/** The label font size of a ring: 13 units in ring 0, 12 in rings 1–2. */
export function labelFontSize(ring: number): number {
  return LABEL_FONT_SIZE[ring];
}

/**
 * The radius a label line's glyphs are centred on: the name (line 0) half a
 * line inside the outer edge less 4 units, the legend (line 1) one line
 * further in.
 */
export function labelRadius(segment: SegmentArc, line: 0 | 1): number {
  const size = labelFontSize(segment.ring);
  return segment.outer - 4 - (0.5 + line) * LINE_HEIGHT * size;
}

/**
 * Path data of the arc a label line runs along. It runs clockwise from
 * `start` to `end`, and is reversed when the mid-angle lies strictly between
 * 90° and 270°, so the text reads upright in the lower half. A span of 360°
 * or more is two half-arcs in the same direction.
 */
export function labelPath(radius: number, start: number, end: number): string {
  const mid = (start + end) / 2;
  const reversed = mid > 90 && mid < 270;
  const [from, to] = reversed ? [end, start] : [start, end];
  const sweep = reversed ? 0 : 1;
  const arc = (target: number, large: number): string =>
    `A ${radius} ${radius} 0 ${large} ${sweep} ${point(radius, target)}`;
  if (end - start >= 360) {
    const half = (from + to) / 2;
    return `M ${point(radius, from)} ${arc(half, 0)} ${arc(to, 0)}`;
  }
  return `M ${point(radius, from)} ${arc(to, end - start > 180 ? 1 : 0)}`;
}

/**
 * Which arched label fits, estimating text width as `characters × 0.6 × font
 * size` against the arc length at each line's own radius: both lines (name
 * and legend), the name alone, or the name only while the note is active —
 * never an ellipsis.
 */
export function fitLabel(
  segment: SegmentArc,
  name: string,
  legend: string,
): "both" | "name" | "active" {
  const size = labelFontSize(segment.ring);
  const span = ((segment.end - segment.start) * Math.PI) / 180;
  const ringWidth = segment.outer - segment.inner;

  const fits = (lines: string[]): boolean =>
    lines.every(
      (line, index) =>
        line.length * CHARACTER_WIDTH * size <=
        labelRadius(segment, index as 0 | 1) * span - 8,
    ) && lines.length * LINE_HEIGHT * size <= ringWidth - 8;

  if (fits([name, legend])) return "both";
  if (fits([name])) return "name";
  return "active";
}
