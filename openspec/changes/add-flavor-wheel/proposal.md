# Proposal

## Why

The offering detail's Consensus tab replaces its taste-profile tree with an interactive SCA-style flavor wheel showing the offering's aromatic consensus (decisions log, "catálogo: detalle y consenso; filtros: cascada y división"). `add-offering-catalog` depends on this wheel but does not build it: the reusable piece — wheel, its keyboard-operable note list and the API-to-wheel data mapping — lands here first, in-house as SVG with no new dependency (the orchestrator's decision in the log entry), so the catalog only places it and passes resolved data.

## What Changes

- **An interactive flavor wheel** in `src/shared/ui`: an SCA-style sunburst where each segment is one olfactory-taxonomy note, the rings expand from the centre outward one level at a time, every note's legend is "evaluators who identified it / total" (for example `4/5`), and hovering a note — or giving it keyboard focus — shows its olfactory-taxonomy description in a fixed panel.
- **A text alternative of the wheel**: a keyboard-operable note list (WAI-ARIA APG Tree View pattern) with name, colour swatch and `n/total` per note, so colour is never the only carrier and every note is reachable even when its segment is too small for a label. Escape collapses everything back to the centre and returns focus to the outer note.
- **The data mapping** from the API to the wheel: a pure helper `buildFlavorWheelNodes` in `src/entities/taxonomy`, plus a localized `description` added to the taxonomy lookup it resolves through. Unresolved references (and empty-colour nodes) are skipped with their subtrees.
- **One shared taxonomy colour rule**: the badge's data-colour rule (depth opacities and the white/black label choice) is extracted from `Badge.tsx` into one shared helper consumed by the badge, the wheel's segments and its swatches. No visible change: the badge's rendered output and `Badge.test.tsx` stay exactly as they are.
- **Specification**: `feedback` gains the requirements "Flavor wheel" (sunburst, legends, description panel, states) and "Flavor wheel note list" (text alternative, keyboard tree pattern, Escape) with their scenarios.

No breaking changes: nothing already rendered changes; the lookup's new `description` field is additive and no generated API type is edited or redefined.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `feedback`: adds the requirements "Flavor wheel" and "Flavor wheel note list" with their scenarios. The wheel's segment and label colours follow the same taxonomy colour treatment the existing "Taxonomy badge" and "Badge label contrast" requirements state; those two and the other existing requirements (Badge presentation, Rating badge, Verification status badge, Shared chip geometry) keep their meaning unchanged.

## Out of Scope (non-goals)

- **Placing the wheel in the offering detail's Consensus tab.** `add-offering-catalog` owns the screen: it replaces its "Taste profile card" tree with the wheel and passes `cataConcordance`, `evaluationCount` and the texts.
- **Defects and main tastes.** They use the evaluation's selector components read-only with consensus legends (decisions log), in `add-offering-catalog`. The wheel covers the aromatic set only.
- **`sensoryTaxonomy`.** Per CVA attribute and counts the same evaluator once per attribute; the wheel reads `cataConcordance`'s `aromatics` group only.
- **Message catalog keys.** The component takes its texts as props and owns no catalog area; `add-offering-catalog` adds the keys as the host (Open 10).
- Zoom, animation, export and printing.
- Any dependency change and any change to the API or `contracts/openapi.yaml`.

## Impact

- **Code (all under `src/`)**: new — `src/shared/ui/FlavorWheel.tsx`, `src/shared/ui/FlavorWheel.test.tsx`, `src/shared/ui/flavor-wheel-geometry.ts`, `src/shared/ui/flavor-wheel-geometry.test.ts`, `src/shared/ui/taxonomy-color.ts`, `src/entities/taxonomy/model/flavor-wheel-nodes.ts`, `src/entities/taxonomy/model/flavor-wheel-nodes.test.ts` (FSD layers `shared` and `entities`). Modified — `src/shared/ui/Badge.tsx`, `src/shared/ui/index.ts`, `src/shared/ui/index.test.tsx`, `src/entities/taxonomy/model/lookup.ts`, `src/entities/taxonomy/model/lookup.test.ts`, `src/entities/taxonomy/index.ts`.
- **Dependencies**: none. No dependency is added, removed or upgraded; the sunburst is drawn in-house as SVG.
- **API**: consumed read-only through the host — `GET /offerings/{offering_ulid}` (`getAnOffering`: `evaluationCount`, `cataConcordance[]` of type `aromatics`) and `GET /taxonomies` (`listOlfactoryTaxonomies`: names, descriptions, colours). The component calls no operation. `src/shared/api/schema.ts` is untouched.
- **Existing behavior**: unchanged. Every badge renders exactly as on `develop`; the lookup only gains `description`; `add-offering-catalog` gains the wheel it waits for.
