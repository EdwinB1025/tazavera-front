Type: Refactor (fast lane)

# Proposal

## Why

Production AUT findings 15, 16 and 17 (backlog R48). The fast-lane typing is Product owner's (standing rule for AUT findings, maximum priority); unlike a behaviour-keeping refactor, this change **changes observable behaviour by Product owner's decision**: it replaces the settled `filtering` requirement "Taxonomy cascade facet" with "Taxonomy chip cascade facet" (OpenSpec refuses a MODIFIED block that drops scenarios, so the old requirement is REMOVED and the new one ADDED), modifies "Facet rows", "Offering facets in the sidebar" and "Offering filter state in the URL", and the `feedback` requirement "Taxonomy badge", so it updates those specs, adds one test per new or modified scenario and updates the assertions of the existing tests that assert the old behaviour.

- **15:** in the offerings "Taste notes" facet, a parent's children must render only while the parent is chosen, and unchoosing the parent must also unchoose its children; today checkboxes are independent and a separate control expands each parent.
- **16:** the taste notes must look like the offering card's taxonomy badges, reusing the descriptor chip group; today they are checkbox rows.
- **17:** the offerings "Average score" facet must run from 60 to 100; today it runs from 0 to 100.

## What Changes

- The taste-notes cascade facet renders its options as a descriptor chip group in the inverse variant: top-level chips in rows broken after each chosen parent, and that parent's children in a row titled with its label, only while it is chosen. Choosing a parent shows its children unchosen; unchoosing it hides and unchooses them. The separate expand control and its `toggleChildren` text (es, en, ca) are removed.
- Unchosen chips show the taxonomy's data-colour dot before the label; chosen chips show the option's taxonomy badge with a check mark. Each option carries its taxonomy colour.
- On the sidebar the chip boundary takes the inverse boundary token, and the taxonomy badge label is chosen over the sidebar surface inside the inverse variant, so chips and badges keep their contrast on the dark sidebar in both themes.
- The offerings Average score facet, its URL limits and its chip run from 60 to 100; with no score filter nothing is sent and the facet shows 60–100.

## Non-goals

- No API or contract change: the contract allows 0–100 for `cuppingAvgMin`/`cuppingAvgMax`, and sending a parent with its chosen children stays valid (exact ULIDs matched with OR).
- No change to the evaluations score facet (keeps 0–100) or to any facet other than Average score and Taste notes.
- No change to the descriptor chip group component or to the evaluation form's descriptors (R56).
- No new token, colour primitive, icon, contrast-matrix pair or dependency.
- No change to the offering card's taste notes (R49).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: the taxonomy cascade facet becomes a chip cascade (children shown only while their parent is chosen); facet rows no longer cover the cascade facet; the offerings Average score facet runs from 60 to 100.
- `feedback`: the taxonomy badge label is chosen over the surface it renders on, the sidebar surface inside the inverse variant.

## Impact

- Code: `src/shared/ui/FacetCascade.tsx`, `src/shared/ui/Badge.tsx`, `src/shared/ui/taxonomy-color.ts`, `src/app/styles/globals.css`, `src/features/offering-facets/model/options.ts`, `src/features/offering-facets/model/query.ts`, `src/features/offering-facets/model/texts.ts`, `src/features/offering-facets/ui/OfferingFacets.tsx`, `messages/{es,en,ca}/filters.json`.
- Tests (validation suite): `src/shared/ui/FacetCascade.test.tsx`, `src/shared/ui/facet-disabled.test.tsx`, `src/shared/ui/Badge.test.tsx`, `src/features/offering-facets/model/query.test.ts`, `src/features/offering-facets/model/options.test.ts`, `src/features/offering-facets/ui/OfferingFacets.test.tsx`.
- QA suite: tests that assert the old cascade or the 0 lower bound go stale (design.md D6); they are reported, never edited.
- APIs, dependencies: none.

## Propose status

- **Change-id:** refine-offering-facets-aut
- **Date:** 2026-10-08
- **`openspec validate refine-offering-facets-aut --strict`:** valid
- **Backlog entry resolved:** R48 — Offering facets: cascade, taste-note chips and score scale (production AUT findings 15, 16 and 17)
- **Resolved:** the chip boundary on the sidebar (design.md D1); the chosen-badge label over the sidebar surface (D2, closed by the orchestrator for Product owner's review); the children placement and cascade value rule (D3); the layout (D4); the removals and option colour (D5); the stale QA copies (D6); the score scale (D7). The requirement "Taxonomy cascade facet" is replaced by "Taxonomy chip cascade facet" because OpenSpec refuses a MODIFIED block that drops scenarios.
- **Open (Product owner):** (1) D2 awaits Product owner's review. (2) D3: a `cataRef` child in the URL without its parent stays applied and sent, hidden from the facet, with its removable chip; confirm, or decide that such a child is dropped. (3) D6: whether the stale QA copies are excluded from the QA run or rewritten in the reduction plan. (4) Whether finding 15 also applies to the evaluations taste-notes facet (R48 "Affects"); the evaluations list does not use `FacetCascade` today, so nothing changes there. None blocks the build.
