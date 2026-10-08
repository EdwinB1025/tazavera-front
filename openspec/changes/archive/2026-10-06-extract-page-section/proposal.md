# Proposal

## Why

The D14 page-section markup exists as two identical copies — `HomeScreen.tsx` and `AboutContent.tsx` — only because page slices cannot import each other. Four upcoming changes (`add-user-account`, `add-offering-management`, `add-offering-catalog`, `add-specialist-evaluations`) each render their pages as D14 sections, and without a shared primitive each would add another copy. The decisions log (2026-10-06, "primitivo compartido de sección") settles the refactor and its order: it goes before the features that add pages.

## What Changes

- A new `PageSection` primitive in `src/shared/ui` holds the D14 section and container classes once: the section (`py-12 md:py-16` plus a surface background) and one centered container (`mx-auto w-full max-w-6xl px-4 md:px-8`).
- `HomeScreen` (two sections) and `AboutContent` (five sections) render through it, with the same DOM and the same class tokens as today. Their local copies of the section and container classes are removed, together with the now-unused `cn` imports.
- No visible change: every rendered element tree and class token stays identical to `develop`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: gains the "Page sections" requirement — the page section is the outermost content container — with its scenarios. Its card requirements do not change. The `landing` spec is not modified: its "Page layout" requirement still holds for Home and About, now met through the shared section.

## Out of scope (non-goals)

- No new surface, spacing value, token or breakpoint. No visible change.
- No change to the groups inside the containers (hero grid, offerings block, About stack, steps grid, link groups): they stay in their slices.
- No column-width primitive (the 32rem column of `add-user-account` stays that change's own element).
- No change to the shell, the main area or the sidebar.

## Impact

- Files: `src/shared/ui/PageSection.tsx` and `src/shared/ui/PageSection.test.tsx` (new); `src/shared/ui/index.ts` and `src/shared/ui/index.test.tsx` (edited: export and one smoke case); `src/pages/home/ui/HomeScreen.tsx` and `src/pages/about/ui/AboutContent.tsx` (edited: adoption, local copies removed).
- No API contract, dependency or route change. Home's offerings reads (`listOfferings`, `listOlfactoryTaxonomies`) are untouched.
- Order: it goes before the propose of `add-user-account`, `add-offering-management`, `add-offering-catalog` and `add-specialist-evaluations`; each then renders its sections through the primitive.
- Shared files also edited by other changes (`src/shared/ui/index.ts`, `src/shared/ui/index.test.tsx` by `extract-offering-list-parts` and `refactor-badge-geometry`): a textual conflict is possible and the resolution keeps both sides.
