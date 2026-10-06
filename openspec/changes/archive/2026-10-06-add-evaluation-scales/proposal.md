# Proposal

## Why

The evaluation and account flows have no score controls and no destructive-action confirmation. `add-specialist-evaluations` cannot render the CVA form without the affective bean scale, the descriptive intensity slider and the descriptor chip group, and neither it nor `add-user-account` can confirm a delete or a deactivation without a confirmation dialog. This change adds those four shared components; the screens that consume them follow in their own changes.

## What Changes

- **Bean scale** (affective score, 1 to 9): a labelled row of nine bean marks filled cumulatively from the first up to the chosen score, the score as text beside the row, one tab stop with arrow and Home/End keyboard choice, hover that only changes the cursor, and a read-only display: a meter over 0 to 9 with one decimal, announced with an accessible value, where the fractional part shows a partially filled bean.
- **Intensity slider** (descriptive score, 0 to 15): a labelled slider with a track filled from the start up to the value in the start-to-end gradient, marks at 0/5/10/15 and three scale labels below the track, the value as text beside the label, and a read-only display: the same track and fill with no thumb, as a meter. With no value it shows intensity 0.
- **Descriptor chip group** (sensory descriptors): a labelled group of taxonomy chips in titled rows that wrap, multi-select. An unselected chip shows a neutral boundary, the taxonomy's data-color dot and a strong label; a selected chip keeps that boundary and shows a taxonomy badge with a check mark, so the state never rests on color alone. A read-only group shows the chosen options as plain taxonomy badges and an empty text when nothing is chosen.
- **Confirmation dialog** (capability `feedback`): a modal alert dialog with a title, a description and the destructive and cancellation actions, initial focus on the cancellation, Escape and focus return around the request the consuming capability runs, with pending and error states. A click on the overlay never closes it.
- **Two theme tokens** for the bean drawing (`evaluation-bean-mark-on`, `evaluation-bean-mark-off`), defined in both themes; no existing token changes. The contrast pairs deferred to this change (`evaluation-bean-*` and `evaluation-slider-*`) join the theme-token guard, and the color guard starts checking `fill-` and `stroke-` utilities (finding F3).
- **Verification by class and attribute tests only**: the 375/1280 visual capture moves to `add-specialist-evaluations` (Open 5, answered a).

No breaking changes: existing tokens, utilities and controls keep their current meaning.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `form-fields`: three new data-entry controls — bean scale, intensity slider and descriptor chip group — with their states, keyboard and pointer behaviour, read-only display and theme-driven tokens; the inverse-variant requirement is scoped to the controls that carry an inverse variant, the three new ones rendering on content surfaces only.
- `feedback`: a new confirmation dialog requirement (the `modal` area of the capability).

## Out of Scope (non-goals)

- Screens, routes and catalog text: every text reaches these components as a prop. The shared `scales` catalog area is added by the first consumer (Open 9, answered b).
- A selection limit on the descriptor chip group: no `max` prop, no disabled-at-max state and no `max` test (decision D1 of `docs/design/add-evaluation-scales/handoff.md`; the "main tastes: 2" citations are superseded).
- Inverse variants of the three scale controls: they render on the content surfaces only (card, form, section); an inverse variant arrives when a consumer places one on a dark surface (decision D2).
- The badge geometry refactor: `refactor-badge-geometry` (capability `feedback`) owns it. This change consumes its `BADGE_GEOMETRY_CLASSES` export, keeps its guard green and resolves no backlog entry — R6 is resolved by that change (decision D4).
- The button boundary defects F1 and F2: their own `base-controls` change (`fix-button-boundaries`), which also measures `action-1`/`action-2` (Open 6, answered a).
- API consumption: no operation is called and no generated type is touched. The consumers map `deleteAnEvaluation`, `deactivateAUser`, `permanentlyDeleteAUser`, `listOlfactoryTaxonomies` and the evaluation score fields to these components later.
- Form composition, submission and validation logic.

## Impact

- **Code (all under `src/`)**: new files in `src/shared/ui` — `BeanScale.tsx`, `IntensitySlider.tsx`, `DescriptorChipGroup.tsx`, `ConfirmDialog.tsx` and their tests, plus the Radix toggle-group and alert-dialog primitives pulled from the shadcn registry and rewired to tokens (FSD layer `shared`). Modified: `src/shared/ui/icons.ts` (the bean SVG joins the icon entry point), `src/shared/ui/index.ts` and `index.test.tsx` (new exports), `src/app/styles/globals.css` (two tokens and one thumb utility added; no existing token modified), `src/app/styles/theme-tokens.test.ts` (the deferred contrast pairs), `src/shared/ui/color-guard.test.ts` (`fill-`/`stroke-` utilities), `src/shared/ui/focus-guard.test.ts` (the three new scale controls).
- **Dependencies**: none. Radix Toggle Group (1.1.19) and AlertDialog (1.1.23) ship inside the installed `radix-ui` (1.6.7); the bean scale reuses its Radio Group (1.4.7). No new npm package.
- **Depends on**: `refactor-badge-geometry` (`feedback`), which exposes `BADGE_GEOMETRY_CLASSES` from `Badge.tsx`. Per decision D4 the apply starts only after that change is merged into `develop` and `develop` into this branch.
- **API**: none. This change consumes no endpoint and touches no generated type; the only error surface is the error copy each consumer passes to a control or to the dialog (a per-field validation message or a request failure message, mapped by the consumer). No card is used, so no card field mapping applies.
- **Existing behavior**: unchanged. No screen consumes the new components yet; placement happens in `add-specialist-evaluations` and `add-user-account`.
