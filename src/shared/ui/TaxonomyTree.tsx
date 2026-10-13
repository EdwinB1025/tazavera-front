"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "./Badge";
import { TaxonomyTreeToggle } from "./TaxonomyTreeToggle";

// ─── UI-specific types (declared before the component) ───
// The notes arrive already resolved by the consumer; no generated API type is
// used here.

export type TaxonomyTreeNode = {
  ref: string;
  label: string;
  color: string;
  level: 0 | 1 | 2;
  count?: number;
  children: TaxonomyTreeNode[];
};

export type TaxonomyTreeTexts = {
  /** Accessible name of a closed note's toggle; holds `{label}`. */
  showNotesLabel: string;
  /** Accessible name of an open note's toggle; holds `{label}`. */
  hideNotesLabel: string;
};

export type TaxonomyTreeProps = {
  notes: TaxonomyTreeNode[];
  /** With it, each note shows its `name count/total` share after its badge. */
  total?: number;
  texts: TaxonomyTreeTexts;
};

// ─── Tree layout (nest-card-taste-notes design.md D2) ───
// The trees side by side, wrapping, so no tree overflows its container.
const TREES_CLASSES = ["flex", "flex-wrap", "items-start", "gap-3"].join(" ");
const TREE_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");
// The level-1 column, indented behind a decorative left connector.
const COLUMN_CLASSES = [
  "ml-5",
  "flex",
  "flex-col",
  "items-start",
  "gap-2",
  "border-l",
  "border-border-subtle",
  "pl-3",
].join(" ");
const COLUMN_ITEM_CLASSES = ["flex", "flex-col", "items-start", "gap-1.5"].join(" ");
// The level-2 row, further indented, wrapping.
const ROW_CLASSES = ["ml-5", "flex", "flex-wrap", "gap-1.5"].join(" ");
// A badge and its inline share (nest-consensus-notes D4).
const SHARE_CLASSES = ["flex", "flex-wrap", "items-center", "gap-2"].join(" ");

/**
 * One note's badge — its name, then its toggle when it has children
 * (unify-taste-trees D1) — and its share after the badge when given a total.
 */
function NoteRow({
  note,
  total,
  toggle,
}: {
  note: TaxonomyTreeNode;
  total?: number;
  toggle?: ReactNode;
}): ReactNode {
  const badge = (
    <Badge variant="taxonomy" color={note.color} level={note.level}>
      <span>{note.label}</span>
      {toggle}
    </Badge>
  );
  if (total === undefined && toggle === undefined) return badge;
  const share =
    total === undefined ? null : `${note.label} ${note.count ?? 0}/${total}`;
  return (
    <div className={SHARE_CLASSES}>
      {badge}
      {share !== null ? <span className="type-meta">{share}</span> : null}
    </div>
  );
}

// The item and child-list classes by depth: the tree, the level-1 column,
// the level-2 row (nest-card-taste-notes design.md D2).
const ITEM_CLASSES = [TREE_CLASSES, COLUMN_ITEM_CLASSES, undefined] as const;
const CHILD_LIST_CLASSES = [COLUMN_CLASSES, ROW_CLASSES, undefined] as const;

type NoteItemProps = {
  note: TaxonomyTreeNode;
  depth: 0 | 1 | 2;
  total?: number;
  texts: TaxonomyTreeTexts;
};

/**
 * One note's item: its row and, when it has children, its toggle and its
 * child list (collapse-taxonomy-trees design.md D3). The list starts closed
 * and stays rendered with `hidden` while closed, so the toggle's
 * `aria-controls` always resolves; closing remounts it (a new `key`), so
 * every descendant returns to closed.
 */
function NoteItem({ note, depth, total, texts }: NoteItemProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);
  const listId = useId();
  const hasChildren = note.children.length > 0;

  function toggle(): void {
    if (open) setRound(round + 1);
    setOpen(!open);
  }

  const toggleButton = hasChildren ? (
    <TaxonomyTreeToggle
      open={open}
      controls={listId}
      label={note.label}
      onToggle={toggle}
      texts={texts}
    />
  ) : undefined;
  const childDepth = Math.min(depth + 1, 2) as 1 | 2;

  return (
    <li className={ITEM_CLASSES[depth]}>
      <NoteRow note={note} total={total} toggle={toggleButton} />
      {hasChildren ? (
        <ul
          key={round}
          id={listId}
          role="list"
          hidden={!open}
          className={CHILD_LIST_CLASSES[depth]}
        >
          {note.children.map((child) => (
            <NoteItem
              key={child.ref}
              note={child}
              depth={childDepth}
              total={total}
              texts={texts}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Taxonomy notes as nested lists following a resolved tree
 * (nest-card-taste-notes design.md D2, D3; nest-consensus-notes D1): one tree
 * per top-level note, its children in an indented column, their children in
 * an indented wrapping row. `role="list"` keeps the hierarchy for assistive
 * technologies; a child list renders only when there are children. Given a
 * total, each note's share follows its badge inline. Every tree starts
 * closed and opens note by note (collapse-taxonomy-trees design.md D3).
 */
export function TaxonomyTree({ notes, total, texts }: TaxonomyTreeProps): ReactNode {
  if (notes.length === 0) return null;
  return (
    <ul role="list" className={TREES_CLASSES}>
      {notes.map((root) => (
        <NoteItem key={root.ref} note={root} depth={0} total={total} texts={texts} />
      ))}
    </ul>
  );
}
