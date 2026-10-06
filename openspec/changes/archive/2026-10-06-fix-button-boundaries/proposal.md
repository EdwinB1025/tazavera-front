# Proposal

## Why

Five action-button treatments fail the 3:1 boundary rule of the theming spec ("UI boundary and focus contrast"): the dark `primary` fill reaches only 2.01–2.96 against the four host surfaces, and every positional fill (`action-1` to `action-4`) fails at rest in both themes (1.09–2.10) and on hover in the dark theme (2.01–2.45). Today the fill is the only element identifying the button, so these buttons are not identifiable against the surface they sit on (WCAG 2.2, SC 1.4.11). Every screen with an action button is affected, starting with the merged landing page and the planned evaluation and offering screens. A 1px border in a per-variant semantic border token fixes the identification without changing any existing token value.

## What Changes

- Each of the five action treatments (`primary`, `action-1` to `action-4`) gains a 1px border on all sides, coloured by one new semantic border token per variant: `action-primary-border`, `action-1-border`, `action-2-border`, `action-3-border`, `action-4-border`, defined in both themes and pointing to existing primitives only.
- `action-primary-border` is `transparent` in the traditional theme, where the `primary` fill already identifies the button (the `nav-avatar-border` precedent); the traditional `primary` look is unchanged and the transparent border is covered by the theming exemption for borders whose component fill already identifies the component at 3:1 or more.
- The hover state keeps the rest border token: no hover border token is added. Sizes, radii, padding, typography and interaction behaviour are unchanged; the border is drawn inside the fixed-height box, so the content box narrows by 2px.
- The contrast guard registers the new border pairs in both theme matrices and an explicit defined-in-both-themes test for `action-primary-border`; the `base-controls` scenarios "Primary action" and "Positional actions" name the border among the treatment's theme-driven colors.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-controls`: the scenarios "Primary action" and "Positional actions" of "Action button treatments" name the border among the colors that resolve to the treatment's theme values (D1); the border becomes an observable, identifying element of five treatments.

## Out of scope (non-goals)

- `nav-button` and the avatar border: their pairs are registered and pass today.
- Label contrast: not reworked. The label pairs are registered and pass; they are only re-measured to confirm the new borders keep them.
- No change to any existing token value, size, radius, typography or interaction behaviour.
- No new primitive and no hover border token: an existing primitive passes at 3:1 or more for every variant in both themes, at rest and on hover.
- No catalog text and no contract operation.

## Impact

- `src/app/styles/globals.css` (app, theming tokens): five new semantic border tokens in both theme blocks.
- `src/shared/ui/Button.tsx` (shared): `border` plus `border-action-<v>-border` in the rest classes of the five action variants; `nav-button` unchanged.
- `src/app/styles/theme-tokens.test.ts` (app): new boundary pairs in both matrices plus the `action-primary-border` completeness test.
- `src/shared/ui/Button.test.tsx` (shared): new class assertions for the borders.
- Every screen with an action button is affected visually (landing pagination, retry and explore buttons; planned dialog and management screens). Consumers need no code change.
- No API, dependency or contract change. The change expects a textual merge conflict with `add-evaluation-scales` in `globals.css` and `theme-tokens.test.ts`; both sides are kept.
