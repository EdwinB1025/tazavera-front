# Design

Sources: backlog R56 with Product owner's answers of 2026-10-08 (O1 drafts choose ancestors, O2 read-only views, level-2 rows without indent) and the design lead's decisions relayed in the session brief; the archived designs of R48 (`refine-offering-facets-aut`, D3–D6) and R49 (`nest-card-taste-notes`, D1–D3). Fast lane: no design folder.

## Context

On `develop`, `src/shared/ui/FacetCascade.tsx` (R48) builds chip rows for a two-level cascade (`cascadeRows`, `cascadeValue`) over `DescriptorChipGroup`. The evaluation form builds a different row set twice: `src/entities/taxonomy/model/descriptor-rows.ts` (`buildDescriptorRows`, used by the evaluation sheet and the consensus panel) and a private copy in `src/pages/evaluation-form/ui/DescriptorBlock.tsx`: one row per level-0 node titled with it and holding its level-1 children, a shared row of the childless roots, level 2 never. R49's `buildTasteNoteTree` resolves an offering's `cataConcordance` against the lookup; it reads no category and does not walk `GET /taxonomies`, so it cannot provide the descriptor tree; the new builder sits next to it in the same slice.

## Goals / Non-Goals

**Goals:** one cascade model and one cascade component in `shared/ui`, used by the offerings facet and the four evaluation blocks; levels 0–2; read-only cascade in the read-only form and the evaluation sheet; drafts choose ancestors on load.

**Non-Goals:** the consensus panel (R62), the card trees (R49), the facet's levels and "See more"; no token, contrast pair, text, icon or dependency.

## API

No endpoint is added or changed.

| Method | Path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/taxonomies` (existing server reads of the form, the evaluation view and the offerings page) | none | — | 200 `TaxonomiesPayload`; the tree reads `ulid`, `level`, `name*`, `color`, `categories`, `children` of `TaxonomyNode` | unchanged: the form and view show their existing error states; the facet renders disabled with "Options unavailable" |
| POST/PUT | `/evaluations`, `/evaluations/{ulid}` (existing draft save and close) | bearer | `descriptive.{axis}.cata`, `descriptive.mainTastes`, `affective.defects`: arrays of taxonomy ULIDs, now possibly level 2 (`exists:olfactory_taxonomies,ulid` accepts any level) | unchanged | unchanged (the form's existing 403/409/422/failure messages) |
| GET | `/evaluations/{ulid}` (existing) | bearer or none | — | `EvaluationItem.tastes[]` (`ref`, `type`), flat | unchanged |

Types: `TaxonomyNode`, `EvaluationItem` from `@/shared/api`. UI types below.

## Decisions

### D1. Cascade model (`src/shared/ui/descriptor-cascade.ts`)

```ts
export type CascadeNode = {
  value: string;
  label: string;
  color: string;
  level: 0 | 1 | 2;
  children: CascadeNode[];
};
```

- `cascadeRows(nodes: CascadeNode[], isOpen: (node: CascadeNode) => boolean): ChipRow[]` extends R48's rows to level 2: the level-0 chips in untitled rows, broken right after each open node with children; then that node's children row titled with its label (level-1 rows are never broken); then, for each open level-1 child with children, in order, a row titled with that child's label holding its level-2 chips. Row ids: `line-<value>`, `children-<value>` and `line-end`, as in R48. No indent at any level (Product owner): every row takes the chip group's own row classes.
- `cascadeValue(nodes: CascadeNode[], next: string[]): string[]`: a node stays chosen only while it and every ancestor are in `next`; the result lists the chosen nodes in tree order (depth first, parent before its children). Values not in the tree are dropped.

`ChipOption.level` in `DescriptorChipGroup.tsx` widens to `0 | 1 | 2` (the `Badge` already takes level 2); nothing else in the chip group changes.

### D2. Cascade component (`src/shared/ui/DescriptorCascade.tsx`)

Props: `legend`, `nodes: CascadeNode[]`, `value: string[]`, optional `disabled`, `help`, `error`, `emptyText`, and the chip group's `readOnly` / `onValueChange` union. It renders `DescriptorChipGroup` over `cascadeRows`:

- editable: a node is open while it is chosen; `onValueChange(next)` reports `cascadeValue(nodes, next)`;
- read-only: a node is open when it or a descendant is chosen; the chip group's read-only mode then keeps only the chosen badges and drops empty rows, so a chosen child of an unchosen parent sits in the row titled with the parent.

Keyboard and ARIA are the chip group's: one tab stop, arrows in DOM reading order (revealed chips join it), `aria-pressed`, titled rows `role="group"` with `aria-labelledby`. Layout and contrast are unchanged: rows `gap-3`, row title `type-meta mb-1.5 block`, chips `flex flex-wrap gap-2`, chip `border-2 border-border-muted rounded-field`, one badge size. The client boundary is the chip group's (`"use client"`); no Next.js API is involved.

### D3. Offerings facet

`FacetCascade` keeps its props and renders `DescriptorCascade` (editable) plus `SeeMoreButton`; its private `cascadeRows` and `cascadeValue` go. `CascadeOption` stays the facet's input type (two levels, colour optional, R48 D5) and `FacetCascade` maps the visible options to `CascadeNode` (level by depth, `color ?? ""`, `children ?? []`). Renaming it to `CascadeNode` would make the R48 validation fixtures and the QA fixtures typed `CascadeOption[]` (without `level`/`children`) fail the typecheck (R48 D6 precedent: QA fixtures keep typechecking). The facet's behaviour and R48's tests are unchanged, except the URL-only child (R48 D3): it now follows D1's value rule and is dropped on the facet's next change (open for Product owner).

### D4. Descriptor tree builder (`src/entities/taxonomy/model/descriptor-tree.ts`)

`buildDescriptorTree(nodes: TaxonomyNode[], category: string, locale: string): CascadeNode[]`: the nodes whose `categories` contain the category, walked from the roots: a node is offered only when its parent is offered (a root needs only the category), so a matching child of a non-matching root is not offered; levels by depth (0, 1, 2), label in the locale, `color ?? ""`, API order. Exported from the slice index. Every block, mouthfeel included, starts from its roots (MVC). `buildDescriptorRows` stays only for the consensus panel's `AxisDetail` and `SelectionBlock` until R62 (`nest-consensus-notes`, next in this package) removes them and it; this change therefore leaves the consensus panel as it is.

### D5. Evaluation form blocks

`DescriptorBlock` keeps its props and renders `DescriptorCascade` over `buildDescriptorTree(nodes, category, locale)`, editable or read-only; its private row builder goes. All four blocks (main tastes, the aromatics block of each pair, mouthfeel, defects) use it.

### D6. Evaluation sheet

`EvaluationSheet` renders each block as a read-only `DescriptorCascade` over `buildDescriptorTree`, with the same legend, value and empty text. It calls `formStateFromEvaluation` without the tree (D7), so the sheet shows exactly what was saved.

### D7. Drafts choose ancestors

`formStateFromEvaluation(item, roastLevel, taxonomies: TaxonomyNode[] = [])` in `src/entities/evaluation/model/load.ts`: after mapping `tastes` by type, each selection gains, for every chosen ref, every ancestor found in `taxonomies` (walking `TaxonomyNode.children`; the slice imports only `@/shared/api`), each once, before the ref. `initialFormModel(offering, evaluation, taxonomies)` passes the tree only when the form opens editable (not closed); `useEvaluationForm` takes `taxonomies` and `EvaluationForm` passes the tree it already holds. A closed evaluation, in the read-only form or the sheet, shows what was saved.

### D8. Tests and stale QA copies

Validation: a new `DescriptorCascade.test.tsx` (one test per "Descriptor cascade" scenario), a new `descriptor-tree.test.ts`, updated `DescriptorBlock.test.tsx`, one new case in `load.test.ts`, one updated case in `EvaluationSheet.test.tsx`; `FacetCascade.test.tsx` is unchanged. QA: `qa/src/pages/evaluation-form/ui/DescriptorBlock.test.tsx` asserts the old rows and may go stale; the build never edits QA files and reports every failing QA test.

## Files

| File | Layer | Change |
|---|---|---|
| `src/shared/ui/descriptor-cascade.ts` | shared | New (D1) |
| `src/shared/ui/DescriptorCascade.tsx` | shared | New (D2) |
| `src/shared/ui/DescriptorChipGroup.tsx` | shared | Chip level 0–2 (D1) |
| `src/shared/ui/FacetCascade.tsx` | shared | Renders `DescriptorCascade` (D3) |
| `src/shared/ui/index.ts` | shared | Exports `DescriptorCascade`, `CascadeNode` |
| `src/entities/taxonomy/model/descriptor-tree.ts` | entities | New (D4) |
| `src/entities/taxonomy/index.ts` | entities | Exports `buildDescriptorTree` |
| `src/entities/evaluation/model/load.ts` | entities | Ancestors (D7) |
| `src/pages/evaluation-form/ui/DescriptorBlock.tsx` | pages | D5 |
| `src/pages/evaluation-form/model/form-model.ts`, `use-evaluation-form.ts` | pages | Tree passed on editable load (D7) |
| `src/pages/evaluation-form/ui/EvaluationForm.tsx` | pages | Passes `taxonomies` to the hook (D7) |
| `src/widgets/evaluation-sheet/ui/EvaluationSheet.tsx` | widgets | D6 |

No route file changes.

## Risks / Trade-offs

- A draft ref no longer in the taxonomy tree is dropped from its selection on the next change of that block (D1 drops values not in the tree); before, it stayed.
- A taxonomy whose child matches a category its root does not is no longer offered in that block (D4, settled rule).
- D3: the facet's URL-only child is dropped on the facet's next change.
