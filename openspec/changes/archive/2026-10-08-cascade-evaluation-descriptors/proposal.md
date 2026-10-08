Type: Refactor (fast lane)

# Proposal

## Why

Production AUT finding 24 (backlog R56). The fast-lane typing is Product owner's (standing rule for AUT corrections, maximum priority); unlike a behaviour-keeping refactor, this change **changes observable behaviour by Product owner's decision**: the evaluation form's descriptor selectors must work like the MVC cascade (`descriptor-cascade.blade.php`). Today each block shows one row per level-0 node with its level-1 children always visible (the root only a row title, never selectable), one shared row of the childless roots, and level 2 never (add-offering-catalog D13, `evaluations` "Descriptor blocks"). The API accepts any taxonomy ULID in `cata`, `mainTastes` and `defects` (`exists:olfactory_taxonomies,ulid`) and the consensus carries level 2, so every level is shown. The cascade R48 built for the offerings taste-notes facet is the model; it becomes one shared piece instead of a second copy.

## What Changes

- A shared descriptor cascade (`src/shared/ui/descriptor-cascade.ts`, `src/shared/ui/DescriptorCascade.tsx`) over the existing descriptor chip group: every level-0 node is a chip; a node's children render only while it is chosen (levels 0–2); choosing a node adds only that node; unchoosing removes it and all its descendants; the read-only cascade shows the chosen nodes, each under its parent's title (design.md D1, D2).
- The offerings taste-notes facet renders the shared cascade; its behaviour and tests are unchanged (design.md D3).
- `entities/taxonomy` builds the cascade tree of one category (`buildDescriptorTree`), replacing the row builder in the evaluation form (the copy inside `DescriptorBlock.tsx`) and in the evaluation sheet; `buildDescriptorRows` keeps only the consensus panel's two callers, which R62 (`nest-consensus-notes`, next in this package) removes together with it (design.md D4).
- All four form blocks (main tastes, aromatics per pair, mouthfeel, defects) use the cascade, levels 0–2; the read-only form and the evaluation sheet use the read-only cascade (design.md D5, D6).
- Loading a saved draft whose child is chosen without its parent also chooses every ancestor (design.md D7).
- Spec: `form-fields` adds "Descriptor cascade"; `evaluations` modifies "Descriptor blocks" and "Read-only evaluation presentation".

## Non-goals

- No API or contract change; no new token, contrast pair, icon, text or dependency; no change to the chip look, keyboard or ARIA of the descriptor chip group.
- No change to the offerings facet's levels (level 0 and 1) or to its "See more" rule.
- The consensus panel of the offering detail (R62, `nest-consensus-notes`) and the offering card trees (R49) are not touched.
- No change to completeness, draft save or close payloads beyond the chosen set the cascade reports.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `form-fields`: adds the descriptor cascade (children shown only while their parent is chosen, levels 0–2, read-only cascade).
- `evaluations`: the descriptor blocks offer levels 0–2 as a cascade and a draft load chooses ancestors; the read-only presentation shows levels 0–2 as a read-only cascade.

## Impact

- Code: `src/shared/ui/descriptor-cascade.ts` (new), `src/shared/ui/DescriptorCascade.tsx` (new), `src/shared/ui/DescriptorChipGroup.tsx` (chip level 0–2), `src/shared/ui/FacetCascade.tsx`, `src/shared/ui/index.ts`, `src/entities/taxonomy/model/descriptor-tree.ts` (new), `src/entities/taxonomy/index.ts`, `src/entities/evaluation/model/load.ts`, `src/pages/evaluation-form/ui/DescriptorBlock.tsx`, `src/pages/evaluation-form/model/form-model.ts`, `src/pages/evaluation-form/model/use-evaluation-form.ts`, `src/pages/evaluation-form/ui/EvaluationForm.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheet.tsx`.
- Tests (validation suite): `src/shared/ui/DescriptorCascade.test.tsx` (new), `src/entities/taxonomy/model/descriptor-tree.test.ts` (new), `src/pages/evaluation-form/ui/DescriptorBlock.test.tsx`, `src/entities/evaluation/model/load.test.ts`, `src/widgets/evaluation-sheet/ui/EvaluationSheet.test.tsx`.
- QA suite: copies asserting the old rows go stale (design.md D8); reported, never edited.
- APIs, dependencies: none.

## Propose status

- **Change-id:** cascade-evaluation-descriptors
- **Date:** 2026-10-08
- **`openspec validate cascade-evaluation-descriptors --strict`:** valid
- **Backlog entry resolved:** R56 — Evaluation form descriptors as the MVC cascade (production AUT finding 24)
- **Resolved (settled by Product owner and the design lead, recorded in design.md):** level 2 shown in every block (D4); one shared cascade model and component in `shared/ui` (D1, D2); the offerings facet renders it (D3); rows with no indent at level 2 (D1); drafts choose ancestors on load (O1, D7); read-only views as the read-only cascade (O2, D6); mouthfeel root-first like every block (D4); keyboard, ARIA, layout and contrast unchanged (D2).
- **Resolved by the architect:** (1) D3 keeps `CascadeOption` as the facet's input type and maps it to `CascadeNode` inside `FacetCascade`, instead of renaming it, so the R48 validation tests and the QA fixtures typed `CascadeOption[]` keep typechecking (R48 D5/D6 precedent). (2) D7 applies the ancestor rule to an editable load only; a closed evaluation is shown as saved. (3) D4 leaves `buildDescriptorRows` to the consensus panel until R62 replaces that panel's rows, so this change does not alter the consensus panel.
- **Open (Product owner):** (1) O2 says "reuse R49's tree rendering" for the read-only views; the settled spec scenario ("a chosen child without its chosen parent sits under its parent's title") is the read-only cascade's titled rows, which this change uses; the nested-list tree of R49 is reused by R62 for the consensus panel. Confirm. (2) The facet's URL-only child (R48 D3, kept hidden and applied) now follows the shared value rule and is dropped on the facet's next change. None blocks the build.
