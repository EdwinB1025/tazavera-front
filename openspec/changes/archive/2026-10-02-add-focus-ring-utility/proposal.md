# Proposal

## Why

Every interactive control renders the same focus indicator, but the class set that produces it is written out in full in each component: `src/shared/ui/Button.tsx` and `src/shared/ui/Link.tsx` today, and `add-form-fields` would add five more consumers plus the password reveal toggle. The set would then live in seven files, so any change to the focus treatment (width, offset, tokens) must be repeated everywhere and drift is invisible until someone checks contrast. Backlog entry R1 (`docs/backlog.md`) raised this duplication and names this change as the fix to land **before** `add-form-fields` proposes.

## What Changes

- **One shared focus indicator**, defined once in `src/app/styles/globals.css` as a named custom utility (`focus-ring`), composed from the existing focus tokens (`--color-focus-ring`, `--color-focus-offset`). The mechanism is the product owner's decision B of backlog R1 (research and rationale in `design.md`). No new tokens; no existing token, utility or rule modified.
- **Button and Link migrate to the shared indicator** with no visible change: the repeated `focus-visible:outline-none focus-visible:ring-2 …` class set is replaced by the single shared class, and their tests assert the shared class with the same full-prefixed-name discipline.
- **Specification**: `theming` gains the requirement that every interactive control renders the same focus indicator drawn from the focus tokens, with a detection scenario whose verification fails naming a divergent control.
- **Guard**: automated verification that no interactive control in `src/shared/ui` defines its own focus treatment.

No breaking changes: the rendered focus indicator is pixel-identical and existing tokens, utilities and tests keep their meaning.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `theming`: adds the shared focus indicator requirement — one indicator for every interactive control, drawn from the focus tokens of the active theme — plus its detection scenario. Existing requirements (theme completeness, contrast, typographic roles) are unchanged.

## Out of Scope (non-goals)

- The inverse variant's focus indicator and its tokens (`focus-ring-inverse`, `focus-offset-inverse`): they arrive with `add-form-fields` (design summary §4), which extends the shared definition with the sibling variant. This change shapes the definition so that extension fits, and nothing more.
- Any new component or control: form fields (`add-form-fields`), evaluation scales, facets, feedback, content containers, layouts.
- Changes to focus-token values or to the documented contrast pairs: no token is added, moved or revalued.
- A visual redesign of the indicator: the rendered result must be identical to today's.
- Updating R1's status line in `docs/backlog.md`: that file is kept by the product owner.

## Impact

- **Code (all under `src/`)**: modified — `src/app/styles/globals.css` (FSD layer `app`; one custom utility added), `src/shared/ui/Button.tsx` and `src/shared/ui/Link.tsx` (FSD layer `shared`; class-set swap only), `src/shared/ui/Button.test.tsx` and `src/shared/ui/Link.test.tsx` (focus assertions updated to the shared class), `src/app/styles/theme-tokens.test.ts` (FSD layer `app`; shared-definition check). New — one guard test beside the existing guards in `src/shared/ui/` (FSD layer `shared`).
- **Dependencies**: none. No dependency is added, removed or upgraded.
- **API**: none. This change consumes no API endpoints and touches no generated types in `src/shared/api/schema.ts`.
- **Existing behavior**: unchanged. Button and Link render exactly as before; no screen is affected, and later controls consume the shared indicator instead of copying the class set.
