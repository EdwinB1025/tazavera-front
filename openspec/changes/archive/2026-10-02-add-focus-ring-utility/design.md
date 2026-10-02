# Design

## Context

See `proposal.md` — Why. Current state: `src/shared/ui/Button.tsx` and `src/shared/ui/Link.tsx` each carry the five-class focus set (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-offset`) in their `BASE_CLASSES`; `src/app/styles/globals.css` holds the color tokens, the radius family and the `type-*` role utilities (multi-declaration `@utility` groups) and is parsed by `src/app/styles/theme-tokens.test.ts`; the guard tests (`color-guard.test.ts`, `radius-guard.test.ts`, `icons.test.ts`) scan `src/shared/ui`. Scope source of truth is backlog entry R1 (`docs/backlog.md`); the follow-on change is `add-form-fields` per `docs/design/add-form-fields/design-summary.md`.

This change consumes no API: no endpoint is called, no generated type in `src/shared/api/schema.ts` is used or touched, and no derived or UI-specific type is defined. No API error can occur, so no error presentation applies. No route or screen is involved.

## Goals / Non-Goals

**Goals:**
- One definition of the focus indicator, living in the theme stylesheet's vocabulary next to the tokens and `type-*` roles it draws from.
- Button and Link migrate with a pixel-identical indicator; only the class name in their tests changes.
- Divergence is prevented by an automated guard, in the style of the existing guards.

**Non-Goals:**
- The inverse variant and its tokens (proposal non-goals; `add-form-fields` extends the definition — D2).
- Any change to tokens, `type-*` roles, the radius family or the icon entry point.
- Other repeated class sets — e.g. the disabled treatment (`disabled:opacity-50 disabled:cursor-not-allowed`) is also repeated across controls and would suit the same treatment. Reported to the product owner as a `docs/backlog.md` candidate; not folded into this change.

## Decisions

### D1. The shared indicator is a custom utility in the theme stylesheet (product owner's decision B)

The indicator is defined exactly once in `src/app/styles/globals.css` as the custom utility `focus-ring`, following the established `type-*` role pattern (a named, multi-declaration `@utility`). Its rendered effect equals the five classes Button and Link carry today: the native outline suppressed, a 2px ring in `--color-focus-ring`, a 2px offset in `--color-focus-offset`. Colors resolve through those variables, so theme reassignment keeps working from the existing tokens (design rule 9: components stay theme-agnostic). Call sites write `focus-visible:focus-ring` (D3).

*Research record (AGENTS.md Research; the proposal was open and pending approval during research and was decided as B by the product owner on 2026-10-02).* Recommended option: Tailwind CSS v4's own custom-utility mechanism — installed as `tailwindcss ^4` and `@tailwindcss/postcss ^4` (documentation current at v4.3):

- Custom utilities work with all variants and join the `utilities` layer; complex utilities use nesting — https://tailwindcss.com/docs/adding-custom-styles
- `@apply` inlines existing utilities into custom CSS — https://tailwindcss.com/docs/functions-and-directives
- Redefining a utility: the latest definition wins — the documented extension path used by D2 — https://github.com/tailwindlabs/tailwindcss/pull/14044
- Classes in `@layer components` cannot take use-site variants — https://github.com/tailwindlabs/tailwindcss/pull/13349, https://github.com/tailwindlabs/tailwindcss/discussions/17082
- Constants for multi-property class groups are advised "when using tailwind-merge" (runtime class merging) — https://github.com/dcastil/tailwind-merge/issues/540

Library candidates evaluated (5 searches, 3 candidates; verdict: **no suitable library found**, designed in-house):

- `cva` — https://cva.style/getting-started/installation/ (MIT, active, unstyled): rejected. A variant-matrix factory; its own docs pair it with `tailwind-merge` for conflict resolution, so it would add two dependencies for one fixed class set.
- `tailwind-variants` + `tailwind-merge` — https://github.com/heroui-inc/tailwind-variants (active; Tailwind v4 supported via `tailwind-merge` v3.x; permissive licenses): rejected. Solves variant recipes and runtime class merging, neither of which this decision needs, and would add two dependencies (dependency changes require product-owner approval; none was requested).
- Focus-ring plugins — `tailwind-keyboard-focus-plugin` (last release 2021; v3-style plugin config; adds a keyboard-focus variant with runtime listeners) and `@tailwindcss/forms` (active, but imposes its own form styling and rings that its own maintainers describe as hard to override — https://github.com/tailwindlabs/tailwindcss-forms/pull/150): rejected. No Tailwind v4 compatibility and/or not unstyled with the project's tokens.

*Alternatives considered.* **A — a TypeScript constant in `src/shared/ui`** imported by each component: rejected because the shared focus contract belongs to `theming`, whose vocabulary lives in `globals.css` (tokens, radius family, `type-*` roles); a constant would split that vocabulary across two files and leave the indicator outside the stylesheet the theme tests parse. Its strongest published argument (the `tailwind-merge` maintainer's advice above) applies only where runtime class merging would strip a bundled utility — this project merges no classes. **C — a component class in `@layer components`**: rejected because such classes cannot receive use-site variants (sources above), so `:focus-visible` would bake into the stylesheet and diverge from the call-site variant idiom every control uses. Building in-house on the framework's own extension mechanism is the chosen option.

Naming: `focus-ring`, per the product owner's option-B wording. It sits near the `--color-focus-ring` token and the `ring-focus-ring` color utility; the overlap is accepted consciously, and a rename stays a small local change (one declaration plus the class assertions).

### D2. The inverse variant extends the definition later

The shared definition carries the default pair only. `add-form-fields` ships `focus-ring-inverse` and `focus-offset-inverse` (its design summary §4 places those tokens with that change) and extends the shared definition with the sibling variant — through redefinition or a functional utility, both documented (sources in D1). Nothing in today's definition blocks that extension, and no token moves between changes.

### D3. Call sites keep the trigger

Components apply `focus-visible:focus-ring`: the `focus-visible` trigger stays at the call site exactly as today, preserving the `base-controls` "Keyboard focus" semantics and leaving room for a control that needs a different trigger, without touching the shared definition.

### D4. Verification shape

jsdom has no CSS engine, so verification splits three ways, following the existing conventions:

- Component tests assert the full prefixed class name `focus-visible:focus-ring` (the correction-4 discipline already used in `Button.test.tsx` and `Link.test.tsx`).
- `src/app/styles/theme-tokens.test.ts` asserts the definition: `@utility focus-ring` exists exactly once in `globals.css` and renders exactly the effect of the five removed classes (outline suppressed, 2px ring in `--color-focus-ring`, 2px offset in `--color-focus-offset`) — the role-assertion pattern the file already uses.
- A guard test in `src/shared/ui` (the `color-guard`/`radius-guard` pattern) fails naming the file and class whenever a hand-rolled focus set appears (`outline-none`, `ring-*`, `ring-offset-*`, with or without state prefixes), and the migrated controls are checked to carry `focus-visible:focus-ring`.

### Files created or modified

| Path | FSD layer | Change |
|---|---|---|
| `src/app/styles/globals.css` | `app` | modified — one `@utility focus-ring` block added; no existing token or rule touched |
| `src/app/styles/theme-tokens.test.ts` | `app` | modified — shared-definition checks (D4) |
| `src/shared/ui/Button.tsx` | `shared` | modified — `BASE_CLASSES` swap to `focus-visible:focus-ring` |
| `src/shared/ui/Link.tsx` | `shared` | modified — `BASE_CLASSES` swap to `focus-visible:focus-ring` |
| `src/shared/ui/Button.test.tsx` | `shared` | modified — focus assertions updated (D4) |
| `src/shared/ui/Link.test.tsx` | `shared` | modified — focus assertions updated (D4) |
| `src/shared/ui/focus-guard.test.ts` | `shared` | created — divergence guard (D4) |

No Next.js route file and no file under the root `app/` or `pages/` is involved. No type is defined or redefined; `src/shared/api/schema.ts` is untouched.

## Risks / Trade-offs

- [Custom utilities share the `utilities` layer with built-ins, so a competing `outline-*` or `ring-*` utility on the same element would win or lose by cascade order rather than by intent] → the guard (D4) forbids hand-rolled focus sets in `src/shared/ui`, and the shared definition's declarations must not be set by other utilities on the same element.
- [`@apply` inside the utility body may compile to inlined values instead of `var()` references, which would freeze the indicator against theme switching] → the implementation task inspects the compiled CSS and the D4 definition check asserts the variable references; if values are inlined, the body writes the declarations directly and the checks are re-run (same fallback approach as the archived radius verification).
- [Name overlap between the `focus-ring` utility, the `--color-focus-ring` token and the `ring-focus-ring` utility could mislead a reader] → accepted consciously in D1; renaming remains a small, local change.

## Migration Plan

Not applicable: the change is a class-name swap inside two components with a pixel-identical render. A rollback is a single revert commit.
