# Design

## Context

Backlog R48 (production AUT findings 15, 16 and 17), with Product owner's corrections and the decisions the orchestrator settled with the design lead (ratios are the design lead's measurements). Today `src/shared/ui/FacetCascade.tsx` renders the offerings "Taste notes" facet as independent checkbox rows with a per-parent expand control (add-offering-facets D7); its only consumer is `src/features/offering-facets/ui/OfferingFacets.tsx` (the evaluations list does not use it). `src/shared/ui/DescriptorChipGroup.tsx` (`form-fields` "Descriptor chip group") already renders taxonomy chips: unchosen = data-colour dot and label, chosen = taxonomy badge with a check mark, one tab stop with arrow keys. The offerings score facet uses `SCORE_MIN = 0` in `src/features/offering-facets/model/query.ts`.

## Goals / Non-Goals

**Goals:** the taste-notes cascade with children shown only while their parent is chosen (15), drawn with the descriptor chip group (16), contrast-safe on the sidebar in both themes; the offerings score facet on 60–100 (17).

**Non-Goals:** no API or contract change; no change to `DescriptorChipGroup`, to the evaluations score facet (keeps 0–100), to the evaluation form's descriptors (R56) or to the offering card (R49); no new token, primitive, icon, contrast pair or dependency.

## API

No endpoint is added or changed. The facet keeps consuming what it already reads:

| Method | Path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/taxonomies` (existing server read of the offerings page) | none (public) | — | 200 `TaxonomiesPayload`; the options read `ulid`, `level`, `nameEs`/`nameEn`/`nameCa`, `children` and now also `color` of `TaxonomyNode` | failure → the facet renders disabled with "Options unavailable" (unchanged) |
| GET | `/offerings` (`listOfferings`, existing) | none | `cuppingAvgMin`/`cuppingAvgMax` (contract 0–100; the front now writes only 61–100 for the minimum and 60–99 for the maximum), `cataRef[]` (a parent plus its chosen children stays valid: exact ULIDs matched with OR) | unchanged | unchanged (the catalog's error state) |

Types: `TaxonomyNode` and `TaxonomiesPayload` from `@/shared/api` (generated). UI types change as in D5; no generated type is redefined.

## Decisions

### D1. Chip boundary on the sidebar

`border-muted` on `nav-surface-dark` fails 3:1 in the traditional theme (1.83). `src/app/styles/globals.css` adds `--color-border-muted: var(--color-border-inverse);` inside the `@utility variant-inverse` scope, which swaps tokens for the inverse surface (form-fields design D2). `border-inverse` on `nav-surface-dark` measures 3.41 (traditional) / 4.19 (dark); both pairs are already registered in the contrast matrix of `src/app/styles/theme-tokens.test.ts`, so no pair is added. Today only `DescriptorChipGroup` and `Textarea` use `border-muted`, neither inside an inverse scope, so nothing else changes.

### D2. Chosen-badge label on the sidebar (closed by the orchestrator for Product owner's review)

The taxonomy label colour (white/black) is chosen over the card surface; on the sidebar 11 seed level-1 notes fall to 3.96:1 (worst possible 3.79), breaking `feedback` "Badge label contrast". The taxonomy colour rule also computes the label over the sidebar surface of each theme:

- `src/shared/ui/taxonomy-color.ts` adds the sidebar surfaces, mirrored from `--color-nav-surface-dark` (traditional `#2E5A52` = `--color-sage-800`, dark `#112320` = `--color-night-sage-950`, both verified against `globals.css`), and `TaxonomyColorRule` gains `labelInverse` and `labelInverseDark`, chosen by the same luminance rule over those surfaces.
- `src/shared/ui/Badge.tsx` sets two more custom properties on the taxonomy badge: `--taxonomy-label-inverse` and `--taxonomy-label-inverse-dark`.
- `src/app/styles/globals.css` adds, after the two existing `[data-taxonomy]` rules, `.variant-inverse [data-taxonomy] { color: var(--taxonomy-label-inverse); }` and `[data-theme="dark"] .variant-inverse [data-taxonomy] { color: var(--taxonomy-label-inverse-dark); }`. The first has the specificity of `[data-theme="dark"] [data-taxonomy]` and wins by source order; the second is more specific than both.
- The existing drift check of `Badge.test.tsx` ("blends over the card surface that globals.css resolves in each theme") also pins the sidebar surfaces against the two `--color-nav-surface-dark` values of `globals.css`.

Worst case on the sidebar: 4.65:1 in both themes. These two hexes are the only hex values added outside the token files, as data the rule needs during render, like the card surfaces.

### D3. Children placement (L1')

`FacetCascade` builds the chip group's rows: the visible top-level chips go in untitled rows, broken right after each chosen parent that has children; after each break comes that parent's children row, titled with the parent's label. A children row exists only while its parent is chosen. `DescriptorChipGroup` is unchanged: no indent, no left rule. Each chip's level is its position: 0 for a top-level option, 1 for a child.

Cascade value rule: `DescriptorChipGroup` reports the next chosen set; `FacetCascade` drops the children of every parent that was chosen and is not in the next set, then reports the remaining ids in option order (each parent before its children). A chosen child whose parent was never chosen (only reachable through the URL) is not dropped: it is not shown in the facet, keeps its applied-filter chip and is still sent.

### D4. Layout

The facet root keeps `flex min-w-0 flex-col wrap-anywhere`. Inside it: a wrapper `<div id={…} className="px-3 pt-1">` around `DescriptorChipGroup` (legend `type-label mb-2`, rows `gap-3`, row title `type-meta block mb-1.5`, chips `flex flex-wrap gap-2`, chip shell `border-2 border-border-muted rounded-field` with no fill, content `BADGE_GEOMETRY_CLASSES`, all from the chip group itself); then `SeeMoreButton` as a sibling after the wrapper (its own `px-3 mt-1`), with `aria-controls` = the wrapper id. The "See more" rule counts top-level options: the first 5 plus every chosen parent stay visible. The help ("Options unavailable") is the chip group's own help (`type-meta mt-1`), inside the wrapper, so it starts at the legend's 0.75rem. The gap to neighbouring facets stays the panel's `gap-5`. `disabled` is passed to the chip group.

### D5. Removals and option data

The checkbox rows, the expand control, its local state and the `toggleChildren` text go. `FacetCascadeTexts` becomes `SeeMoreTexts`; `toggleChildren` is removed from `OfferingFilterTexts` (`src/features/offering-facets/model/texts.ts`) and from `messages/{es,en,ca}/filters.json`. `CascadeOption` becomes `FacetOption & { color: string; children?: (FacetOption & { color: string })[] }` (the level 0/1 of each chip follows from its position, D3). `tasteNoteOptions` in `src/features/offering-facets/model/options.ts` maps `node.color ?? ""` for parents and children, as `entities/taxonomy/model/descriptor-rows.ts` does.

### D6. Stale QA tests

The QA suite holds copies that assert the old cascade (`qa/src/shared/ui/FacetCascade.test.tsx`, `qa/src/shared/ui/facet-disabled.test.tsx`), the 0 lower bound (`qa/src/features/offering-facets/model/query.test.ts`) or the option shape without colour (`qa/src/features/offering-facets/model/options.test.ts`, `qa/src/features/offering-facets/model/applied.test.ts`). The build never edits their assertions and reports every failing one. The QA fixtures typed `CascadeOption[]` / `TasteNoteOption[]` without `color` stop typechecking, which would break `npx tsc --noEmit` and `npm run build`; each QA file that fails the typecheck for that reason only is added to the `exclude` list of `tsconfig.json`, as split-evaluation-row-card did for the other stale QA copies. The QA run's own exclusions (`vitest.qa.config.mts`) stay Product owner's decision.

### D7. Score scale

`SCORE_MIN` in `src/features/offering-facets/model/query.ts` becomes 60. It already drives the URL parser (a score outside 60–100 is dropped), `scoreRangeChanges` (a minimum of 60 or a maximum of 100 writes no key), the facet bounds and default value in `OfferingFacets.tsx` and the chip text in `applied.ts` (`{min}` defaults to 60). The evaluations facet has its own `SCORE_MIN = 0` in `src/features/evaluation-facets/model/query.ts` and is untouched.

## Files

| File | Layer | Change |
|---|---|---|
| `src/app/styles/globals.css` | app | D1 token swap in `variant-inverse`; D2 inverse label rules |
| `src/shared/ui/taxonomy-color.ts` | shared | D2 sidebar surfaces and inverse labels |
| `src/shared/ui/Badge.tsx` | shared | D2 two custom properties |
| `src/shared/ui/FacetCascade.tsx` | shared | D3, D4, D5 |
| `src/features/offering-facets/model/options.ts` | features | D5 colour mapping |
| `src/features/offering-facets/model/texts.ts` | features | D5 key removed |
| `src/features/offering-facets/model/query.ts` | features | D7 |
| `src/features/offering-facets/ui/OfferingFacets.tsx` | features | D5 texts prop |
| `messages/{es,en,ca}/filters.json` | — | D5 key removed |
| `tsconfig.json` | — | D6 |

## Risks / Trade-offs

- D2 adds two mirrored hex values; the drift check fails if `--color-nav-surface-dark` changes.
- D3 leaves a URL-only child without its parent applied but hidden from the facet; its chip still shows and removes it. Open for Product owner (Propose status).
- D6: `npm run test:qa` fails on the stale QA copies until Product owner applies the reduction plan; the build reports them.
