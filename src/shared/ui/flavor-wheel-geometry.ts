// ─── Flavor wheel geometry (design.md D5; design-summary §4.2) ───
// Pure functions with no React and no browser global, in SVG user units.
// Angles are degrees, 0 at 12 o'clock, growing clockwise.

/** The constant viewBox: outer radius 200 plus a 4-unit margin. */
export const VIEWBOX = "-204 -204 408 408";

const HOLE = 80;

/** Ring bounds by the depth of the notes: their deepest level, capped at 2. */
const RINGS_BY_DEPTH: Record<0 | 1 | 2, number[]> = {
  0: [80, 200],
  1: [80, 140, 200],
  2: [80, 120, 160, 200],
};

const LABEL_FONT_SIZE = [13, 12, 12];

/** The gap at each group boundary, in degrees (add-offering-catalog D19). */
const GROUP_GAP = 6;
const LINE_HEIGHT = 1.2;
const CHARACTER_WIDTH = 0.6;

/** The structural part of a note the geometry needs. */
export type WheelGeometryNode = {
  id: string;
  count: number;
  /** The root's group (add-offering-catalog D19); read on roots only. */
  group?: string;
  children: WheelGeometryNode[];
};

/** The angular range a group of roots occupies. */
export type GroupArc = { id: string; start: number; end: number };

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

/** The deepest level of the notes: 0 for roots alone (stack-flavor-wheel-layout D2). */
function treeDepth(nodes: WheelGeometryNode[]): number {
  return nodes.reduce(
    (deepest, n) =>
      Math.max(deepest, n.children.length ? 1 + treeDepth(n.children) : 0),
    0,
  );
}

/**
 * The roots partitioned into runs by group, the runs in `groupOrder` (a group
 * missing from it goes last), the roots of a run in their given order.
 */
export function groupRuns<T extends WheelGeometryNode>(
  nodes: T[],
  groupOrder: readonly string[],
): { id: string; roots: T[] }[] {
  const rank = (node: T): number => {
    const index = groupOrder.indexOf(node.group ?? "");
    return index === -1 ? groupOrder.length : index;
  };
  const sorted = nodes
    .map((node, index) => ({ node, index }))
    .sort((a, b) => rank(a.node) - rank(b.node) || a.index - b.index)
    .map(({ node }) => node);
  const runs: { id: string; roots: T[] }[] = [];
  for (const node of sorted) {
    const id = node.group ?? "";
    const last = runs[runs.length - 1];
    if (last && last.id === id) last.roots.push(node);
    else runs.push({ id, roots: [node] });
  }
  return runs;
}

/**
 * Every note's segment, depth-first in wheel order, whatever the note list
 * shows (stack-flavor-wheel-layout D2): each root spans
 * `360° × count / Σ root counts`, each child spans the parent's span
 * `× count / Σ sibling counts`, filling it. With a `groupOrder`
 * and roots of two groups or more, the roots are grouped in that order and a
 * `GROUP_GAP` sits at each group boundary, one centred at 12 o'clock; the
 * roots share the rest by count (add-offering-catalog design.md D19).
 */
export function layoutWheel<T extends WheelGeometryNode>(
  nodes: T[],
  groupOrder?: readonly string[],
): { radii: RingRadii; segments: WheelSegment<T>[]; groupArcs: GroupArc[] } {
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
      if (n.children.length && radii.rings[ring + 1]) {
        place(n.children as T[], ring + 1, cursor, next);
      }
      cursor = next;
    });
  };

  const runs = groupOrder ? groupRuns(nodes, groupOrder) : [];
  if (runs.length < 2) {
    place(nodes, 0, 0, 360);
    return { radii, segments, groupArcs: [] };
  }

  const available = 360 - runs.length * GROUP_GAP;
  const total = nodes.reduce((sum, n) => sum + n.count, 0);
  const groupArcs: GroupArc[] = [];
  let cursor = GROUP_GAP / 2;
  runs.forEach((run, index) => {
    const count = run.roots.reduce((sum, n) => sum + n.count, 0);
    const end =
      index === runs.length - 1
        ? 360 - GROUP_GAP / 2
        : cursor + (available * count) / total;
    place(run.roots, 0, cursor, end);
    groupArcs.push({ id: run.id, start: cursor, end });
    cursor = end + GROUP_GAP;
  });
  return { radii, segments, groupArcs };
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
