Status: approved — by the orchestrator on 2026-10-06, under Product owner's delegation for refactor summaries without open points

# Design summary — replace-offering-card-session

Input for `/opsx:explore` and `/opsx:propose`, once Product owner approves it. Drafted by the design lead on 2026-10-06. Anything not settled by a source is listed under "Open".

- Change-id: `replace-offering-card-session` (one verb, one object).
- Capability: `landing`, the owner of `OfferingCard` (`openspec/specs/landing/spec.md`, "Offering card content") and of the `offering-list` widget. Commits use the `landing` scope.
- Branch and folders: `feature/replace-offering-card-session`, `openspec/changes/replace-offering-card-session/`, `docs/design/replace-offering-card-session/`.
- Depends on: `add-landing` (merged). Ordered after `extract-offering-list-parts` (shared file, §11).
- Consumed by:
  - `add-specialist-evaluations` §8: supplies its `EvaluateLink` (reads `useSession()`) to the slot, and then removes the session plumbing this change leaves in the widget;
  - `add-offering-management` Open 2 (answered a): passes the select checkbox and the Delete button to the slot (its §6.2 "Card action slot");
  - `add-offering-catalog`: its cards come through `OfferingList`, so they get the landing's filling unchanged.
- Backlog: no entry names it (`docs/backlog.md` holds R1–R4, R6, R7). See the review log.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| Decisions log, "2026-10-06 — ranura de acción de `OfferingCard`" (Product owner, proposal 5) | A refactor in `landing` replaces `OfferingCard`'s `session` prop with an action slot the consumer fills; it goes before the features that use the card. |
| Task from the orchestrator (2026-10-06) | Landing behaviour unchanged: the landing fills the slot with what the session logic shows today. Entities cannot import `features`; the summary states where the slot is filled. |
| `src/entities/offering/ui/OfferingCard.tsx:91-92, 143-154` | Today the entity computes `isSpecialist` from `session` and renders, in the footer's links group (`ml-auto flex gap-4`), the View link and, for a specialist, the Evaluate link to `/{locale}/manage/evaluations/new?offering={ulid}`. |
| `src/pages/home/ui/HomeScreen.tsx:26, 108` | Home passes the anonymous `Session` constant to `VerifiedOfferings`, so the Evaluate link never renders on `develop`. |
| `src/widgets/offering-list/ui/VerifiedOfferings.tsx`, `OfferingList.tsx` | Both are Server Components; `OfferingList` maps each item to one `OfferingCard` and passes `session` through. |
| AGENTS.md "Architecture" | Imports only go downwards: `widgets` may import `entities` and `features`; `entities` may import neither `features` nor `widgets`. |
| `openspec/specs/landing/spec.md` "Offering card content" | View for every viewer; Evaluate for a signed-in specialist only; links grouped apart from the counts at the end of the footer. These scenarios stay true. |
| add-offering-management summary §6.2 | Its slot content is a flex row, centre-aligned, 0.5rem gap, holding the checkbox and Delete, at the end of the footer after View. That wrapper is management's own element. |

## 1. Scope

**In:**
- `OfferingCard` loses `session` and its role check, and gains an `actions` slot.
- The `offering-list` widget fills the slot with today's Evaluate logic, so every landing render is identical.

**Out (non-goals):**
- No `useSession()` wiring and no `EvaluateLink` feature: `add-specialist-evaluations` brings them (it depends on `add-auth`, not merged).
- The `session` props of `OfferingList`, `VerifiedOfferings` and the anonymous constant in `HomeScreen` stay. They are removed by the change that replaces the widget's filling with `EvaluateLink`.
- No new text key, token, contract operation or visible change.

## 2. `OfferingCard` after the change (`src/entities/offering/ui/OfferingCard.tsx`)

**Props.**

| Prop | Type | Notes |
|---|---|---|
| `offering` | `OfferingSummary` | Unchanged |
| `locale` | `string` | Unchanged (View link address) |
| `taxonomies` | `ResolvedTaxonomyBadge[]` | Unchanged |
| `texts` | `OfferingCardTexts` | `evaluateLabel` leaves this type (§3); the other seven keys stay |
| `actions` | `ReactNode` | New, optional. The consumer's actions for this card. Replaces `session` |

- `session` is removed, and the entity no longer imports `Session`.
- `ReactNode`, not a render function: the consumer already maps one card per offering and knows the offering when it builds the node. A node also crosses a client boundary, should a later consumer render the card from a Client Component.

**Where the slot renders.** Inside the footer's links group, after the View link, as direct children of that group:
- links group, unchanged: `ml-auto flex gap-4` — pushed to the end of the footer, 1rem between View and each child the consumer passes; no padding, border or radius;
- footer, unchanged: `flex flex-wrap items-center gap-4` — counts group and links group 1rem apart; the links group drops to its own line, as one unit, when the footer is too narrow;
- the entity adds no wrapper around `actions`. With no `actions` (or `null`), the links group holds only View, exactly as today for a non-specialist: no empty element, so no extra 1rem gap shifts View;
- the slot content brings its own spacing, borders, radius and accessible names. On the landing it is one `Link` (`default` variant), as today. Management's 0.5rem-gap wrapper is its own element (its §6.2).

**Unchanged:** score row, status badge, heading, captions, origin line, taxonomy rows, counts, View link, card layout `stacked`, every class constant.

## 3. Landing filling (`src/widgets/offering-list`)

The slot is filled in `OfferingList`, the widget that maps items to cards. Placement:
- the widget may import the entity and, later, a feature (`EvaluateLink`), so it is the lowest layer that can host both today's logic and its successor;
- it keeps `session` as it already does, so `HomeScreen` and the `OfferingList` tests see no change.

**End state of `OfferingList.tsx`:**
- for each item it computes the specialist check moved unchanged from the entity: `session.state === "authenticated" && session.user.role === "specialist"`;
- for a specialist it passes as `actions` one `Link` to `/{locale}/manage/evaluations/new?offering={ulid}` labelled `texts.evaluateLabel` (the address and label the entity renders today, `ulid` falling back to `""` as today); otherwise it passes nothing;
- whether the check sits inline or in a small widget-internal helper is the build's choice.

**Texts type:**
- `OfferingCardTexts` drops `evaluateLabel`;
- `OfferingListTexts` adds `evaluateLabel: string` to its own keys, beside `emptyMessage`, `errorMessage` and `retryLabel`;
- the union of keys is unchanged, so `HomeScreen.tsx` and its `toEqual` on the list texts do not change. The catalog key stays `cardEvaluateLabel` in `messages/{es,en,ca}/landing.json`.

**Not changed:** `VerifiedOfferings.tsx` (still passes `session` to `OfferingList`), `HomeScreen.tsx`, the widget's `index.ts` exports (types keep their names).

## 4. Files touched

| File | Layer | Change |
|---|---|---|
| `src/entities/offering/ui/OfferingCard.tsx` | entities | `session` removed; `actions` added; `evaluateLabel` out of `OfferingCardTexts` |
| `src/entities/offering/ui/OfferingCard.test.tsx` | entities | Session cases replaced by slot cases (§6) |
| `src/widgets/offering-list/ui/OfferingList.tsx` | widgets | Fills `actions`; `evaluateLabel` in `OfferingListTexts` |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | widgets | One new placement case; existing cases unchanged |

## 5. Spec delta (`landing`)

ADDED requirement "Offering card actions":
- the offering card's footer renders, after the View link and within the same group, the actions its consumer supplies for that card;
- the card renders no action of its own beyond View, and none when the consumer supplies none.

Scenarios: "Consumer actions after View", "No consumer actions".

"Offering card content" is not modified: on the entry page, View still renders for everyone and Evaluate only for a signed-in specialist; that is now met by the list's filling. Whether the architect also rewords that requirement's last clause to name the entry-page list instead of the card is a wording choice that changes no behaviour; the default is to leave it.

## 6. Tests

No test is weakened. Assertions on the Evaluate link move from the entity to the widget, where the logic moves.

**`OfferingCard.test.tsx`, updated:**
- `renderCard` drops `session` and accepts `actions`; the `Session` fixtures and import go;
- "View link for everyone": three cards (no actions, one action, two actions), each with View at `/es/offerings/{ulid}`;
- the three Evaluate cases are replaced by:
  - with `actions` set to one link `ACTION`, that link renders after View and shares View's parent (the `ml-auto flex gap-4` group);
  - with no `actions`, View is the only child of that group;
- "separates the counts and groups the links apart": passes one action link instead of the specialist session; its assertions stay (two `a` in the group; the footer, counts and links classes);
- "renders every label and caption": the `TEXTS` fixture drops `evaluateLabel`; the union over the verified and provisional cards still covers every key;
- every other case unchanged.

**`OfferingList.test.tsx`, new case:**
- for a specialist, each card's Evaluate link shares its parent with that card's View link, and comes after it (placement kept at the host).

**Must keep passing unchanged:**
- `OfferingList.test.tsx`: "Session" (Evaluate on every card for a specialist, with the two addresses; none for anonymous or another role), "Success", "Empty", "Error and retry", "Block root", "Grid by viewport";
- `src/pages/home/ui/HomeScreen.test.tsx`, including "supplies the session at one expression as the anonymous Session constant" and the `toEqual` on the list texts;
- `src/entities/offering/lib/rating.test.ts`, `OfferingSkeletonCard.test.tsx`, the widget's `api` and `lib` tests;
- the guards: `color-guard`, `focus-guard`, `radius-guard`, `xss-guard`, `client-boundary`, `catalog-guard`, and the `react/jsx-no-literals` lint rule.

**Verification.**
- `npm run test:run`, `npm run lint` and `npx tsc --noEmit` pass.
- `/es` captured at 375px and 1280px matches the `develop` captures, pixel and DOM, with the local read mock (the local database has no offerings). The specialist rendering is covered by the tests only: no live session exists before `add-auth`.

## 7. Contrast

Not applicable. No colour or surface changes; the Evaluate link keeps its existing `Link` tokens. Nothing is measured or registered (criterion D).

## 8. Responsive behaviour

Unchanged at every width: the footer wraps, and the links group (View, then the slot's children) moves to its own line as one unit when it does not fit beside the counts.

## 9. Texts

No new or renamed keys. `cardEvaluateLabel` keeps reaching the Evaluate link through `OfferingListTexts.evaluateLabel`.

## 10. Contract

None consumed or changed. `OfferingSummary.ulid` builds both addresses, as today.

## 11. Order and dependencies

- Layer: `landing` is a feature capability; nothing below it changes.
- After `extract-offering-list-parts` merges. That change edits the same `OfferingListTexts` declaration (`OfferingPaginationTexts` → `PaginationTexts`) and `OfferingList.test.tsx`; starting from `develop` after its merge avoids a conflict in adjacent lines. Not simulated with `git merge-tree`: Bash was not available in this session (**unverified**).
- Before `add-offering-management` and `add-specialist-evaluations` (decisions log), and before `add-offering-catalog` builds on the widget.
- `add-specialist-evaluations` then: adds `EvaluateLink` (feature, `useSession()`), uses it as the widget's filling, and removes `session` from `OfferingList`, `VerifiedOfferings` and `HomeScreen` with their tests. Its summary §8, line 125 still says the card change happens in that change; that line predates the decision (review log, finding).
- It touches no file of `extract-page-section`; the two can run in parallel.

## 12. Visual reference

No visible change, so no MVC capture applies. Reference: `/es` on `develop` at 375px and 1280px with the read mock, captured before the change into `docs/design/replace-offering-card-session/captures/`; the after captures must match. Not yet captured in this session.

## Open

No point blocks propose. The slot's place, shape and filling follow from the decisions log, the FSD rules and the current code; management's and evaluations' needs fit it without adding scope here.

## Review log

- **2026-10-06, design lead (draft).** Generated from the decisions log ("ranura de acción de `OfferingCard`"), `OfferingCard.tsx`, `OfferingList.tsx`, `VerifiedOfferings.tsx`, `HomeScreen.tsx` and their tests, the landing spec, the add-auth design (D1, `useSession()` in `features/auth`), the add-specialist-evaluations summary §8 (worktree `tazavera-front-evaluations`, read only), and the add-offering-management summary §6.2 and Open 2.
  - B1 (code, verified constraint): the slot is filled in the `offering-list` widget. The entity cannot import `features`; `HomeScreen` filling it would need a function prop through two Server Components and would change the `HomeScreen` tests; the widget already holds `session`, so the existing widget and page tests stay unchanged.
  - B2 (code, verified): `actions` is rendered without a wrapper, as direct children of the links group. An always-present wrapper would add a 1rem flex gap after View for anonymous visitors, a visible change.
  - B3: `ReactNode` rather than a render function: the consumer maps the items and knows each offering.
  - B4 (semantic): `evaluateLabel` moves from `OfferingCardTexts` to `OfferingListTexts`; the key set reaching the widget is unchanged.
  - B5: the session plumbing left in the widget and page is removed by `add-specialist-evaluations`, not here (no live session exists before `add-auth`).
  - Findings for the orchestrator: (1) add-specialist-evaluations summary §8 line 125 ("The card change is made in this change") contradicts the later Product owner decision recorded in line 124 and the decisions log: semantic, the orchestrator may fix the wording (`.claude/CLAUDE.md` §3). (2) No `docs/backlog.md` entry records this refactor; the board has no row for it.

## Propose status

- Change-id: `replace-offering-card-session`. Date: 2026-10-06. Phase: propose (architect).
- Artifacts: `openspec/changes/replace-offering-card-session/` — `proposal.md`, `specs/landing/spec.md` (delta), `design.md`, `tasks.md` (4/4 complete).
- `openspec validate replace-offering-card-session --strict`: passing ("Change 'replace-offering-card-session' is valid").

**Resolved (with its decision):**

- **Q1, spec delta (orchestrator's answer, taking the architect's recommendation):** MODIFY the last clause of "Offering card content" so the Evaluate link for a signed-in specialist is the entry-page list's filling of the card's actions slot — one clause, no behaviour change — plus the ADDED requirement "Offering card actions". This supersedes §5's default of leaving "Offering card content" unmodified. The requirement keeps every scenario; the new one covers the consumer's actions after View and no actions supplied.
- **Q2, the catalog's cards (orchestrator's answer):** out of this change's scope; `add-offering-catalog` decides its cards' filling. This supersedes the "Consumed by" line above claiming the catalog's cards get the landing's filling unchanged; design.md D5 records the end state.
- **Explore report factual corrections (C1, C2, W1–W7), folded into the artifacts** (the summary body keeps its text and is superseded where they differ):
  - C1: `OfferingCardTexts` keeps eleven keys after `evaluateLabel` leaves it (twelve today, including the four rating words of `label-rating-badge`), not seven (§2, §3, §6);
  - C2: `add-auth` is merged, so the session module already exists (§1);
  - current line references: `OfferingCard.tsx:104-105` (the role check) and `156-167` (the links group: View 157–159, Evaluate 160–166), `HomeScreen.tsx:26` and `96` (§0);
  - `docs/backlog.md` holds R1, R3, R4, R5 and R8 (R8 added on `develop`); no entry names this change (§ "Backlog", review log finding 2);
  - `extract-offering-list-parts` and `label-rating-badge` are merged, so this change starts from `develop` with no shared-file simulation outstanding (§11);
  - the texts case of `OfferingCard.test.tsx` keeps five cards (the four tier fixtures plus the provisional card), whose union must cover all eleven texts (§6).

**Remains open:**

- Nothing blocks apply. The `/es` comparison at 375px and 1280px against the `develop` captures with the local read mock stays with the orchestrator's visual check before the archive (summary §12's captures were never taken; the change is intended to be invisible).
- Finding (1) of the review log (add-specialist-evaluations summary §8 line 125) stays with the orchestrator; it does not affect this change's artifacts.
