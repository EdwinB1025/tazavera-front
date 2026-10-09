import { descendantIds, type Row } from "./flavor-wheel-tree";
import type { FlavorWheelNode } from "./flavor-wheel-types";

export type TreeKeyContext = {
  rows: Row[];
  index: number;
  /** The wheel's roots, for Escape. */
  nodes: FlavorWheelNode[];
  expanded: ReadonlySet<string>;
  focusRow: (id: string) => void;
  setExpansion: (node: FlavorWheelNode, open: boolean) => void;
  toggle: (node: FlavorWheelNode) => void;
  collapseAll: () => void;
};

type KeyHandler = (context: TreeKeyContext) => void;

function arrowDown({ rows, index, focusRow }: TreeKeyContext): void {
  if (index < rows.length - 1) focusRow(rows[index + 1].node.id);
}

function arrowUp({ rows, index, focusRow }: TreeKeyContext): void {
  if (index > 0) focusRow(rows[index - 1].node.id);
}

function arrowRight(context: TreeKeyContext): void {
  const { node } = context.rows[context.index];
  if (node.children.length === 0) return;
  if (context.expanded.has(node.id)) context.focusRow(node.children[0].id);
  else context.setExpansion(node, true);
}

function arrowLeft(context: TreeKeyContext): void {
  const { node, parentId } = context.rows[context.index];
  const isExpanded = context.expanded.has(node.id);
  if (node.children.length > 0 && isExpanded) context.setExpansion(node, false);
  else if (parentId !== null) context.focusRow(parentId);
}

function home({ rows, focusRow }: TreeKeyContext): void {
  focusRow(rows[0].node.id);
}

function end({ rows, focusRow }: TreeKeyContext): void {
  focusRow(rows[rows.length - 1].node.id);
}

function toggleRow({ rows, index, toggle }: TreeKeyContext): void {
  toggle(rows[index].node);
}

/** Collapse every note and focus the focused note's root. */
function escape(context: TreeKeyContext): void {
  const { node } = context.rows[context.index];
  const root = context.nodes.find(
    (candidate) =>
      candidate.id === node.id || descendantIds(candidate).includes(node.id),
  );
  context.collapseAll();
  if (root) context.focusRow(root.id);
}

const KEY_HANDLERS: ReadonlyMap<string, KeyHandler> = new Map([
  ["ArrowDown", arrowDown],
  ["ArrowUp", arrowUp],
  ["ArrowRight", arrowRight],
  ["ArrowLeft", arrowLeft],
  ["Home", home],
  ["End", end],
  ["Enter", toggleRow],
  [" ", toggleRow],
  ["Escape", escape],
]);

/**
 * APG Tree View keys over the visible rows, plus Escape (design.md D6).
 * Runs the key's effect; false for a key the tree does not handle.
 */
export function handleTreeKey(key: string, context: TreeKeyContext): boolean {
  const handler = KEY_HANDLERS.get(key);
  if (!handler) return false;
  handler(context);
  return true;
}
