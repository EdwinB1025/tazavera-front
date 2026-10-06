import { describe, it, expect } from "vitest";
import {
  VIEWBOX,
  ringRadii,
  layoutWheel,
  arcPath,
  labelPlacement,
  fitLabel,
  type WheelGeometryNode,
} from "./flavor-wheel-geometry";

/**
 * Flavor wheel geometry tests (design.md D5; design-summary §4.2, §10). Pure
 * functions with no React: ring radii by the deepest level of the whole tree,
 * proportional spans from 12 o'clock clockwise, arc path data, label
 * orientation and the estimated label fit (`characters × 0.6 × font size`).
 * Angles are in degrees, 0 at 12 o'clock, growing clockwise.
 */

function node(
  id: string,
  count: number,
  children: WheelGeometryNode[] = [],
): WheelGeometryNode {
  return { id, count, children };
}

const NONE = new Set<string>();

describe("ringRadii", () => {
  it("uses the whole radius for ring 0 when D = 0", () => {
    expect(ringRadii(0)).toEqual({
      hole: 40,
      rings: [{ inner: 40, outer: 200 }],
    });
  });

  it("splits 40–110 and 110–200 when D = 1", () => {
    expect(ringRadii(1)).toEqual({
      hole: 40,
      rings: [
        { inner: 40, outer: 110 },
        { inner: 110, outer: 200 },
      ],
    });
  });

  it("splits 40–100, 100–150 and 150–200 when D = 2", () => {
    expect(ringRadii(2)).toEqual({
      hole: 40,
      rings: [
        { inner: 40, outer: 100 },
        { inner: 100, outer: 150 },
        { inner: 150, outer: 200 },
      ],
    });
  });

  it("keeps the constant viewBox", () => {
    expect(VIEWBOX).toBe("-204 -204 408 408");
  });
});

describe("layoutWheel", () => {
  it("spans roots proportionally to count, from 12 o'clock clockwise, summing to 360°", () => {
    const { segments } = layoutWheel(
      [node("a", 1), node("b", 2), node("c", 1)],
      NONE,
    );
    expect(
      segments.map(({ node: n, ring, start, end }) => ({
        id: n.id,
        ring,
        start,
        end,
      })),
    ).toEqual([
      { id: "a", ring: 0, start: 0, end: 90 },
      { id: "b", ring: 0, start: 90, end: 270 },
      { id: "c", ring: 0, start: 270, end: 360 },
    ]);
  });

  it("sizes rings by the deepest level of the whole tree, expanded or not", () => {
    const tree = [node("a", 2, [node("a1", 2, [node("a11", 1)])])];
    const { radii, segments } = layoutWheel(tree, NONE);
    expect(radii).toEqual(ringRadii(2));
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ inner: 40, outer: 100 });
  });

  it("places a child inside its parent's span, proportional among siblings and filling it", () => {
    const tree = [
      node("a", 4, [node("a1", 3), node("a2", 1)]),
      node("b", 4, [node("b1", 1)]),
    ];
    const { segments } = layoutWheel(tree, new Set(["a"]));
    expect(
      segments.map(({ node: n, ring, start, end, inner, outer }) => ({
        id: n.id,
        ring,
        start,
        end,
        inner,
        outer,
      })),
    ).toEqual([
      { id: "a", ring: 0, start: 0, end: 180, inner: 40, outer: 110 },
      { id: "a1", ring: 1, start: 0, end: 135, inner: 110, outer: 200 },
      { id: "a2", ring: 1, start: 135, end: 180, inner: 110, outer: 200 },
      { id: "b", ring: 0, start: 180, end: 360, inner: 40, outer: 110 },
    ]);
  });

  it("gives the children of a collapsed parent no spans", () => {
    const tree = [node("a", 2, [node("a1", 2)]), node("b", 1)];
    const { segments } = layoutWheel(tree, NONE);
    expect(segments.map((s) => s.node.id)).toEqual(["a", "b"]);
  });

  it("spans a single note over the full circle", () => {
    const { segments } = layoutWheel([node("a", 3)], NONE);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ start: 0, end: 360 });
  });
});

describe("arcPath", () => {
  const arcs = (d: string): number => (d.match(/A/g) ?? []).length;

  it("draws a partial segment with one outer and one inner arc", () => {
    const d = arcPath(40, 200, 0, 90);
    expect(arcs(d)).toBe(2);
    expect(d.startsWith("M 0 -200")).toBe(true);
  });

  it("draws a full ring as two half-arcs on each radius", () => {
    const d = arcPath(40, 200, 0, 360);
    expect(arcs(d)).toBe(4);
    expect(d).toContain("M 0 -200");
    expect(d).toContain("0 200");
    expect(d).toContain("M 0 -40");
    expect(d).toContain("0 40");
  });

  it("uses the large-arc flag above 180°", () => {
    expect(arcPath(40, 200, 0, 270)).toContain("A 200 200 0 1 1");
    expect(arcPath(40, 200, 0, 90)).toContain("A 200 200 0 0 1");
  });
});

describe("labelPlacement", () => {
  const segment = (ring: number, start: number, end: number) => ({
    ring,
    inner: 100,
    outer: 200,
    start,
    end,
  });

  it("centres the label at the mid-angle and mid-radius", () => {
    const { x, y } = labelPlacement(segment(0, 80, 100));
    expect(x).toBeCloseTo(150);
    expect(y).toBeCloseTo(0);
  });

  it("keeps ring 0 upright in the upper half and flips it in the lower half", () => {
    expect(labelPlacement(segment(0, 30, 60))).toMatchObject({
      rotate: 45,
      flipped: false,
    });
    expect(labelPlacement(segment(0, 300, 330))).toMatchObject({
      rotate: 315,
      flipped: false,
    });
    expect(labelPlacement(segment(0, 120, 150))).toMatchObject({
      rotate: -45,
      flipped: true,
    });
    expect(labelPlacement(segment(0, 210, 240))).toMatchObject({
      rotate: 45,
      flipped: true,
    });
  });

  it("runs rings 1–2 along the radius and flips them in the left half", () => {
    expect(labelPlacement(segment(1, 30, 60))).toMatchObject({
      rotate: -45,
      flipped: false,
    });
    expect(labelPlacement(segment(2, 120, 150))).toMatchObject({
      rotate: 45,
      flipped: false,
    });
    expect(labelPlacement(segment(1, 210, 240))).toMatchObject({
      rotate: -45,
      flipped: true,
    });
    expect(labelPlacement(segment(2, 300, 330))).toMatchObject({
      rotate: 45,
      flipped: true,
    });
  });
});

describe("fitLabel", () => {
  const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

  // Ring 0 tangential, D = 0: 40–200, mid-radius 120, height room 152.
  // "Tea" is 3 × 0.6 × 13 = 23.4 wide; "12/15" is 5 × 0.6 × 13 = 39 wide.
  const tangentialSpan = (width: number): number =>
    toDegrees(2 * Math.asin((width + 8) / (2 * 120)));
  const tangential = (width: number) => ({
    ring: 0,
    inner: 40,
    outer: 200,
    start: 0,
    end: tangentialSpan(width),
  });

  it("returns two lines when the longest line fits the chord", () => {
    expect(fitLabel(tangential(39.01), "Tea", "12/15")).toBe("both");
  });

  it("drops to the name alone when only the name fits", () => {
    expect(fitLabel(tangential(38.99), "Tea", "12/15")).toBe("name");
    expect(fitLabel(tangential(23.41), "Tea", "12/15")).toBe("name");
  });

  it("draws no label when not even the name fits", () => {
    expect(fitLabel(tangential(23.39), "Tea", "12/15")).toBe("none");
  });

  it("drops to the name alone when two lines exceed the ring height", () => {
    // D = 2 ring 0 is 60 wide: height room 52 holds 2 × 1.2 × 13 = 31.2.
    // A 30-wide tangential ring would hold 22: one line (15.6) only.
    const narrow = { ring: 0, inner: 70, outer: 100, start: 0, end: 180 };
    expect(fitLabel(narrow, "Tea", "4/5")).toBe("name");
  });

  // Ring 1 radial, D = 1: 110–200, mid-radius 155, width room 82.
  // Two lines are 2 × 1.2 × 12 = 28.8 tall; one line is 14.4.
  const radialSpan = (height: number): number => toDegrees((height + 4) / 155);
  const radial = (height: number) => ({
    ring: 1,
    inner: 110,
    outer: 200,
    start: 0,
    end: radialSpan(height),
  });

  it("fits radial labels by the arc length at mid-radius", () => {
    expect(fitLabel(radial(28.81), "Berry", "4/5")).toBe("both");
    expect(fitLabel(radial(28.79), "Berry", "4/5")).toBe("name");
    expect(fitLabel(radial(14.41), "Berry", "4/5")).toBe("name");
    expect(fitLabel(radial(14.39), "Berry", "4/5")).toBe("none");
  });

  it("fits radial labels by the ring width", () => {
    // 11 × 0.6 × 12 = 79.2 fits 82; 12 characters (86.4) do not.
    const wide = radial(100);
    expect(fitLabel(wide, "Elevenchars", "4/5")).toBe("both");
    expect(fitLabel(wide, "Twelve chars", "4/5")).toBe("none");
  });
});
