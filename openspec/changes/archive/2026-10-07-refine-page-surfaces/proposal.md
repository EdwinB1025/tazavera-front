# Proposal

## Why

Product owner decided on 2026-10-07 that views must stop sitting on one flat cream surface: the shell's main area becomes a light blue-green backdrop, and each section of a view hangs from it as a cream card with its own header band and a delicate border, as in the MVC evaluation form (`docs/design/refine-page-surfaces/design-summary.md` §0). The running feature changes (catalog, specialist evaluations, offering management, user account) need the backdrop and the shared section surface on `develop` before their adoption rounds and browser checks.

## What Changes

- **Backdrop:** in the traditional theme the page surface token (`surface-page`) points to `sage-100` instead of `cream-100`; the dark theme keeps `night-petrol-950`. The shell's main area and every page section on the page background show the backdrop without class changes.
- **Section card:** the shared `Card` gains a `section` variant: cream card fill, a uniform 1px subtle border with no accent edge, the container radius and the existing shadow, its parts always stacked, a header band on the section surface (with the section hover surface only when the band holds a collapsible header) and the spacing of design summary §5.3. The default `content` variant is unchanged.
- **View composition rule:** feature views hang their sections from the backdrop: one page section on the page background per view, a layout-only body container, top-level blocks 2rem apart and section cards 1rem apart, and no section-background band in a feature view.
- **Contrast registration:** six pairs added to both contrast matrices (`text-accent`, `text-link`, `text-link-hover` on `surface-page`; `text-label` on `surface-section` and `surface-section-hover`; `focus-ring` on `surface-section-hover`), and a guard on the backdrop token values.

## Non-goals (out of scope)

- Migrating any feature screen (catalog, evaluations, management, account, public evaluations): each adopts the section card in its own round or artifact update (design summary §9.2, Open 3 a).
- The catalog's own files and its single-column list (catalog round 1 point 4).
- Landing and About composition: they keep their alternating bands (Open 4 a).
- The evaluation form's context card and inner panels (Open 5 a, Open 6 a: decided in add-specialist-evaluations' adoption).
- Removing `surface-inverse` or the unused `SidebarInset`.
- The focus indicator's offset gap on the backdrop (design summary §2).
- Any new token, primitive, colour value, interface text, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: new requirement "Section card" (the `section` variant of the card), and "Page sections" gains the rule that feature views hang their sections from the page background.
- `app-shell`: "Shell layout and main area" states that the main area shows the page backdrop, distinct from the card surface in both themes.

`theming` code changes (one token value in `globals.css`, matrix pairs and a value guard in `theme-tokens.test.ts`), but none of its requirements changes: the existing contrast requirements cover the new pairs, so it has no delta spec.

## Impact

- `src/app/styles/globals.css` (one line of the traditional block), `src/app/styles/theme-tokens.test.ts`.
- `src/shared/ui/Card.tsx`, `src/shared/ui/Card.test.tsx`.
- Every screen on `develop` that shows `surface-page` (shell main area, Home hero, About alternate bands) renders on the backdrop in the traditional theme.
- Merge overlap: `theme-tokens.test.ts` with `feature/add-offering-catalog` and `feature/add-user-account` (design summary §9.3: keep both sides, drop duplicate pair lines on the side that merges second).
- No API, contract, dependency or message catalog change.
