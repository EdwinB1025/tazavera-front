Type: Refactor (fast lane)

## Why

Product owner's AUT finding (2026-10-09, maximum priority): action buttons do not keep similar widths. `Button` sets only height and padding, so its width follows the label, and some screens add `w-full` by hand (registration: Cancel is small and Register spans the whole width). Product owner asks for predefined button widths for mobile and desktop, valid wherever one or more action buttons appear. This modifies settled layout by Product owner's decision; Product owner typed it as fast lane.

## What Changes

- Two new width tokens, the same in both themes: `--container-action-sm` (7.5rem) and `--container-action-base` (10rem), generating `min-w-action-sm` and `min-w-action-base`.
- Every text action button (`Button` in the primary and positional treatments, `RouteButton` and the buttons built on them) takes its size's minimum width at every viewport; a longer label still grows it and labels never wrap. Icon-only buttons, the navigation treatment (header and sidebar chrome) and the pagination controls keep their own geometry.
- A new shared `ActionGroup` (`src/shared/ui/ActionGroup.tsx`, align `start` | `end`) for every place with two or more action buttons together: below `md` a grid of two equal columns whose buttons fill their cells; from `md` a wrapping row 0.75rem apart where each button keeps its minimum width.
- Every screen: adjacent action buttons move into one `ActionGroup`; lone action buttons keep their minimum width and never stretch; hand-written `w-full` / `flex-1` widths on action buttons are removed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `theming`: ADDED "Action width tokens".
- `base-controls`: ADDED "Action button widths" and "Action group".
- `user-account`: MODIFIED "Cancelling registration" (Register and Cancel in one action group; the submit is no longer full width).
- `evaluations`: MODIFIED "Cancelling the evaluation form" (Save draft, Close evaluation and Cancel in one action group).

## Non-goals

- No change to texts, which buttons exist, states, requests, colour or radius tokens, or dependencies.
- No other backlog entry is folded in.

## Impact

- New: `src/shared/ui/ActionGroup.tsx` (exported from `src/shared/ui/index.ts`).
- Modified: `src/app/styles/globals.css`, `src/shared/ui/Button.tsx`, `src/shared/ui/Pagination.tsx`, `src/shared/ui/ConfirmDialog.tsx`, and the screens listed in tasks.md.
- Tests: `Button.test.tsx` (min width per size), `RouteButton` (min width), a new `ActionGroup.test.tsx`, `RegisterForm.test.tsx` (one group, no `w-full`); existing assertions that break are updated and named in tasks.md.

## Propose status

- Change-id: `unify-action-button-widths`
- Date: 2026-10-09
- `openspec validate unify-action-button-widths --strict`: valid
- Resolves backlog entry: none (Product owner's AUT finding passed directly).
- Resolved (Product owner, 2026-10-09): the two width tokens and their values; minimum width per size for every text action button; one shared action group (mobile two equal columns, `md` wrapping row with predefined widths); lone buttons never stretch.
- Resolved (orchestrator, design.md D2–D3): the navigation treatment and the pagination controls are not action buttons and keep their geometry; inside a group below `md` the cell width governs (equal halves), so the minimum width applies to grouped buttons from `md` only.
- Open: nothing blocking; the D3 reading is listed for Product owner's confirmation in the final report.
