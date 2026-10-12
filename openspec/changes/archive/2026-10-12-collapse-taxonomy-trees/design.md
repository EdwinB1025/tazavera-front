## Context

See proposal.md (Why) and backlog entry R77, whose settled end state (points 1–7) this design implements. Current state:

- `src/shared/ui/TaxonomyTree.tsx` (shared, server-safe, no `"use client"`) renders every level at once: a `role="list"` `ul` of trees (`TREES_CLASSES`), each top-level `li` (`TREE_CLASSES`) with its `NoteBadge` and a level-1 `ul` (`COLUMN_CLASSES`, connector), each level-1 `li` (`COLUMN_ITEM_CLASSES`) with its `NoteBadge` and a level-2 `ul` (`ROW_CLASSES`), the level-2 `li` holding only its `NoteBadge`. Given a `total`, `NoteBadge` wraps the badge and its `name count/total` share in one row (`SHARE_CLASSES`).
- Its three consumers: `src/entities/offering/ui/OfferingCard.tsx` (entity, no `total`), `src/widgets/offering-detail/ui/SelectionBlock.tsx` and `src/widgets/offering-detail/ui/AxisDetail.tsx` (widget, with `total`).
- Card texts come from the `landing` catalog through `OfferingCardTexts`, built by `src/pages/home/ui/HomeScreen.tsx` (via `OfferingListTexts`), `src/pages/offerings/ui/OfferingsScreen.tsx`, `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx` and `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx`. The Consensus texts come through `ConsensusPanelTexts` (which intersects `SelectionBlockTexts` and `AxisDetailTexts`), built by `detailTexts` in `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`, which already reads card texts from `landing`.
- Templates with a placeholder arrive raw from the catalog and are filled in the component with `.replace("{…}", value)` (`SeeMoreButton`, `Pagination`).
- The `client-boundary` guard requires `"use client"` as the first statement of any `src/shared/ui` file using a hook or an `onX` handler.

## Goals / Non-Goals

**Goals:** R77 points 1–7 in the three places the tree appears, with one shared implementation.

**Non-Goals:** no change to `Badge`, `Collapsible`, the flavor wheel, the tree resolvers of `@/entities/taxonomy`, tokens, requests or dependencies.

## Decisions

### D1 — One catalog pair, in `landing`

`messages/{es,en,ca}/landing.json` gain `treeShowNotesLabel` and `treeHideNotesLabel`, each with a `{label}` placeholder:

| Locale | `treeShowNotesLabel` | `treeHideNotesLabel` |
|---|---|---|
| es | `Mostrar las notas de {label}` | `Ocultar las notas de {label}` |
| en | `Show the notes under {label}` | `Hide the notes under {label}` |
| ca | `Mostra les notes de {label}` | `Amaga les notes de {label}` |

The card and the Consensus tab use the same pair: the offering detail already reads its card texts from `landing`, so no `catalog` key is added.

### D2 — Texts type and the path of the texts

`src/shared/ui/TaxonomyTree.tsx` exports `TaxonomyTreeTexts`:

```ts
export type TaxonomyTreeTexts = {
  /** Accessible name of a closed note's toggle; holds `{label}`. */
  showNotesLabel: string;
  /** Accessible name of an open note's toggle; holds `{label}`. */
  hideNotesLabel: string;
};
```

`TaxonomyTreeProps` gains a required `texts: TaxonomyTreeTexts`; `src/shared/ui/index.ts` exports the type. `OfferingCardTexts`, `SelectionBlockTexts` and `AxisDetailTexts` each intersect `TaxonomyTreeTexts`, and each consumer passes its own `texts` object to the tree. The five screens of Context map `showNotesLabel: landing.treeShowNotesLabel` and `hideNotesLabel: landing.treeHideNotesLabel` (`catalog` in `HomeScreen`, which names its `landing` catalog so). Test fixtures typed with these texts types gain the two fields (fixture values only, no assertion changes).

### D3 — The tree becomes a client component with one open state per note

`TaxonomyTree.tsx` starts with `"use client"`. One recursive note item replaces the three nested maps; it keeps today's DOM for each level once open: the top-level `li` with `TREE_CLASSES` and a child `ul` with `COLUMN_CLASSES`, the level-1 `li` with `COLUMN_ITEM_CLASSES` and a child `ul` with `ROW_CLASSES`, the level-2 `li` with no class, every `ul` with `role="list"` and each child `ul` a direct child of its parent's `li`.

- Each note with children holds its own open state, `false` on first render (R77 points 1, 3). Nothing is stored, routed or fetched (point 6).
- The note's row: the badge, then (with a `total`) its share, then the toggle, in one `SHARE_CLASSES` row. A note without children renders exactly as today (the bare badge, or the badge-and-share row). A note with children and no `total` (the card) renders its badge and toggle in a `SHARE_CLASSES` row (point 2).
- The child list stays rendered while its note is closed, with the `hidden` attribute, so the toggle's `aria-controls` always resolves to it (its id from `useId`); while closed it shows nothing and is absent from the accessibility tree.
- Closing a note returns every descendant to closed, so reopening shows only its direct children, closed (point 4). The mechanism is the build's choice (for example remounting the child list on close).
- The file stays within the size limits: the component, the note item and the badge row are separate functions of at most 80 lines; the toggle lives in its own file (D4).

### D4 — The toggle button

`src/shared/ui/TaxonomyTreeToggle.tsx` (new, shared, `"use client"`): props `open: boolean`, `controls: string` (the child list's id), `label: string` (the note's label), `onToggle: () => void`, `texts: TaxonomyTreeTexts`. It renders a `button` with `type="button"`, `aria-expanded={open}`, `aria-controls={controls}`, `aria-label` = `hideNotesLabel` (open) or `showNotesLabel` (closed) with `{label}` replaced by the note's label, `onClick={onToggle}`, and one child `<span aria-hidden="true">` holding `+` (closed) or `−` (U+2212 MINUS SIGN, open). No `disabled` (point 5).

Classes (existing semantic tokens and utilities only; no new token or colour value): `inline-flex size-6 shrink-0 items-center justify-center rounded-field border border-border-subtle type-button text-text-primary hover:bg-surface-section focus-visible:focus-ring`. The 24px target matches the minimum target size; `hover:bg-surface-section` is the hover the flavor wheel's note rows already use on the card surface.

### D5 — Server and client boundary

The consumers stay as they are (the card and both widgets are rendered from server screens); they import the client tree through `@/shared/ui` as `Collapsible` already is. Every prop crossing the boundary is serialisable: the resolved notes, the optional `total` and the two strings.

## Risks / Trade-offs

- [QA tests that query child notes by role, or click them, see them hidden until opened] → per R77 "Tests", the build adds the clicks that open the tree in those QA tests, keeping their assertions, and lists each in its final report.
- [QA text fixtures typed with `OfferingCardTexts`, `OfferingListTexts`, `ConsensusPanelTexts` or `OfferingDetailTexts` fail the typecheck without the two new fields] → the build adds the two fields to those fixtures (values only) and lists each file in its final report; production types are not loosened.
