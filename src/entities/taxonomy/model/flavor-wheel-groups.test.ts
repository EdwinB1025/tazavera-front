import { describe, it, expect } from "vitest";
import type { TaxonomyNode } from "@/shared/api";
import type { FlavorWheelNode } from "@/shared/ui";
import { assignWheelGroups } from "./flavor-wheel-groups";

/**
 * Wheel group assignment tests (add-offering-catalog design.md D19; spec
 * "Mouthfeel group in the CATA wheel"): a root whose taxonomy has `mouthfeel`
 * among its `categories` belongs to the `mouthfeel` group, any other root to
 * `aromatics`; descendants carry no group.
 */

const TAXONOMIES: TaxonomyNode[] = [
  {
    ulid: "T_FRUITY",
    level: 0,
    categories: ["aromatics"],
    children: [{ ulid: "T_BERRY", level: 1, categories: ["aromatics"] }],
  },
  {
    ulid: "T_BODY",
    level: 0,
    categories: ["mouthfeel"],
    children: [{ ulid: "T_SMOOTH", level: 1, categories: ["mouthfeel"] }],
  },
] as TaxonomyNode[];

function wheelNode(
  id: string,
  level: 0 | 1 | 2,
  children: FlavorWheelNode[] = [],
): FlavorWheelNode {
  return {
    id,
    name: id,
    description: null,
    color: "#336699",
    level,
    count: 1,
    countLabel: "1 of 5",
    children,
  };
}

describe("assignWheelGroups", () => {
  it("assigns mouthfeel to a root in the mouthfeel category and aromatics to any other root", () => {
    const result = assignWheelGroups(
      [
        wheelNode("T_FRUITY", 0, [wheelNode("T_BERRY", 1)]),
        wheelNode("T_BODY", 0, [wheelNode("T_SMOOTH", 1)]),
        wheelNode("T_UNKNOWN", 0),
      ],
      TAXONOMIES,
    );
    expect(result.map((n) => [n.id, n.group])).toEqual([
      ["T_FRUITY", "aromatics"],
      ["T_BODY", "mouthfeel"],
      ["T_UNKNOWN", "aromatics"],
    ]);
  });

  it("leaves the descendants without a group", () => {
    const [fruity, body] = assignWheelGroups(
      [
        wheelNode("T_FRUITY", 0, [wheelNode("T_BERRY", 1)]),
        wheelNode("T_BODY", 0, [wheelNode("T_SMOOTH", 1)]),
      ],
      TAXONOMIES,
    );
    expect(fruity.children[0].group).toBeUndefined();
    expect(body.children[0].group).toBeUndefined();
  });
});
