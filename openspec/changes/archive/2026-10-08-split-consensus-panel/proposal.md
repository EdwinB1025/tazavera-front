Type: Refactor (fast lane)

# Proposal

## Why

`src/widgets/offering-detail/ui/ConsensusPanel.tsx` is a 480-line file whose `ConsensusPanel` component runs 252 lines and takes 36 text keys: the score card, the SCA attribute averages, the counts and concordances, the Main tastes and Defects selections with their consensus legends, the CATA wheel and the detail by axis all live in one function. Both exceed the size limits of AGENTS.md (a component of at most 80 lines, a file of at most 300 lines), and every edit to one block means reading all of them (backlog R33; technical review §3.1, row R33). Nothing the user sees changes.

## What Changes

- Each block of the panel moves to its own component in a sibling file of the `ui` segment of the `offering-detail` widget, imported directly by sibling path (design.md D1–D2): the score card, the attributes card, the status card, the consensus legend, the selection block, the CATA card and the detail by axis.
- The helper that counts the identified notes of one type moves to the widget's `lib` segment (design.md D2).
- The panel's texts type is grouped by the part that uses it: each part declares its own texts type, and `ConsensusPanelTexts` becomes the combination of those types plus the keys the panel itself reads, with exactly the same 36 keys (design.md D3).
- `ConsensusPanel` keeps its props, stays in `ConsensusPanel.tsx` and only composes the parts in today's order (design.md D4).
- No markup, class name, accessible name, text, request or requirement changes.

## Out of scope (non-goals)

- The other components of the widget (`OfferingDetailContent`, `DetailHeader`, `DetailTabs`, `InventoryPanel`, `OfferingDetail`) and its public index `src/widgets/offering-detail/index.ts`: unchanged; no part is exported from it.
- `src/widgets/offering-detail/lib/concordance.ts` and the shared and entity components the parts use.
- The message files and the text keys: no key is added, removed or renamed.
- No new test, no changed assertion, no new token, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: one ADDED requirement, "Consensus panel kept as one view", stating the observable property the refactor keeps. It adds no behaviour.

## Impact

- **Code** (FSD layer `widgets`, slice `offering-detail`): modified `src/widgets/offering-detail/ui/ConsensusPanel.tsx`; new `ui/ScoreCard.tsx`, `ui/AttributesCard.tsx`, `ui/StatusCard.tsx`, `ui/ConsensusLegend.tsx`, `ui/SelectionBlock.tsx`, `ui/CataCard.tsx`, `ui/AxisDetail.tsx` and `lib/identified-counts.ts`.
- **Tests**: none added or changed. Protecting tests: `ConsensusPanel.test.tsx` and `OfferingDetailContent.test.tsx` (in `src/widgets/offering-detail/ui/` and `qa/src/widgets/offering-detail/ui/`), plus `OfferingDetailContent.pass2.test.tsx` in `qa/`.
- **API**: none. The panel consumes no endpoint itself; the requests of the detail page do not change.
- **Dependencies, contract, texts, tokens**: none.
- **Resolves**: backlog R33.

## Propose status

- **Change-id:** `split-consensus-panel`
- **Date:** 2026-10-08
- **Validation:** `openspec validate split-consensus-panel --strict` → "Change 'split-consensus-panel' is valid".
- **Resolves:** backlog R33.
- **Resolved:** the panel splits into seven sibling parts (score card, attributes card, status card, consensus legend, selection block, CATA card, detail by axis) and `identifiedCounts` moves to the widget's `lib` segment (design.md D1–D2); each part declares the texts type of the keys it reads and `ConsensusPanelTexts` combines them, keeping its 36 keys and its export, so no importer or test changes (design.md D3); the not-verified card stays inline in the panel beside `AttributesCard`, one component per variant (design.md D4).
- **Open:** nothing.
