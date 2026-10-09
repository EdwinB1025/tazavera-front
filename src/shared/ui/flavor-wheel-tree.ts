import type { CSSProperties } from "react";
import { groupRuns } from "./flavor-wheel-geometry";
import { taxonomyColorRule } from "./taxonomy-color";
import type { FlavorWheelGroup, FlavorWheelNode } from "./flavor-wheel-types";

export const SWATCH_CLASSES = "size-3 shrink-0 rounded-check";

/** A visible note row in wheel order (depth-first), with its tree position. */
export type Row = {
  node: FlavorWheelNode;
  depth: number;
  setSize: number;
  position: number;
  parentId: string | null;
};

/** Groups set apart only when two or more hold roots; roots then follow the group order. */
export type WheelArrangement = {
  nodes: FlavorWheelNode[];
  grouped: boolean;
  groupOrder: string[];
  legendGroups: FlavorWheelGroup[];
};

export function visibleRows(
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

export function findNode(
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

export function descendantIds(node: FlavorWheelNode): string[] {
  return node.children.flatMap((child) => [child.id, ...descendantIds(child)]);
}

export function descriptionId(id: string): string {
  return `flavor-wheel-desc-${id}`;
}

/** The swatch's data colour at its depth opacity (design.md D4). */
export function swatchStyle(node: FlavorWheelNode): CSSProperties {
  return {
    backgroundColor: node.color,
    opacity: taxonomyColorRule(node.color, node.level).opacity,
  };
}

/**
 * Groups set apart only when two or more of them hold roots (D19); the
 * roots then follow the group order around the wheel and down the list.
 */
export function arrangeRoots(
  givenNodes: FlavorWheelNode[],
  groups?: FlavorWheelGroup[],
): WheelArrangement {
  const groupOrder = (groups ?? []).map((group) => group.id);
  const runs = groups ? groupRuns(givenNodes, groupOrder) : [];
  const grouped = runs.length >= 2;
  const nodes = grouped ? runs.flatMap((run) => run.roots) : givenNodes;
  const legendGroups = runs
    .map((run) => groups?.find((group) => group.id === run.id))
    .filter((group): group is FlavorWheelGroup => group !== undefined);
  return { nodes, grouped, groupOrder, legendGroups };
}
