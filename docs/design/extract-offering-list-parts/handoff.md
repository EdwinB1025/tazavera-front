# Handoff — extract-offering-list-parts

## Session 2026-10-06 — worktree, explore and propose
Summary: worktree `tazavera-front-listparts` created on `feature/extract-offering-list-parts` from `develop` (`ee913ca`), with `npm ci`, `.claude/` and `npx next typegen`; the restricted agent profiles come from `develop`. No `.env.local` exists in any checkout (not needed for propose). The architect ran the explore (OpenCode, through the orchestrator's node launcher). MVC reachable: not needed.

### Agent feedback (explore, condensed)
- Verified against code: nothing outside the widget imports `OfferingPagination`; `HomeScreen` text keys match; `client-boundary` and `catalog-guard` need no edit; the §6 encoded URL is what `URLSearchParams` produces; the landing spec stays satisfied.
- Tests: the `fetchTaxonomies` and `buildTaxonomyLookup` blocks move with copied fixtures (`TREE` and the fetch scaffolding are shared with cases that stay); the 5 `OfferingPagination` cases move to `Pagination.test.tsx`; +2 query cases; +1 `OfferingList` case; +1 `index.test.tsx` smoke render.
- Wording: "moved unchanged" should read "same cases and assertions, fixtures copied"; §4 and §6 disagree on `index.test.tsx` ("unchanged" vs a new smoke render) and on one vs several `OfferingList` cases; the `ExploreButton.test.tsx:25` comment names the deleted file.
- Questions: Q1 requirement shape vs the capability Purpose; Q2 whether the four-states rule applies to the control; Q3 where `TaxonomiesPayload` lives.

### Decisions taken
#### D1 — Q1: the requirement stays inside the current Purpose
- Decision: phrase the new requirement as the pagination control's contract, without amending the content-structure Purpose. `config.yaml` already lists pagination under the capability.
- Why: smallest spec change (architect rule "change spec.md only where observable behaviour changes, with the smallest wording change").
#### D2 — Q2: the four-states rule applies, through the host
- Decision: add one scenario stating that the paging actions render only with a successful, non-empty list; loading, empty and error states belong to the host (as today).
- Why: `config.yaml` rules.specs ("every interaction covers loading, empty, success and error states"); it records existing behaviour, so no observable change.
#### D3 — Q3: `TaxonomiesPayload` goes to `src/shared/api/index.ts`
- Decision: the named API type alias is exported from `@/shared/api`, built on `schema.ts`; the entity imports it from there.
- Why: AGENTS.md "Import API types only from `src/shared/api/`" and the FSD skill naming rule. `VerifiedOfferingsPayload` in the widget is a prior deviation, not a precedent to follow (not moved by this change).
#### D4 — Wording fixes for the propose (see below for the apply)
- "Same cases and assertions; fixtures copied" instead of "moved unchanged"; `index.test.tsx` gains one smoke render and its other cases stay; one new `OfferingList` case; the `ExploreButton.test.tsx` comment is updated to name `Pagination.test.tsx`.
- Why: wording only (`.claude/CLAUDE.md` §4).

## Session 2026-10-06 — apply (OpenCode, then cloud)
Summary: Build runs through the orchestrator's apply loop. Task 1.1 done (`TaxonomiesPayload` in `src/shared/api`). Task 1.2 failed twice: the Build cannot take browser captures. At 12:39 the OpenCode provider ran out of balance; Product owner: work with cloud sessions for now. Stopped because: artifact fix, then the rest goes to a cloud session.

### Artifact fixes
#### A1 — Visual reference moved to the orchestrator (apply, task 1.2)
- Conflict: task 1.2 asked the Build for 375/1280 captures; the Build has no browser (its report proposed the orchestrator or design lead takes them). Product owner agreed on 2026-10-06 that the orchestrator takes the captures and that they live in `docs/design/<change-id>/captures/`.
- Fix: 1.2 removed; the capture becomes task 4.2 at the end (develop does not change, so its reference can be taken last), with the files `es-{375,1280}-{develop,branch}.png` and the comparison recorded here; 4.1 keeps the command and guard checks. `openspec validate --strict` passes.
- Result: `ea1d370`.
- The Build left an untracked `scratchpad/` (a probe script) in the worktree root; removed.
