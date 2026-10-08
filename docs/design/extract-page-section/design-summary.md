Status: approved — by the orchestrator on 2026-10-06, under Product owner's delegation for refactor summaries without open points

# Design summary — extract-page-section

Input for `/opsx:explore` and `/opsx:propose`, once Product owner approves it. Drafted by the design lead on 2026-10-06. Anything not settled by a source is listed under "Open".

- Change-id: `extract-page-section` (one verb, one object; `openspec/config.yaml` rule).
- Capability: `content-structure`. Its spec's purpose is "Tazavera's content containers"; the page section is the outermost one. The commits use the `content-structure` scope, also for the edits to `src/pages/home` and `src/pages/about`, which belong to `landing` (AGENTS.md: the scope is the change's capability).
- Branch and folders: `feature/extract-page-section`, `openspec/changes/extract-page-section/`, `docs/design/extract-page-section/`.
- Depends on: `add-landing` (merged; owner of the two copies being extracted).
- Consumed by (none of them adds scope here):
  - `add-user-account` Open 8 (one `surface-page` section per page, a 32rem column inside the container, its §6.3);
  - `add-offering-management` Open 4 (one `surface-page` section per route, a flex column of blocks inside the container, its §6.1–6.2);
  - `add-offering-catalog` Open 2 (two sections per route, `surface-page` then `surface-section`, its §6.1–6.3);
  - `add-specialist-evaluations` §9 (one `surface-page` section per route), not named by the decisions-log entry but on the same D14 layout;
  - `add-filter-controls` (its page body follows D14, its line 16), through the catalog.
- Backlog: no entry names it (`docs/backlog.md` holds R1–R4, R6, R7). The decision exists only in the decisions log; see Findings in the review log.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| Decisions log, "2026-10-06 — primitivo compartido de sección" (Product owner, proposal 4) | A refactor in `content-structure` extracts the D14 section and container classes, today copied in `HomeScreen.tsx` and `AboutContent.tsx`, into one shared primitive; Home and About adopt it; it goes before the features that add pages. |
| Decisions log, "2026-10-06 — add-landing (D14)" | Full-width sections, centred container at most 72rem, side padding 1rem/2rem, vertical padding 3rem/4rem, explicit gaps between groups. |
| `openspec/specs/landing/spec.md`, "Page layout" | The observable rule for the two public pages, with the breakpoint at 768px. It stays true and unchanged. |
| `src/pages/home/ui/HomeScreen.tsx:36-43`, `src/pages/about/ui/AboutContent.tsx:48-55` | The two identical copies: section `py-12 md:py-16`; container `mx-auto w-full max-w-6xl px-4 md:px-8`. The comments in both files say the copy exists only because page slices cannot import each other. |
| AGENTS.md "Architecture" and the FSD skill | A business-agnostic UI primitive used by several page slices goes in `shared/ui`, imported through `@/shared/ui`. |
| `src/shared/ui/Card.tsx` | The house pattern for a region container: settled class constants joined with `cn`, the consumer supplies children and class extensions. |
| `src/shared/lib/utils.ts` | `cn` only joins strings; it does not resolve conflicting utilities. |

## 1. Scope

**In:**
- A new `PageSection` in `src/shared/ui`, holding the D14 section and container classes once.
- `HomeScreen` (two sections) and `AboutContent` (five sections) rendered through it, with the same DOM and classes as today.

**Out (non-goals):**
- No new surface, spacing value, token or breakpoint. No visible change.
- No change to the groups inside the containers (hero grid, offerings block, About stack, steps grid, link groups): they stay in their slices.
- No column-width primitive (the 32rem column of `add-user-account` stays that change's own element).
- No change to the shell, the main area or the sidebar.

## 2. `PageSection` (`src/shared/ui/PageSection.tsx`)

**Props.**

| Prop | Type | Notes |
|---|---|---|
| `surface` | `"page" \| "section"` | Optional, default `"page"`. `page` → `bg-surface-page`; `section` → `bg-surface-section`. The only two surfaces any page section uses today or in the drafted consumers. |
| `containerClassName` | `string` | Optional. Added to the container's classes with `cn`, for the layout of the container's children only (display, gap, grid columns, alignment). It never carries padding, width or margin: `cn` does not resolve conflicts, so an override would be unreliable. Stated in the component's JSDoc. |
| `children` | `ReactNode` | The section content. The primitive contributes no text. |

- Exported types: `PageSectionProps` and `PageSectionSurface`.
- No `className` on the section and no other attributes: no current or drafted consumer needs them (criterion C). A later need is added by the change that has it.
- No `"use client"`: it uses no hook, handler or browser global, so it renders on the server like the pages that use it. `client-boundary.test.ts` passes without the directive.

**Rendered structure (exact classes, the current copies):**
- `<section>` with `py-12 md:py-16` and the surface class.
- One child `<div>` (the container) with `mx-auto w-full max-w-6xl px-4 md:px-8`, plus `containerClassName` when given.
- The children inside the container.

**Layout and spacing (criterion A).**
- Section: full width of its parent; padding 3rem top and bottom below `md` (768px), 4rem from `md`; no horizontal padding; no margin; no border; no radius; background by `surface`.
- Consecutive sections touch; their vertical padding separates them (landing spec "Side and section spacing").
- Container: centred; full width up to 72rem (`max-w-6xl` = 72rem); padding 1rem left and right below `md`, 2rem from `md`; no vertical padding; no margin other than the auto side margins; no border; no radius; no background.
- Gap between the container's children: none from the primitive. Each page sets its own explicit gaps through `containerClassName` or an inner element (D14 "explicit gaps between groups").

**States and accessibility.** No interactive part, no state, no focus ring. The `<section>` has no accessible name, as today, so it is not a landmark; a consumer that wants one names its own heading.

## 3. Adoption (no visible change)

**`src/pages/home/ui/HomeScreen.tsx`:**
- `SECTION_CLASSES`, `CONTAINER_CLASSES` and the comment about the copy are removed.
- The hero renders in `PageSection surface="page"`, the offerings block in `PageSection surface="section"`.
- The root `div.flex-1`, the `Suspense` boundary and its skeleton fallback stay as they are.

**`src/pages/about/ui/AboutContent.tsx`:**
- `SECTION_CLASSES`, `CONTAINER_CLASSES` and the comment about the copy are removed.
- The five sections render as `PageSection`, with `surface` following `SECTION_BACKGROUNDS` (page, section, page, section, page).
- Sections 1 and 4 pass the stack classes (`flex flex-col gap-4`, 1rem between blocks) as `containerClassName`; section 3 passes the steps grid classes (`grid gap-6 md:grid-cols-3`, 1.5rem between cards, three equal columns from `md`). Sections 2 and 5 pass none. This keeps the DOM identical: today these classes sit on the container element itself.
- `STACK_CLASSES`, `STEPS_CLASSES`, `LINK_GROUP_CLASSES` and `SECTION_BACKGROUNDS` stay in the file (they are About's own groups).

**DOM check:** with these props, every section renders the same element tree and the same class tokens as on `develop` (class order inside the attribute may differ; the tests compare tokens, not strings).

## 4. Files touched

| File | Layer | Change |
|---|---|---|
| `src/shared/ui/PageSection.tsx` and `PageSection.test.tsx` | shared | New |
| `src/shared/ui/index.ts` and `index.test.tsx` | shared | Export `PageSection` and its types; smoke render |
| `src/pages/home/ui/HomeScreen.tsx` | pages | Uses `PageSection`; local copies removed |
| `src/pages/about/ui/AboutContent.tsx` | pages | Uses `PageSection`; local copies removed |

## 5. Spec delta

ADDED requirement in `content-structure`, "Page sections":
- a page is built from full-width sections, each on the page or the section background;
- each section's content sits in a horizontally centred container at most 72rem wide, with side padding of 1rem below the medium breakpoint (768px) and 2rem from it;
- each section has vertical padding of 3rem below 768px and 4rem from it;
- the section contributes no content of its own.

Scenarios: "Centred content", "Side and section spacing", "Section background", "Consumer content only".

The landing spec does not change: its "Page layout" requirement still holds for Home and About, now met through the shared section.

## 6. Tests

No test is removed or weakened.

**New, `src/shared/ui/PageSection.test.tsx`:**
- renders a `section` whose class tokens include `py-12` and `md:py-16`;
- the section has exactly one child, whose tokens include `mx-auto`, `w-full`, `max-w-6xl`, `px-4` and `md:px-8`;
- without `surface`, the section carries `bg-surface-page` and not `bg-surface-section`; with `surface="section"`, the reverse;
- `containerClassName="grid gap-6"` adds `grid` and `gap-6` to the container and keeps its five tokens;
- the children render inside the container, and the primitive renders no text of its own (the rendered text equals the children's).

**New, `src/shared/ui/index.test.tsx`:** a smoke case rendering `PageSection` from `@/shared/ui` with a child text.

**Must keep passing unchanged:**
- `src/pages/home/ui/HomeScreen.test.tsx`, in particular "Page layout": two `SECTION` children, `bg-surface-page` then `bg-surface-section`, `py-12 md:py-16`, the five container tokens on each section's first child, and the skeleton grid;
- `src/pages/about/ui/AboutContent.test.tsx`, in particular "alternates the section backgrounds", "pads every section and centers its content" (one child per section), "shares the container width equally" (`grid gap-6 md:grid-cols-3` on the cards' parent, three children) and the link group;
- `HomeHero.test.tsx`, both `ExploreButton.test.tsx`;
- the guards: `color-guard` (`bg-surface-page` and `bg-surface-section` are defined tokens), `radius-guard`, `focus-guard`, `client-boundary`, `xss-guard`, `catalog-guard`.

**Verification.**
- `npm run test:run`, `npm run lint` and `npx tsc --noEmit` pass.
- `/es` and `/es/about` captured at 375px and 1280px match the captures from `develop`, pixel and DOM (the `extract-offering-list-parts` 4.2 method). `/es` needs the local read mock, because the local database has no offerings.

## 7. Contrast

Not applicable. No colour, token or surface changes; the two surface classes are the ones already rendered. No pair is measured or registered (criterion D).

## 8. Responsive behaviour

Unchanged. Below 768px: 1rem side padding, 3rem vertical; from 768px: 2rem and 4rem; above 72rem plus the side padding the container stays 72rem and centres. At 375px the content box is 343px wide *(computed: 375 − 2 × 16)*; no horizontal scroll is introduced.

## 9. Texts

No new keys. The primitive renders none.

## 10. Contract

None consumed. Home's offerings reads (`listOfferings`, `listOlfactoryTaxonomies`) are untouched.

## 11. Order and dependencies

- Layer: `content-structure`, below `app-shell` and the feature capabilities, as the board's layering requires.
- It goes before the propose of `add-user-account`, `add-offering-management`, `add-offering-catalog` and `add-specialist-evaluations` (decisions log "primitivo compartido de sección"); each then renders its sections through `PageSection`.
- Shared files:
  - `src/shared/ui/index.ts` and `index.test.tsx` are also edited by `extract-offering-list-parts` (Pagination, in Verify) and `refactor-badge-geometry` (Verify), and later by `add-evaluation-scales`. Each adds its own lines in the same blocks: a textual conflict is possible, and the resolution keeps both sides. Starting from `develop` after those two merge avoids it.
  - `HomeScreen.tsx` is not touched by `extract-offering-list-parts` (its summary §3) nor by `add-auth` (its branch predates the landing). `replace-offering-card-session` does not touch `HomeScreen.tsx` either.
  - No overlap was simulated with `git merge-tree`: Bash was not available in this session (**unverified**).
- It touches no file of `replace-offering-card-session`, so the two refactors can run in parallel.

## 12. Visual reference

No visible change, so no MVC capture applies. The reference is `/es` and `/es/about` on `develop` at 375px and 1280px, captured before the change (with the read mock for `/es`), stored in `docs/design/extract-page-section/captures/`. The after captures must match. Not yet captured: the local design lead could not run a browser in this session.

## Open

No point blocks propose. Every value comes from the code on `develop`, the landing spec and the decisions log. The interface (§2) is code placement within a decision Product owner already took.

## Review log

- **2026-10-06, design lead (draft).** Generated from the decisions log (D14, "primitivo compartido de sección"), `HomeScreen.tsx`, `AboutContent.tsx` and their tests, `Card.tsx`, `cn`, the guards, the landing and content-structure specs, and the page-layout sections of the user-account (§6.3), offering-management (§6.1–6.2) and offering-catalog (§6.1–6.3) summaries.
  - B1 (code, verified): `containerClassName` rather than an extra wrapper element. About puts its stack and grid classes on the container itself, and its tests check one child per section and the grid as the cards' parent; a prop keeps the DOM identical.
  - B2 (code, verified): no conflicting overrides through `containerClassName`, because `cn` does not merge utilities (`src/shared/lib/utils.ts`).
  - B3: `surface` limited to `page` and `section`, default `page`. Every drafted consumer uses only these two; three of four use only `page`.
  - B4: the consumers' inner elements (user-account's 32rem column, management's block column, catalog's heading block and filter slot) stay theirs; their values are already in their summaries.
  - B5 (semantic): capability `content-structure`, as the decisions log names it; the landing spec is not modified because no observable behaviour changes.
  - Findings for the orchestrator: no `docs/backlog.md` entry records this refactor (the orchestrator may add it, `.claude/CLAUDE.md` §3); the board has no row for the change yet.

## Propose status

- Change-id: `extract-page-section`. Date: 2026-10-06. Phase: propose, completed by the architect agent.
- `openspec validate extract-page-section --strict`: passing (`Change 'extract-page-section' is valid`).
- Artifacts created in `openspec/changes/extract-page-section/`: `proposal.md`; `specs/content-structure/spec.md` (ADDED requirement "Page sections", scenarios "Centered content", "Side and section spacing", "Section background", "Consumer content only"); `design.md` (D1–D10); `tasks.md` (five groups, eight tasks, test-first).
- Backlog: none (decisions log 2026-10-06). The change comes from the decisions log entry "primitivo compartido de sección" (2026-10-06) and resolves no backlog entry; archiving it removes nothing from `docs/backlog.md`.
- Branch (orchestrator's answer to explore Q2): the build proceeds on the existing branch `feature/extract-page-section`. `develop` is merged into it at the integration step before the merge to `develop`; in `src/shared/ui/index.ts` and `src/shared/ui/index.test.tsx` the merge resolution keeps both sides. The merge is done by the build or a cloud session, never by the architect (design.md D10).

Resolved (the eight wording slips of today's explore report, with the orchestrator's decisions):

1. `SECTION_BACKGROUNDS` (first reading): it holds `PageSectionSurface` values `"page"`, `"section"`, `"page"`, `"section"`, `"page"`, each fed to `surface` (design.md D6, task 4.1).
2. The section's width is "full width of the page content area" (spec delta, design.md D4).
3. American spelling "centered" throughout the artifacts.
4. `src/shared/ui/index.test.tsx` is an edit with one new smoke case, not a new file (design.md D7, D9, task 2.1).
5. The unused `cn` import in `HomeScreen.tsx` is removed in the adoption task (design.md D5, task 3.1).
6. The unused `cn` import in `AboutContent.tsx` is removed in the adoption task (design.md D6, task 4.1).
7. The verification task compares this branch against `develop` in the browser at 375px and 1280px, pixel diff (design.md D8, task 5.2).
8. The captures of that comparison are taken by the orchestrator or a cloud session, not by the build (design.md D8, task 5.2).

Remaining open: none. No point of the summary blocks propose; every value comes from the code on `develop`, the landing spec and the decisions log.
