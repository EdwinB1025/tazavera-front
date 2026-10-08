import type { ChipOption, ChipRow } from "./DescriptorChipGroup";

/**
 * Descriptor cascade model (cascade-evaluation-descriptors D1; spec
 * form-fields "Descriptor cascade"). Pure: the chip rows of a taxonomy tree of
 * up to three levels and the value rule shared by every cascade.
 */

// ─── Types (declared before the functions) ───

export type CascadeNode = {
  value: string;
  label: string;
  color: string;
  level: 0 | 1 | 2;
  children: CascadeNode[];
};

function chip(node: CascadeNode): ChipOption {
  return { value: node.value, label: node.label, color: node.color, level: node.level };
}

/** A titled row of a node's children, then the level-2 rows of its open children. */
function childRows(parent: CascadeNode, isOpen: (node: CascadeNode) => boolean): ChipRow[] {
  const rows: ChipRow[] = [
    { id: `children-${parent.value}`, title: parent.label, options: parent.children.map(chip) },
  ];
  for (const child of parent.children) {
    if (child.children.length > 0 && isOpen(child)) {
      rows.push({
        id: `children-${child.value}`,
        title: child.label,
        options: child.children.map(chip),
      });
    }
  }
  return rows;
}

/**
 * The chip rows: the level-0 chips in untitled rows, broken after each open
 * node with children, which is followed by its children's titled row and the
 * level-2 rows of its open children. No row is indented.
 */
export function cascadeRows(
  nodes: CascadeNode[],
  isOpen: (node: CascadeNode) => boolean,
): ChipRow[] {
  const rows: ChipRow[] = [];
  let line: ChipOption[] = [];
  for (const node of nodes) {
    line.push(chip(node));
    if (node.children.length === 0 || !isOpen(node)) continue;
    rows.push({ id: `line-${node.value}`, options: line }, ...childRows(node, isOpen));
    line = [];
  }
  if (line.length > 0) rows.push({ id: "line-end", options: line });
  return rows;
}

/**
 * The value to report: a node stays chosen only while it and every ancestor
 * are in `next`, listed in tree order (parent before its children).
 */
export function cascadeValue(nodes: CascadeNode[], next: string[]): string[] {
  const chosen = new Set(next);
  const result: string[] = [];
  function walk(level: CascadeNode[]): void {
    for (const node of level) {
      if (!chosen.has(node.value)) continue;
      result.push(node.value);
      walk(node.children);
    }
  }
  walk(nodes);
  return result;
}
