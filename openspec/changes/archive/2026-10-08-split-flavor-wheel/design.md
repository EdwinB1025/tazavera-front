# Design

Sources: backlog R37 (`docs/backlog.md`); technical review §3.1, row R37 (`docs/review/technical-review.md`); the AGENTS.md size limits; add-flavor-wheel design D1 and D4–D8 and add-offering-catalog design D19 (the wheel's parts, kept as they are). Fast lane: no design folder.

## Context

Current state on `qa`: `src/shared/ui/FlavorWheel.tsx` is 571 lines (504 counted by the `max-lines` lint rule). It declares the exported types `FlavorWheelNode`, `FlavorWheelGroup`, `FlavorWheelTexts` and `FlavorWheelProps`, the layout and treatment class constants, the group-legend radii, the `Row` type and the helpers `visibleRows`, `findNode`, `descendantIds`, `descriptionId` and `swatchStyle`, and the label components `SegmentLabel` and `ActiveName`. `FlavorWheel` (319 lines, complexity 16) holds the expansion and active-note state, the row refs, the group arrangement, the tree keyboard handler (complexity 18) and the markup of the SVG wheel, the group legend, the description panel and the note list. `src/shared/ui/index.ts`, both `FlavorWheel.test.tsx` files and the hosts import `FlavorWheel` and its four types from `./FlavorWheel` (or `@/shared/ui`, `@/shared/ui/FlavorWheel`).

## Goals / Non-Goals

**Goals:** every component and function of the wheel at most 80 lines with a complexity of at most 15, and every file at most 300 lines; each concern in its own sibling file; identical DOM, SVG geometry, classes, texts, accessible names, `aria-*` attributes, roving focus, keyboard and pointer behaviour.

**Non-Goals:** no change to `flavor-wheel-geometry.ts`, `taxonomy-color.ts`, `Collapsible.tsx`, `icons.ts`, `src/shared/ui/index.ts`, any host or any test. The existing `jsx-a11y/role-has-required-aria-props` warning on the tree rows stays.

## API

None. The wheel consumes no endpoint and uses no generated API type (add-flavor-wheel D1); its types are UI types.

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/shared/ui/FlavorWheel.tsx` | shared (ui) | Modified | The exported types, the layout classes and `FlavorWheel` composing the parts (D1, D3) |
| `src/shared/ui/flavor-wheel-tree.ts` | shared (ui) | New | `Row`, the note-tree helpers, the swatch style and class, the root arrangement (D2) |
| `src/shared/ui/FlavorWheelLabels.tsx` | shared (ui) | New | `SegmentLabel` and `ActiveName`, moved unchanged (D2) |
| `src/shared/ui/FlavorWheelChart.tsx` | shared (ui) | New | The SVG wheel: segments, group arcs, centre total, active outline (D2) |
| `src/shared/ui/FlavorWheelPanel.tsx` | shared (ui) | New | The fixed description panel (D2) |
| `src/shared/ui/FlavorWheelNoteList.tsx` | shared (ui) | New | The collapsible note tree and its rows (D2) |
| `src/shared/ui/flavor-wheel-keys.ts` | shared (ui) | New | The tree keyboard model, one handler per key (D2) |
| `src/shared/ui/use-flavor-wheel-state.ts` | shared (ui) | New | The expansion, active-note, id-prefix and row-ref state (D2) |

`src/shared/ui/index.ts`, `flavor-wheel-geometry.ts`, `taxonomy-color.ts` and every test file do not change. No route file changes.

## Decisions

### D1 — Placement, imports and exported types

Every part is a sibling file of `FlavorWheel.tsx` in `src/shared/ui`, and siblings import each other by relative path (`./flavor-wheel-tree`, `./FlavorWheelChart`), never through `index.ts`, which keeps exporting exactly what it exports today. The four exported types stay declared in `FlavorWheel.tsx`, so `index.ts`, the hosts and the tests keep their imports; the parts take them with `import type { … } from "./FlavorWheel"`, a type-only import erased at build. A file holding an event-handler prop, a hook or a browser global starts with `"use client"` (the client-boundary guard): `FlavorWheel.tsx`, `FlavorWheelChart.tsx`, `FlavorWheelNoteList.tsx` and `use-flavor-wheel-state.ts`. The others render markup or compute only and carry no directive.

### D2 — Parts and props

Each part moves its code, class constants and radii out of `FlavorWheel.tsx` unchanged; a class constant two parts use (`SWATCH_CLASSES`) lives in `flavor-wheel-tree.ts` beside `swatchStyle`. Types are declared before the component in each file. Inner render blocks that would push a component over 80 lines become components local to their file (not exported): one segment of the wheel and one group arc in `FlavorWheelChart.tsx`, one tree row in `FlavorWheelNoteList.tsx`.

```ts
// flavor-wheel-tree.ts — moved unchanged, plus the root arrangement of FlavorWheel (D19)
export type Row = {
  node: FlavorWheelNode;
  depth: number;
  setSize: number;
  position: number;
  parentId: string | null;
};
export const SWATCH_CLASSES: string;
export function visibleRows(
  nodes: FlavorWheelNode[],
  expanded: ReadonlySet<string>,
  depth?: number,
  parentId?: string | null,
): Row[];
export function findNode(nodes: FlavorWheelNode[], id: string): FlavorWheelNode | null;
export function descendantIds(node: FlavorWheelNode): string[];
export function descriptionId(id: string): string;
export function swatchStyle(node: FlavorWheelNode): CSSProperties;
/** Groups set apart only when two or more hold roots; roots then follow the group order. */
export type WheelArrangement = {
  nodes: FlavorWheelNode[];
  grouped: boolean;
  groupOrder: string[];
  legendGroups: FlavorWheelGroup[];
};
export function arrangeRoots(
  nodes: FlavorWheelNode[],
  groups?: FlavorWheelGroup[],
): WheelArrangement;

// FlavorWheelLabels.tsx — moved unchanged
export type WheelLabelProps = {
  segment: WheelSegment<FlavorWheelNode>;
  legend: string;
  idPrefix: string;
};
export function SegmentLabel(props: WheelLabelProps): ReactNode;
export function ActiveName(props: WheelLabelProps): ReactNode;

// FlavorWheelChart.tsx — the <svg>; the wrapper div with the wheel classes stays in FlavorWheel
export type FlavorWheelChartProps = {
  segments: WheelSegment<FlavorWheelNode>[];
  groupArcs: GroupArc[];
  total: number;
  activeId: string | null;
  idPrefix: string;
  legend: (node: FlavorWheelNode) => string;
  groupName: (id: string) => string;
  /** Pointer enter on a segment: the note becomes active. */
  onHover: (node: FlavorWheelNode) => void;
  /** Click on a segment: activate, toggling a parent's expansion. */
  onActivate: (node: FlavorWheelNode) => void;
};

// FlavorWheelPanel.tsx — the active note or the hint
export type FlavorWheelPanelProps = {
  active: FlavorWheelNode | null;
  legend: (node: FlavorWheelNode) => string;
  hint: string;
};

// FlavorWheelNoteList.tsx — the Collapsible with the role="tree" list; computes the tab stop (D6)
export type FlavorWheelNoteListProps = {
  rows: Row[];
  expanded: ReadonlySet<string>;
  activeId: string | null;
  /** The tree's accessible name (texts.label). */
  label: string;
  notesToggle: string;
  legend: (node: FlavorWheelNode) => string;
  registerRow: (id: string, element: HTMLLIElement | null) => void;
  /** Pointer enter or focus on a row: the note becomes active. */
  onHover: (node: FlavorWheelNode) => void;
  onActivate: (node: FlavorWheelNode) => void;
  onKeyDown: (event: KeyboardEvent<HTMLLIElement>, index: number) => void;
};

// flavor-wheel-keys.ts — APG Tree View keys plus Escape, one handler per key
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
/** Runs the key's effect; false for a key the tree does not handle (no preventDefault). */
export function handleTreeKey(key: string, context: TreeKeyContext): boolean;

// use-flavor-wheel-state.ts — the hooks of FlavorWheel in today's order (useState, useState, useId, useRef)
export type FlavorWheelState = {
  expanded: ReadonlySet<string>;
  activeId: string | null;
  idPrefix: string;
  setActiveId: (id: string) => void;
  setExpansion: (node: FlavorWheelNode, open: boolean) => void;
  toggle: (node: FlavorWheelNode) => void;
  activate: (node: FlavorWheelNode) => void;
  collapseAll: () => void;
  focusRow: (id: string) => void;
  registerRow: (id: string, element: HTMLLIElement | null) => void;
};
export function useFlavorWheelState(): FlavorWheelState;
```

The keyboard handlers keep today's effects key by key: Down and Up move to the next and previous visible row within bounds, Right expands a collapsed parent or focuses the first child of an expanded one, Left collapses an expanded parent or focuses the parent row, Home and End focus the first and last rows, Enter and Space toggle, Escape collapses every note and focuses the focused note's root; every handled key prevents the default, any other key does nothing.

### D3 — The wheel

`FlavorWheel` keeps `FlavorWheelProps` and its doc comment, calls `useFlavorWheelState` before the empty-state return as today, and composes inside the same `figure`, `figcaption` and layout wrappers: the wheel wrapper with `FlavorWheelChart`; the group legend list when grouped (kept inline, a few lines); `FlavorWheelPanel`; `FlavorWheelNoteList` inside the same `flex flex-col` wrapper. Its row key handler calls `handleTreeKey` and calls `event.preventDefault()` when it returns true. The layout and wheel class constants and the group legend class stay in `FlavorWheel.tsx`.

## Risks / Trade-offs

- [Markup or geometry changes by accident] → each task runs the protecting tests in both suites, which assert the segments, labels, panel, rows, tree attributes, tab stop and keys; verify reads the diff of each part against the removed block.
- [Hook order changes] → `useFlavorWheelState` calls the same hooks in the same order before the empty return, so React state is kept identically.
- [Inner blocks become components] → the DOM is the same; React adds a component boundary only, with no state of its own, so nothing observable changes.
- [Type-only import cycle between `FlavorWheel.tsx` and its parts] → `import type` is erased, so no runtime cycle exists.

## Migration Plan

One branch, no data migration. Rollback is reverting the change's commits.
