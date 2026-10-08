import type { ReactNode } from "react";
import { Badge } from "./Badge";

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

export type TaxonomyTreeProps = {
  notes: TaxonomyTreeNode[];
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

/** One note's badge, at its own level's treatment. */
function NoteBadge({ note }: { note: TaxonomyTreeNode }): ReactNode {
  return (
    <Badge variant="taxonomy" color={note.color} level={note.level}>
      {note.label}
    </Badge>
  );
}

/**
 * Taxonomy notes as nested lists following a resolved tree
 * (nest-card-taste-notes design.md D2, D3; nest-consensus-notes D1): one tree
 * per top-level note, its children in an indented column, their children in
 * an indented wrapping row. `role="list"` keeps the hierarchy for assistive
 * technologies; a child list renders only when there are children.
 */
export function TaxonomyTree({ notes }: TaxonomyTreeProps): ReactNode {
  if (notes.length === 0) return null;
  return (
    <ul role="list" className={TREES_CLASSES}>
      {notes.map((root) => (
        <li key={root.ref} className={TREE_CLASSES}>
          <NoteBadge note={root} />
          {root.children.length > 0 ? (
            <ul role="list" className={COLUMN_CLASSES}>
              {root.children.map((child) => (
                <li key={child.ref} className={COLUMN_ITEM_CLASSES}>
                  <NoteBadge note={child} />
                  {child.children.length > 0 ? (
                    <ul role="list" className={ROW_CLASSES}>
                      {child.children.map((leaf) => (
                        <li key={leaf.ref}>
                          <NoteBadge note={leaf} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
