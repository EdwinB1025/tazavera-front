# Design

## Context

See proposal.md — Why. The current state this design builds on (line references as of `develop` after `label-rating-badge` merged):

- `src/entities/offering/ui/OfferingCard.tsx`: `OfferingCardTexts` holds twelve keys (lines 25–38); `OfferingCardProps` carries `session: Session` (lines 40–46); the entity computes `isSpecialist` from `session` (lines 104–105) and renders, inside the footer's links group `ml-auto flex gap-4` (lines 156–167), the View link (lines 157–159) and, for a specialist, the Evaluate link to `/{locale}/manage/evaluations/new?offering={ulid}` (lines 160–166).
- `src/widgets/offering-list/ui/OfferingList.tsx`: a Server Component that maps each item to one `OfferingCard` and passes `session` through (lines 78–86); `OfferingListTexts` is `OfferingCardTexts & PaginationTexts & { emptyMessage; errorMessage; retryLabel }` (lines 15–20).
- `src/widgets/offering-list/ui/VerifiedOfferings.tsx` and `src/pages/home/ui/HomeScreen.tsx` pass `session` down; `HomeScreen` supplies the anonymous `Session` constant at one expression (line 26, used at line 96), so the Evaluate link never renders on the entry page today.
- Imports only go downwards (AGENTS.md "Architecture"): `widgets` may import `entities` and `features`; `entities` may import neither `features` nor `widgets`.
- `add-auth` is merged, so `useSession()` exists in `src/features/auth`, but no live session reaches the entry page yet; `add-specialist-evaluations` will wire it.
- The approved design summary's settled inputs and the review log (B1–B5) are the design source for the slot's place, shape and filling.

### API endpoints consumed

None. No endpoint, request, response or error shape changes: the card keeps reading `OfferingSummary` (`ulid` for both link addresses) and the list keeps reading `GET /offerings` and `GET /taxonomies` exactly as today.

### How API errors are presented

Unchanged: a failed offerings or taxonomy read keeps the list's error message with the retry action and no card renders, so no slot content can appear in that state. The slot itself has no error state: it renders whatever node the consumer passes.

### Card sections filled from the API (shared card)

| Card section | Source |
|---|---|
| Score row — large number | `cuppingAvg` |
| Score row — scale | the fixed `/100` text |
| Score row — rating badge | the word of `cuppingAvg`'s tier (unchanged) |
| Verification state badge | `verificationStatus` selecting the verified or provisional label |
| Coffee name | `coffeeInventory.coffee.name` |
| Coffeeshop and roaster captions | `location.name`, `coffeeInventory.roastery.name` |
| Origin line | `coffeeInventory.coffee.{country,region,process,variety}` |
| Taxonomy badges | `sensoryTaxonomy` resolved against `GET /taxonomies` |
| Footer counts | `evaluationCount`, `defectiveEvaluationCount` |
| Footer links — View | `ulid` (unchanged) |
| Footer links — after View | the consumer's `actions` node (this change); on the entry page the Evaluate link built from `ulid` by the list |

### Files modified (no file created, no route change)

| Path | FSD layer | Change |
|---|---|---|
| `src/entities/offering/ui/OfferingCard.tsx` | entities | `session` removed (and the `Session` import); `actions?: ReactNode` added; `evaluateLabel` out of `OfferingCardTexts` |
| `src/entities/offering/ui/OfferingCard.test.tsx` | entities | session cases replaced by slot cases; texts fixture drops `evaluateLabel` |
| `src/widgets/offering-list/ui/OfferingList.tsx` | widgets | fills `actions` with today's Evaluate logic; `evaluateLabel` added to `OfferingListTexts`'s own keys |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | widgets | one new placement case |

`VerifiedOfferings.tsx`, `HomeScreen.tsx`, the slice entry points (`src/entities/offering/index.ts`, `src/widgets/offering-list/index.ts` — the exported type names keep theirs) and `messages/{es,en,ca}/landing.json` change nothing. No generated API type is edited; `src/shared/api/schema.ts` stays as it is.

## Goals / Non-Goals

**Goals:**

- The entity renders actions it is given, knowing nothing about sessions or roles.
- Every landing render is pixel- and DOM-identical: the moved Evaluate logic keeps its address, label and placement.
- The slot shape already fits `add-offering-management`'s wrapper (its §6.2: a flex row, centre-aligned, 0.5rem gap, Select then Delete, after View at the end of the footer) and `add-specialist-evaluations`' single `EvaluateLink`, without further change here.

**Non-Goals:**

- No `useSession()` wiring and no `EvaluateLink` feature (`add-specialist-evaluations` brings them).
- No removal of the `session` plumbing in `OfferingList`, `VerifiedOfferings` and `HomeScreen` (that same later change removes it).
- The filling of `add-offering-catalog`'s cards is not decided here (orchestrator's answer to Q2): the slot is the mechanism, and the catalog decides its cards' filling in its own change.
- No new text key, token, wrapper element or visible change.

## Decisions

### D1. `actions` is an optional `ReactNode`, rendered without a wrapper

The prop table after the change: `offering: OfferingSummary`, `locale: string`, `taxonomies: ResolvedTaxonomyBadge[]`, `texts: OfferingCardTexts` (eleven keys), `actions?: ReactNode`. The entity renders `actions` as direct children of the footer's links group (`ml-auto flex gap-4`), right after the View link — the group keeps its classes, the footer (`flex flex-wrap items-center gap-4`) keeps its wrap behaviour, and the slot's content brings its own spacing, borders, radius and accessible name. With no `actions` (or `null`) the group holds only View: no empty element, so no extra 1rem flex gap shifts View.

Alternatives considered: a render function — rejected, the consumer already maps one card per offering and knows the offering when it builds the node, and a node is also the shape that crosses a client boundary should a later consumer render the card from a Client Component; an always-present wrapper around `actions` — rejected, it would add a 1rem gap after View for anonymous visitors, a visible change (review log B2).

### D2. The entry-page list fills the slot

`OfferingList` is the filler: it is the widget that maps items to cards, it may import the entity now and the `EvaluateLink` feature later (the lowest layer that can host both), and it already holds `session`, so `HomeScreen` and the existing widget and page tests see no change (review log B1). Per item it computes the specialist check moved unchanged from the entity (`session.state === "authenticated" && session.user.role === "specialist"`): for a specialist it passes one `Link` to `/{locale}/manage/evaluations/new?offering={ulid}` labelled `texts.evaluateLabel` (`ulid` falling back to `""` as today); otherwise it passes nothing. Whether the check sits inline or in a small widget-internal helper is the build's choice.

Alternative considered: filling in `HomeScreen` — rejected, it would need a function prop through two Server Components and would change the `HomeScreen` tests.

### D3. `evaluateLabel` moves to `OfferingListTexts`

`OfferingCardTexts` drops `evaluateLabel` and keeps its other eleven keys; `OfferingListTexts` adds `evaluateLabel: string` to its own keys beside `emptyMessage`, `errorMessage` and `retryLabel`. The union of keys reaching the widget is unchanged, so the `listTexts` object in `HomeScreen.tsx` and its exact `toEqual` in `HomeScreen.test.tsx` do not change (review log B4). The catalog key stays `cardEvaluateLabel` in `messages/{es,en,ca}/landing.json`; no key is added, removed or renamed.

### D4. Spec delta wording (orchestrator's answer to Q1)

"Offering card content" keeps every scenario and gains one clause at its end: the Evaluate link for a signed-in specialist is the entry-page list's filling of the card's actions slot. The new requirement "Offering card actions" states the slot's observable contract (the consumer's actions after View; nothing of the card's own beyond View). One clause of wording, no behaviour change.

### D5. Consumers own their slot content

`add-offering-management` passes its own wrapper (its §6.2) and `add-specialist-evaluations` its `EvaluateLink`; neither is built here. `add-offering-catalog` decides its cards' filling in its own change (orchestrator's answer to Q2), out of this change's scope.

## Risks / Trade-offs

- [The prop contract changes in one atomic step, so the entity's tests cannot pass against the old implementation] → The tests and the implementation are two tasks of one slice: the test commit fails exactly on the rewritten entity cases (and their type errors), and the next commit makes everything pass. No other test file is expected to fail at that point.
- [A later consumer could render the card from a Client Component] → `ReactNode` is the prop shape that survives that boundary (D1); no action is needed now.
- [jsdom cannot prove the rendering is unchanged] → The class constants and the DOM relations are pinned by the tests (`ml-auto flex gap-4` group, View's parent, link order); the `/es` comparison at 375px and 1280px against the `develop` captures with the local read mock is part of the verification before the archive (the build has no browser).
- [Follow-up changes depend on this prop shape] → `add-offering-management` Open 2 and `add-specialist-evaluations` §8 consume it as specified in D5; changing the slot later would move those designs, so the shape is fixed here.

## Migration Plan

None: no data, no dependency, no route or contract change. Rolling back is reverting the change's commits.

## Open Questions

None. The orchestrator's answers to the explore's Q1 and Q2 are applied in D4 and D5 and recorded in the summary's Propose status.
