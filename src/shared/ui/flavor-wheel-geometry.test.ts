import { describe, it, expect } from "vitest";
import {
  VIEWBOX,
  ringRadii,
  layoutWheel,
  arcPath,
  labelRadius,
  labelPath,
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
  it("uses 80–200 for ring 0 around an 80 hole when D = 0", () => {
    expect(ringRadii(0)).toEqual({
      hole: 80,
      rings: [{ inner: 80, outer: 200 }],
    });
  });

  it("splits 80–140 and 140–200 when D = 1", () => {
    expect(ringRadii(1)).toEqual({
      hole: 80,
      rings: [
        { inner: 80, outer: 140 },
        { inner: 140, outer: 200 },
      ],
    });
  });

  it("splits 80–120, 120–160 and 160–200 when D = 2", () => {
    expect(ringRadii(2)).toEqual({
      hole: 80,
      rings: [
        { inner: 80, outer: 120 },
        { inner: 120, outer: 160 },
        { inner: 160, outer: 200 },
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
    expect(segments[0]).toMatchObject({ inner: 80, outer: 120 });
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
      { id: "a", ring: 0, start: 0, end: 180, inner: 80, outer: 140 },
      { id: "a1", ring: 1, start: 0, end: 135, inner: 140, outer: 200 },
      { id: "a2", ring: 1, start: 135, end: 180, inner: 140, outer: 200 },
      { id: "b", ring: 0, start: 180, end: 360, inner: 80, outer: 140 },
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

describe("labelRadius", () => {
  it("centres the name one half line inside the outer edge and the legend one line further in", () => {
    const ring0 = { ring: 0, inner: 80, outer: 140, start: 0, end: 90 };
    expect(labelRadius(ring0, 0)).toBeCloseTo(128.2);
    expect(labelRadius(ring0, 1)).toBeCloseTo(112.6);
    const ring1 = { ring: 1, inner: 140, outer: 200, start: 0, end: 90 };
    expect(labelRadius(ring1, 0)).toBeCloseTo(188.8);
    expect(labelRadius(ring1, 1)).toBeCloseTo(174.4);
  });
});

describe("labelPath", () => {
  it("runs clockwise in the upper half", () => {
    expect(labelPath(100, 0, 90)).toBe("M 0 -100 A 100 100 0 0 1 100 0");
    expect(labelPath(100, 270, 360)).toBe("M -100 0 A 100 100 0 0 1 0 -100");
    expect(labelPath(100, 0, 180)).toBe("M 0 -100 A 100 100 0 0 1 0 100");
  });

  it("reverses in the lower half so the text stays upright", () => {
    expect(labelPath(100, 90, 180)).toBe("M 0 100 A 100 100 0 0 0 100 0");
    expect(labelPath(100, 0, 270)).toBe("M -100 0 A 100 100 0 1 0 0 -100");
  });

  it("draws a full circle as two half-arcs in the same direction", () => {
    expect(labelPath(100, 0, 360)).toBe(
      "M 0 -100 A 100 100 0 0 0 0 100 A 100 100 0 0 0 0 -100",
    );
  });
});

describe("fitLabel", () => {
  const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

  // Ring 0, D = 1: 80–140, name line at radius 128.2, legend line at 112.6,
  // height room 52 (two 13-unit lines are 31.2 tall).
  // "Tea" is 3 × 0.6 × 13 = 23.4 wide; "12/15" is 5 × 0.6 × 13 = 39 wide.
  const ring0 = (end: number) => ({
    ring: 0,
    inner: 80,
    outer: 140,
    start: 0,
    end,
  });
  const spanFor = (width: number, radius: number): number =>
    toDegrees((width + 8) / radius);

  it("returns both lines when the legend fits its arc", () => {
    expect(fitLabel(ring0(spanFor(39, 112.6) + 0.01), "Tea", "12/15")).toBe(
      "both",
    );
  });

  it("drops to the name alone when only the name fits its arc", () => {
    expect(fitLabel(ring0(spanFor(39, 112.6) - 0.01), "Tea", "12/15")).toBe(
      "name",
    );
    expect(fitLabel(ring0(spanFor(23.4, 128.2) + 0.01), "Tea", "12/15")).toBe(
      "name",
    );
  });

  it("shows the name only while active when not even the name fits", () => {
    expect(fitLabel(ring0(spanFor(23.4, 128.2) - 0.01), "Tea", "12/15")).toBe(
      "active",
    );
  });

  it("drops to the name alone when two lines exceed the ring height", () => {
    // A 30-wide ring holds 22: one 15.6-unit line, not two (31.2).
    const thin = { ring: 0, inner: 80, outer: 110, start: 0, end: 180 };
    expect(fitLabel(thin, "Tea", "4/5")).toBe("name");
  });

  it("fits both lines of a single note over the full circle", () => {
    const full = { ring: 0, inner: 80, outer: 200, start: 0, end: 360 };
    expect(fitLabel(full, "Fruity", "5/5")).toBe("both");
  });
});
