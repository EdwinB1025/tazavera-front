Type: Refactor (fast lane)

# Proposal

## Why

Unlike a behaviour-keeping refactor, this change modifies observable behaviour by Product owner's decision (production AUT finding 18, 2026-10-08; backlog R49): the offering card shows its taste notes in three flat rows by level (`src/entities/offering/ui/OfferingCard.tsx`; `landing` spec "Taxonomy badges on the offering card", scenario "Rows by level"), which hides which note belongs to which. The notes must render as nested trees, each top-level note with its children (and theirs) nested under it, the trees side by side and wrapping. Product owner settled that the API delivers the consensus concordance as a resolved tree, so the card renders that tree as it arrives, with no cap on the number of notes. The same badge resolution is also duplicated line for line in `src/widgets/offering-list/lib/resolve-taxonomies.ts` and `src/pages/manage-offerings/lib/resolve-taxonomies.ts`; the tree resolver is written once in the `taxonomy` entity and both copies go.

## What Changes

- The card's taxonomy badges render as nested lists following the concordance tree: one tree per top-level note, its children in an indented column behind a left connector line, their children in an indented wrapping row below each child; the trees sit side by side and wrap (design.md D2, D3).
- A single tree resolver in `src/entities/taxonomy/model/taste-note-tree.ts` turns the offering's `cataConcordance` into the card's badge tree, keeping the current rules: consensus only, each value once (a repeated reference renders at its first occurrence with the children of every occurrence under it), unresolved references render no badge, no consensus renders no badge (design.md D1).
- `ResolvedTaxonomyBadge` (the card's prop type) gains the reference and the children, matching the resolver's type structurally (design.md D1).
- Both `resolve-taxonomies.ts` copies are deleted; the offering list and the manage-offerings panel call the shared resolver (design.md D4).
- **BREAKING (spec):** requirement "Taxonomy badges on the offering card" is replaced by "Taxonomy badge trees on the offering card": scenario "Rows by level" gives way to "Nested trees", scenarios "Trees side by side" and "Repeated reference keeps its children" are added, and the other five scenarios are kept word for word.

## Out of scope (non-goals)

- Evaluation data (which arrives flat) and any front-side re-attachment of notes under their taxonomy parents; the R50 API defect (detached intermediate notes) is not worked around.
- A cap on the number of notes or on the card's height.
- The badge component, its sizes, colours, level opacity and contrast; no new token, colour or text.
- The flavor wheel, the descriptor rows and the consensus panel of the offering detail.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: requirement "Taxonomy badges on the offering card" REMOVED and ADDED again as "Taxonomy badge trees on the offering card" (nested trees replace rows by level). The brief asked for a MODIFIED requirement; the OpenSpec CLI rejects a MODIFIED block that drops a scenario ("Rows by level") and a requirement both removed and added under one name, so the requirement takes a new name with the brief's wording.
- `offering-catalog`: no spec delta; the manage-offerings panel switches to the shared resolver (commit scope only).

## Impact

- **Code:** new `src/entities/taxonomy/model/taste-note-tree.ts` (entities); modified `src/entities/taxonomy/index.ts`, `src/entities/offering/ui/OfferingCard.tsx` (entities), `src/widgets/offering-list/ui/Offerings.tsx` (widgets), `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` (pages); deleted `src/widgets/offering-list/lib/resolve-taxonomies.ts` and `src/pages/manage-offerings/lib/resolve-taxonomies.ts`.
- **Tests:** `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` moves to `src/entities/taxonomy/model/taste-note-tree.test.ts` with its assertions updated to the tree shape and one new case; `src/entities/offering/ui/OfferingCard.test.tsx` replaces the rows-by-level case and adds the side-by-side case. The QA copies `qa/src/widgets/offering-list/lib/resolve-taxonomies.test.ts` and `qa/src/entities/offering/ui/OfferingCard.test.tsx` are already excluded as stale and are not touched.
- **API:** none; `GET /offerings` and `GET /taxonomies` are read as today.
- **Dependencies, contract, texts, tokens:** none.
- **Resolves:** backlog R49.

## Propose status

- **Change-id:** `nest-card-taste-notes`
- **Date:** 2026-10-08
- **Validation:** `openspec validate nest-card-taste-notes --strict` → "Change 'nest-card-taste-notes' is valid".
- **Resolves:** backlog R49.
- **Resolved:** the tree resolver `buildTasteNoteTree` lives once in `src/entities/taxonomy/model/taste-note-tree.ts` and both `resolve-taxonomies.ts` copies go (design.md D1, D4); a repeated reference renders at its first occurrence with the children of every occurrence under it; an unresolved reference's resolved children take its place among its siblings, as today's resolvers keep walking them (design.md D1); the layout classes and nested `ul`/`li` markup are the design lead's (design.md D2, D3); the spec delta is a REMOVED + ADDED pair because the CLI cannot drop a scenario from a MODIFIED block (see Capabilities).
- **Open:** Product owner to confirm the requirement's new name "Taxonomy badge trees on the offering card" (the brief asked for a MODIFIED requirement under the old name). Backlog R50 (API) stays deferred and may leave detached intermediate notes at the top level.
