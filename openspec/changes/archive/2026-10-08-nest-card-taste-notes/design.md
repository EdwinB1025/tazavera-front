# Design

Sources: backlog R49 (`docs/backlog.md`, with Product owner's answers of 2026-10-08: the API delivers the consensus concordance as a resolved tree, rendered as it arrives; no cap on the notes); the settled layout of the design lead, relayed in the session brief; add-offering-catalog design D5 and D8 and fix-production-aut-findings design D1 (the resolution rules kept here). Fast lane: no design folder.

## Context

Current state on `develop`: `OfferingCard` (`src/entities/offering/ui/OfferingCard.tsx`) takes `taxonomies: ResolvedTaxonomyBadge[]` (flat `{ label, color, level }`) and renders three `div` rows, one per level (`ROWS_CLASSES`, `ROW_CLASSES`), keying each badge by its label. The flat list comes from `resolveTaxonomies(offering, lookup)`, written twice: `src/widgets/offering-list/lib/resolve-taxonomies.ts` (used by `Offerings.tsx`) and its copy `src/pages/manage-offerings/lib/resolve-taxonomies.ts` (used by `ManageOfferingsPanel.tsx`). Both walk `cataConcordance` depth first, skip a reference already seen, skip an unresolved reference while still walking its children, and take the badge level from the offering node's own `level`.

## Goals / Non-Goals

**Goals:** the card renders the concordance tree as nested lists with the layout below; one resolver in the `taxonomy` entity; both copies gone; the existing resolution rules kept.

**Non-Goals:** re-attaching notes under taxonomy parents, a cap, any change to `Badge`, tokens, texts or the flavor wheel.

## API

No new endpoint. `GET /offerings` (public) supplies `OfferingSummary.cataConcordance: OfferingTaxonomyNode[]` (`ref`, `type`, `level`, `count`, `children`), `GET /taxonomies` (public) the `TaxonomyNode` tree the existing `buildTaxonomyLookup` flattens. Errors are presented exactly as today (the list's and the panel's error states); the resolver is pure and raises none.

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/entities/taxonomy/model/taste-note-tree.ts` | entities (model) | New | `TasteNoteNode`, `buildTasteNoteTree` (D1) |
| `src/entities/taxonomy/model/taste-note-tree.test.ts` | entities (model) | Moved from `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` | Resolver cases (tasks 1, D1) |
| `src/entities/taxonomy/index.ts` | entities | Modified | Exports `buildTasteNoteTree` and `TasteNoteNode` |
| `src/entities/offering/ui/OfferingCard.tsx` | entities (ui) | Modified | `ResolvedTaxonomyBadge` with `ref` and `children`; nested lists (D2, D3) |
| `src/entities/offering/ui/OfferingCard.test.tsx` | entities (ui) | Modified | Tree fixture; "Nested trees" and "Trees side by side" cases |
| `src/widgets/offering-list/ui/Offerings.tsx` | widgets (ui) | Modified | Calls `buildTasteNoteTree` (D4) |
| `src/widgets/offering-list/lib/resolve-taxonomies.ts` | widgets (lib) | Deleted | (D4) |
| `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` | pages (ui) | Modified | Calls `buildTasteNoteTree` (D4) |
| `src/pages/manage-offerings/lib/resolve-taxonomies.ts` | pages (lib) | Deleted | (D4) |

No route file changes.

## Decisions

### D1 — One tree resolver in the taxonomy entity

`buildTasteNoteTree(offering: OfferingSummary, lookup: TaxonomyLookup): TasteNoteNode[]` lives in `src/entities/taxonomy/model/taste-note-tree.ts`, next to `flavor-wheel-nodes.ts`, and is exported from the slice index. Its type:

```ts
export type TasteNoteNode = {
  ref: string;
  label: string;
  color: string;
  level: 0 | 1 | 2;
  children: TasteNoteNode[];
};
```

The card's prop type `ResolvedTaxonomyBadge` (in `OfferingCard.tsx`) becomes the same shape (`ref`, `label`, `color`, `level`, `children: ResolvedTaxonomyBadge[]`), so the resolver's result passes to the card structurally, with no import between the two entity slices.

Rules, kept from today: only `offering.cataConcordance` is read, never `sensoryTaxonomy`; `level` is the offering node's own level (1 or 2, anything else 0); the tree is kept in the order the API delivers it, nothing is re-attached under a taxonomy parent. Each value once: a reference renders one node, at its first occurrence in tree order, and its children are the children of every occurrence of that reference, in order, each reference once across the whole result. Unresolved reference: a reference the lookup does not find renders no node, and its resolved children take its place among its siblings (today's resolvers also keep walking an unresolved node's children, so the "Unresolved reference" scenario keeps its outcome). An empty or absent concordance gives an empty array.

### D2 — Layout classes

The class constants replace `ROWS_CLASSES` and `ROW_CLASSES` in the same place of `CardContent`:

| Element | Classes |
|---|---|
| Tree list (top level) | `flex flex-wrap items-start gap-3` (no padding, border, radius or fill) |
| Tree (top-level item) | `flex flex-col items-start gap-2` |
| Level-1 list (only when the note has children) | `ml-5 flex flex-col items-start gap-2 border-l border-border-subtle pl-3` |
| Level-1 item | `flex flex-col items-start gap-1.5` |
| Level-2 row (only when the level-1 note has children) | `ml-5 flex flex-wrap gap-1.5` |

The connector is the left border on the existing `--color-border-subtle` token, decorative. Every badge is `<Badge variant="taxonomy" color level>` unchanged, one size at every depth (`BADGE_GEOMETRY_CLASSES`); depth shows through indentation, the connector and the badge's existing level opacity. The concordance tree has three levels (contract: levels 0–2), so the card renders three depths; level-2 items carry only their badge. With no top-level node, the tree list does not render. React keys are the reference, not the label. Contrast is unchanged: the backgrounds do not change and the design lead measured every taxonomy colour at 4.63:1 or more at every level in both themes. No new token, colour or text.

### D3 — Markup

The trees are nested `ul`/`li`, each `ul` with `role="list"` (Tailwind's list reset removes the implicit role in some browsers), so the hierarchy reaches assistive technologies: the top-level list holds one `li` per tree; a tree's `li` holds its badge and, when it has children, the level-1 `ul`; each level-1 `li` holds its badge and, when it has children, the level-2 `ul` of `li` items. The card stays a server-renderable component with no state, effect or handler, so no Next.js API is involved.

### D4 — Both copies go

`Offerings.tsx` and `ManageOfferingsPanel.tsx` call `buildTasteNoteTree(offering, lookup)` from `@/entities/taxonomy` in place of their local `resolveTaxonomies`. Both `lib/resolve-taxonomies.ts` files are deleted: after the switch neither adds anything. The widget's test file moves with the code it tests to `src/entities/taxonomy/model/taste-note-tree.test.ts`; its assertions change only to the tree shape the spec delta introduces. The QA copies under `qa/` that assert the old flat output are already excluded as stale in `vitest.qa.config.mts` and `tsconfig.json` and are not touched.

## Risks / Trade-offs

- Backlog R50: the API may return detached intermediate notes at the top level; by Product owner's decision the card renders them where the tree places them and does not adapt.
- A card with many top-level notes grows taller; Product owner ruled out a cap.
