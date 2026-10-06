# Design

## Context

See proposal.md for motivation. The current state that shapes the approach:

- `src/pages/home/ui/HomeScreen.tsx` and `src/pages/about/ui/AboutContent.tsx` each hold their own copy of the D14 page-section classes: section `py-12 md:py-16`, container `mx-auto w-full max-w-6xl px-4 md:px-8`. The comments in both files say the copy exists only because page slices cannot import each other.
- `src/shared/ui/Card.tsx` is the house pattern for a region container: settled class constants joined with `cn`, the consumer supplies children and class extensions.
- `src/shared/lib/utils.ts`: `cn` only joins strings; it does not resolve conflicting utilities.
- No API endpoint is consumed and no generated API type is involved. The only types this change defines are UI-specific, declared before the component: `PageSectionSurface` and `PageSectionProps`.
- No API error is presented to the user: the change performs no request.

## Goals / Non-Goals

**Goals:**

- One shared primitive holds the D14 section and container classes once, in `src/shared/ui`.
- Home and About render through it with the same DOM and the same class tokens as `develop` (class order inside the attribute may differ; the tests compare tokens, not strings).
- The `content-structure` spec delta ("Page sections") is met by the primitive.

**Non-Goals:**

- No column-width primitive (the 32rem column of `add-user-account` stays that change's own element).
- No change to the groups inside the containers (hero grid, offerings block, About stack, steps grid, link groups): they stay in their slices.
- No contrast recording: no color, token or surface changes (criterion D). The two surface classes are the ones already rendered.
- No new texts or keys: the primitive renders none.

## Decisions

**D1 — Placement and pattern.** `PageSection` lives in `src/shared/ui/PageSection.tsx` and follows the `Card.tsx` house pattern: settled class constants joined with `cn`, the consumer supplies children and class extensions. A business-agnostic UI primitive used by several page slices goes in `shared/ui` and is imported through `@/shared/ui` (AGENTS.md "Architecture", the FSD skill).

**D2 — Interface.** Code placement within a decision Product owner already took (decisions log 2026-10-06, "primitivo compartido de sección"):

| Prop | Type | Notes |
|---|---|---|
| `surface` | `"page" \| "section"` | Optional, default `"page"`. `page` → `bg-surface-page`; `section` → `bg-surface-section`. The only two surfaces any page section uses today or in the drafted consumers. |
| `containerClassName` | `string` | Optional. Added to the container's classes with `cn`, for the layout of the container's children only (display, gap, grid columns, alignment). It never carries padding, width or margin: `cn` does not resolve conflicts, so an override would be unreliable. Stated in the component's JSDoc. |
| `children` | `ReactNode` | The section content. The primitive contributes no text. |

Exported types: `PageSectionProps` and `PageSectionSurface`, declared before the component. No `className` on the section and no other attributes: no current or drafted consumer needs them (criterion C); a later need is added by the change that has it. No `"use client"`: it uses no hook, handler or browser global, so it renders on the server like the pages that use it, and `client-boundary.test.ts` passes without the directive.

Alternative considered: an extra wrapper element instead of `containerClassName`. Rejected — About puts its stack and grid classes on the container itself, and its tests check one child per section and the grid as the cards' parent; a prop keeps the DOM identical (design lead B1).

**D3 — Rendered structure (exact classes, the current copies).** A `<section>` with `py-12 md:py-16` and the surface class; exactly one child `<div>` (the container) with `mx-auto w-full max-w-6xl px-4 md:px-8`, plus `containerClassName` when given; the children inside the container.

**D4 — Layout and spacing (criterion A).** Section: full width of the page content area; padding 3rem top and bottom below `md` (768px), 4rem from `md`; no horizontal padding; no margin; no border; no radius; background by `surface`. Consecutive sections touch; their vertical padding separates them (landing spec "Side and section spacing"). Container: centered; full width up to 72rem (`max-w-6xl` = 72rem); padding 1rem left and right below `md`, 2rem from `md`; no vertical padding; no margin other than the auto side margins; no border; no radius; no background. Gap between the container's children: none from the primitive — each page sets its own explicit gaps through `containerClassName` or an inner element (D14 "explicit gaps between groups"). Responsive behaviour is unchanged: below 768px 1rem side padding and 3rem vertical, from 768px 2rem and 4rem; above 72rem plus the side padding the container stays 72rem and centers. At 375px the content box is 343px wide (computed: 375 − 2 × 16); no horizontal scroll is introduced.

**D5 — Adoption, Home.** In `src/pages/home/ui/HomeScreen.tsx`, `SECTION_CLASSES`, `CONTAINER_CLASSES` and the comment about the copy are removed, and the now-unused `cn` import is removed in the same task. The hero renders in `PageSection surface="page"`, the offerings block in `PageSection surface="section"`. The root `div.flex-1`, the `Suspense` boundary and its skeleton fallback stay as they are.

**D6 — Adoption, About.** In `src/pages/about/ui/AboutContent.tsx`, `SECTION_CLASSES`, `CONTAINER_CLASSES` and the comment about the copy are removed, and the now-unused `cn` import is removed in the same task. The five sections render as `PageSection`. `SECTION_BACKGROUNDS` stays in the file (it is About's own group) and holds `PageSectionSurface` values — `["page", "section", "page", "section", "page"]` — each entry fed to the `surface` prop of its section (today's background class strings become these surface values). `STACK_CLASSES`, `STEPS_CLASSES` and `LINK_GROUP_CLASSES` also stay. Sections 1 and 4 pass `STACK_CLASSES` (`flex flex-col gap-4`, 1rem between blocks) as `containerClassName`; section 3 passes `STEPS_CLASSES` (`grid gap-6 md:grid-cols-3`, 1.5rem between cards, three equal columns from `md`) as `containerClassName`. Sections 2 and 5 pass none. This keeps the DOM identical: today these classes sit on the container element itself.

**D7 — Tests (test-first).** No test is removed or weakened. New, `src/shared/ui/PageSection.test.tsx`: renders a `section` whose class tokens include `py-12` and `md:py-16`; the section has exactly one child, whose tokens include `mx-auto`, `w-full`, `max-w-6xl`, `px-4` and `md:px-8`; without `surface` the section carries `bg-surface-page` and not `bg-surface-section`, with `surface="section"` the reverse; `containerClassName="grid gap-6"` adds `grid` and `gap-6` to the container and keeps its five tokens; the children render inside the container and the rendered text equals the children's. `src/shared/ui/index.test.tsx` is an edit with one new smoke case: `PageSection` rendered from `@/shared/ui` with a child text.

Must keep passing unchanged: `src/pages/home/ui/HomeScreen.test.tsx` (in particular "Page layout": two `SECTION` children, `bg-surface-page` then `bg-surface-section`, `py-12 md:py-16`, the five container tokens on each section's first child, and the skeleton grid); `src/pages/about/ui/AboutContent.test.tsx` (in particular "alternates the section backgrounds", "pads every section and centers its content" — one child per section — "shares the container width equally" — `grid gap-6 md:grid-cols-3` on the cards' parent, three children — and the link group); `HomeHero.test.tsx`, both `ExploreButton.test.tsx`; the guards `color-guard` (`bg-surface-page` and `bg-surface-section` are defined tokens), `radius-guard`, `focus-guard`, `client-boundary`, `xss-guard`, `catalog-guard`.

**D8 — Verification.** `npm run test:run`, `npm run lint` and `npx tsc --noEmit` pass. In the browser, this branch is compared against `develop` at 375px and 1280px (pixel diff, plus a DOM comparison), using the `extract-offering-list-parts` 4.2 method: `/es` and `/es/about` captured at both widths must match the captures from `develop`. `/es` needs the local read mock, because the local database has no offerings. The captures (before from `develop`, after from this branch) are taken by the orchestrator or a cloud session, not by the build. The reference captures live in `docs/design/extract-page-section/captures/`; no MVC capture applies, since there is no visible change.

**D9 — Files touched.**

| File | FSD layer | Change |
|---|---|---|
| `src/shared/ui/PageSection.tsx` | shared (`ui`) | New |
| `src/shared/ui/PageSection.test.tsx` | shared (`ui`) | New |
| `src/shared/ui/index.ts` | shared (`ui`) | Edited: export `PageSection` and its types |
| `src/shared/ui/index.test.tsx` | shared (`ui`) | Edited: one new smoke case |
| `src/pages/home/ui/HomeScreen.tsx` | pages (`home`) | Edited: adopts `PageSection`; local copies and the unused `cn` import removed |
| `src/pages/about/ui/AboutContent.tsx` | pages (`about`) | Edited: adopts `PageSection`; local copies and the unused `cn` import removed |

No route file changes; no files outside `src/`.

**D10 — Order and shared files.** Layer: `content-structure`, below `app-shell` and the feature capabilities, as the board's layering requires. It goes before the propose of `add-user-account`, `add-offering-management`, `add-offering-catalog` and `add-specialist-evaluations` (decisions log "primitivo compartido de sección"); each then renders its sections through `PageSection`. The build proceeds on the existing branch `feature/extract-page-section`. `develop` is merged into that branch at the integration step before the merge to `develop`, done by the build or the cloud session, never by the architect. In `src/shared/ui/index.ts` and `src/shared/ui/index.test.tsx` — also edited by `extract-offering-list-parts` (Pagination, in Verify) and `refactor-badge-geometry` (Verify), and later by `add-evaluation-scales`, each adding its own lines in the same blocks — the merge resolution keeps both sides. `HomeScreen.tsx` is not touched by `extract-offering-list-parts`, `add-auth` or `replace-offering-card-session`. The change touches no file of `replace-offering-card-session`, so the two refactors can run in parallel.

## Risks / Trade-offs

- [`cn` does not resolve conflicting utilities, so a consumer could make the container unreliable through `containerClassName`] → The prop is documented and restricted to the layout of the container's children (display, gap, grid columns, alignment), never padding, width or margin; the test keeps the five container tokens present.
- [A textual conflict in `src/shared/ui/index.ts` and `src/shared/ui/index.test.tsx` with the parallel changes] → Each change adds its own lines in the same blocks; the merge resolution keeps both sides, and the merge belongs to the build or the cloud session (D10).
- [The pixel comparison depends on captures this session cannot take] → The orchestrator or a cloud session takes them at 375px and 1280px (D8); the build verifies against the provided captures.
- [A refactored adoption could alter a class token and break the identical-DOM promise unnoticed] → The existing `HomeScreen.test.tsx` and `AboutContent.test.tsx` class-token assertions keep passing unchanged, and the browser comparison is against `develop`.

## Migration Plan

No data, API or route migration. Rollback is a revert of the change's commits; nothing persists outside the repository.
