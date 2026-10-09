Type: Refactor (fast lane)

# Proposal

## Why

Product owner's AUT pass found that the front's bean mark recolours the bean's lines with its state, while the MVC's bean (`resources/views/flux/icon/coffee-bean.blade.php`) does not: there the bean path's fill and stroke are always `var(--color-brown-900)`, and only the circular `rect` behind it changes with the state (`.bean-on` / `.bean-off`). Product owner typed this AUT correction for the fast lane and decided (2026-10-09) to align the bean with the MVC. It changes the bean's appearance in the `on` state by Product owner's decision.

## What Changes

- `BeanMark` (`src/shared/ui/icons.ts`) paints the bean path with `fill-evaluation-bean-mark-off stroke-evaluation-bean-mark-off` in every state: `on`, `off` and the half bean of the read-only scale. `evaluation-bean-mark-off` is `brown-900` in the traditional theme, as the MVC's bean; its dark-theme value is unchanged.
- The disc behind the bean is unchanged: `fill-evaluation-bean-on` / `fill-evaluation-bean-off`, same values. It is the only layer that changes with the state.
- `evaluation-bean-mark-on` is no longer used by any component, so the token is removed from both themes in `src/app/styles/globals.css`, and its contrast-matrix registration against the `on` disc (`src/app/styles/theme-tokens.test.ts`, both matrices) becomes the pair that renders, `evaluation-bean-mark-off` over `evaluation-bean-on`, registered as decorative and exempt: Product owner decided (2026-10-09) that the contrast is sufficient as designed, with no measuring and no token value change.

## Non-goals

- No token value changes and no new contrast pairs.
- `ScaleLegend`'s number stroke (`--color-evaluation-bean-on`) stays as it is.
- No new tests; no change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `form-fields`: "Bean scale" states that the bean's lines keep one colour in every state and only the background behind the bean changes with it; one scenario.

## Impact

- Code: `src/shared/ui/icons.ts`, `src/app/styles/globals.css`.
- Tests: `src/app/styles/theme-tokens.test.ts` (the two `evaluation-bean-mark-on` / `evaluation-bean-on` registrations become exempt `evaluation-bean-mark-off` / `evaluation-bean-on` entries). No validation test asserts the path's `-mark-on` class; the QA copy `qa/src/shared/ui/icons.test.ts` does and goes stale.
- APIs, dependencies, texts: none.

## Propose status

- **Change-id:** unify-bean-outline
- **Date:** 2026-10-09
- **`openspec validate unify-bean-outline --strict`:** valid
- **Backlog entries resolved:** none (AUT correction from Product owner)
- **Resolved:**
  - Bean path → `evaluation-bean-mark-off` fill and stroke in every state, as the MVC (Product owner, 2026-10-09).
  - Disc → unchanged (Product owner, 2026-10-09).
  - Contrast → sufficient as designed; the rendered pair is registered as exempt, no measuring (Product owner, 2026-10-09).
  - `evaluation-bean-mark-on` → removed from both themes with its registrations, since nothing else in `src/` uses it.
- **Open:** the stale QA copy `qa/src/shared/ui/icons.test.ts` (variant "on" asserts the `-mark-on` path classes) is left to Product owner's reduction plan.
