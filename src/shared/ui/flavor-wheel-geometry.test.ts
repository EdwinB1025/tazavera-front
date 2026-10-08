import { describe, it, expect } from "vitest";
import { ringRadii, layoutWheel, fitLabel, type WheelGeometryNode } from "./flavor-wheel-geometry";

/**
 * Flavor wheel geometry tests (design.md D5; design-summary §4.2, §10). Pure
 * functions with no React: ring radii by the deepest level of the notes,
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

describe("layoutWheel", () => {
  it("spans roots proportionally to count, from 12 o'clock clockwise, summing to 360°", () => {
    const { segments } = layoutWheel(
      [node("a", 1), node("b", 2), node("c", 1)],
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

  describe("sizes rings by the deepest level of the notes", () => {
    const tree = [node("a", 2, [node("a1", 2, [node("a11", 1)])])];
    const bounds = () =>
      layoutWheel(tree).segments.map(({ node: n, inner, outer }) => ({
        id: n.id,
        inner,
        outer,
      }));

    it("splits three rings for notes reaching level 2", () => {
      expect(layoutWheel(tree).radii).toEqual(ringRadii(2));
      expect(bounds()).toEqual([
        { id: "a", inner: 80, outer: 120 },
        { id: "a1", inner: 120, outer: 160 },
        { id: "a11", inner: 160, outer: 200 },
      ]);
    });
  });

  it("places a child inside its parent's span, proportional among siblings and filling it", () => {
    const tree = [
      node("a", 4, [node("a1", 3), node("a2", 1)]),
      node("b", 4, [node("b1", 1)]),
    ];
    const { segments } = layoutWheel(tree);
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
      { id: "b1", ring: 1, start: 180, end: 360, inner: 140, outer: 200 },
    ]);
  });

  it("spans a single note over the full circle", () => {
    const { segments } = layoutWheel([node("a", 3)]);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ start: 0, end: 360 });
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

  it("drops to the name alone when only the name fits its arc", () => {
    expect(fitLabel(ring0(spanFor(39, 112.6) - 0.01), "Tea", "12/15")).toBe(
      "name",
    );
    expect(fitLabel(ring0(spanFor(23.4, 128.2) + 0.01), "Tea", "12/15")).toBe(
      "name",
    );
  });
});

describe("layoutWheel — groups (add-offering-catalog design.md D19)", () => {
  function grouped(
    id: string,
    count: number,
    group: string,
    children: WheelGeometryNode[] = [],
  ): WheelGeometryNode {
    return { id, count, group, children };
  }

  it("leaves a 6° gap at each group boundary, one centred at 12 o'clock, and spans the rest by count", () => {
    const { segments, groupArcs } = layoutWheel(
      [
        grouped("body", 2, "mouthfeel"),
        grouped("fruity", 3, "aromatics"),
        grouped("floral", 1, "aromatics"),
      ],
      ["aromatics", "mouthfeel"],
    );
    const spans = segments.map(({ node: n, start, end }) => ({
      id: n.id,
      start: Math.round(start * 1000) / 1000,
      end: Math.round(end * 1000) / 1000,
    }));
    // 360 − 2 × 6 = 348° shared by count 6: 58° per count.
    expect(spans).toEqual([
      { id: "fruity", start: 3, end: 177 },
      { id: "floral", start: 177, end: 235 },
      { id: "body", start: 241, end: 357 },
    ]);
    expect(groupArcs).toEqual([
      { id: "aromatics", start: 3, end: 235 },
      { id: "mouthfeel", start: 241, end: 357 },
    ]);
  });

  it("lays out exactly as without groups when the roots hold one group only", () => {
    const roots = [grouped("a", 1, "aromatics"), grouped("b", 3, "aromatics")];
    const withGroups = layoutWheel(roots, ["aromatics", "mouthfeel"]);
    expect(withGroups.segments).toEqual(layoutWheel(roots).segments);
    expect(withGroups.groupArcs).toEqual([]);
  });
});
