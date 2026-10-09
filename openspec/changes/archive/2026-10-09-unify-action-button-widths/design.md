## Context

Product owner's AUT finding (2026-10-09): action buttons have unrelated widths. `SIZE_GEOMETRY` in `src/shared/ui/Button.tsx` sets only `h-10 px-4` / `h-8 px-3`, and screens size buttons by hand (`w-full` on registration's submit, `flex-1 md:flex-none` in the evaluation actions bar, `w-full sm:w-auto` in the confirm dialog). No API endpoint is consumed or changed.

## Goals / Non-Goals

**Goals:** predefined minimum widths per button size; one shared action group with equal columns below `md` and predefined widths from `md`; every screen uses them.

**Non-Goals:** which buttons exist, texts, colours, radii, requests.

## Decisions

### D1. Width tokens

A new `@theme` block in `src/app/styles/globals.css` defines `--container-action-sm: 7.5rem` and `--container-action-base: 10rem`. Tailwind 4 reads the `--container-*` namespace for `min-w-*`, so the utilities are `min-w-action-sm` and `min-w-action-base`. The values are the same in both themes: no dark reassignment.

### D2. Button minimum width

`Button` adds `whitespace-nowrap` and its size's minimum width (`min-w-action-base` / `min-w-action-sm`) to text buttons in the primary and positional treatments. A longer label grows the button. Not affected: icon-only buttons (square), the `nav-button` treatment (header and sidebar chrome, not an action), and `Pagination`'s Previous, Next and page-number controls, which keep today's geometry with an important override (`min-w-0!` on the arrows, `min-w-10!` on the numbers, following the existing `px-3!`). `RouteButton` gets the minimum through `Button`.

### D3. Action group

`ActionGroup` in `src/shared/ui/ActionGroup.tsx` renders a `div` (other div props, `ref` included, pass through) with `align?: "start" | "end"` (default `start`):

- base: `grid grid-cols-2 gap-3 max-md:*:w-full max-md:*:min-w-0` — two equal columns, each child fills its cell; 3 or more children wrap two per row and an odd last one keeps the cell width. The cell width governs below `md` (two halves even when half the row is narrower than the minimum).
- `md`: `md:flex md:flex-wrap` plus `md:justify-start` or `md:justify-end` — a wrapping row 0.75rem apart where each button keeps its minimum width and does not stretch.

Status lines (`role="status"`) stay outside the group, before it, as today's order has them.

### D4. Screens

Two or more adjacent action buttons → one `ActionGroup` (forms' actions, card footers, dialog footer, list rows). Lone action buttons keep their container; where a flex column would stretch a lone button the container keeps or gains `items-start` / `items-center` (none found today). Hand-written widths on action buttons are removed (`w-full` in `RegisterForm`, `flex-1 md:flex-none` in `FormActions`, `w-full sm:w-auto` in `ConfirmDialog`).

## Risks / Trade-offs

- [jsdom asserts classes, not pixels] → tests assert the class names; Product owner checks the visual end state in a browser.
- [Parallel sessions edit the same screens] → edits are limited to width and grouping classes; the orchestrator resolves the merge.
