# Design

## Context

See `proposal.md`. Fast-lane correction from backlog entry R57 (production AUT finding 25); the decisions below are Product owner's (2026-10-08) and the design lead's. No API endpoint is consumed and no request is added: every Cancel is a plain in-application link, so no API error presentation applies. No generated type is used or defined; no route file, token or catalog key is added.

## Decisions

### D1. Evaluation form Cancel (evaluations)

`FormActions` gains two required props, `cancelLabel: string` and `cancelHref: \`/${string}\``, and renders the shared `Link` (default variant) after the buttons wrapper, as the last child of the actions bar, with `self-center`. The link is not tied to `busy`: it stays usable while Save draft or Close evaluation runs. `EvaluationForm` passes `cancelLabel={texts.actions.cancelLabel}` and `cancelHref={\`/${locale}/manage/evaluations\`}`, the destination of the back link in `EvaluationFormHeader.tsx`. The read-only branch (closed evaluation) does not render `FormActions`, so it has no Cancel.

`EvaluationFormTexts.actions` gains `cancelLabel`, mapped in `form-texts.ts` from the `evaluations` catalog's existing `deleteCancelLabel` (es "Cancelar", present in en and ca). No catalog key is added.

### D2. Evaluation action bar layout (evaluations; design lead)

Below `md` the bar stays `flex flex-col gap-2` (rows 0.5rem apart): the status region, the buttons wrapper (`flex gap-4`, each button `flex-1`: equal widths, 1rem apart) and Cancel on its own line, centred by `self-center`. From `md` the bar stays `md:flex-row md:items-center md:justify-end md:gap-4`: one right-aligned row with Cancel 1rem after Close evaluation. The only class change outside the new link is the form's bottom padding in `EvaluationForm.tsx`: `pb-28` becomes `pb-36` (room for the taller sticky bar), `md:pb-0` unchanged.

### D3. Registration Cancel (user-account)

`RegisterFormTexts` gains `cancelLabel` and `RegisterFormProps` gains the required `cancelHref: \`/${string}\``. `RegisterForm` renders the shared `Link` (default variant) after the full-width submit inside the actions wrapper, whose classes change from `flex flex-wrap gap-3` to `flex flex-col items-center gap-3`; the submit keeps `w-full`. The success panel and the loading state are rendered without the form, so they have no Cancel. `RegisterClient` passes `cancelHref={\`/${locale}\`}` (the slice stays route-agnostic; the page composes the destination). `RegisterScreen` maps `cancelLabel: catalog.cancel` from the `account` catalog (present in es "Cancelar", en "Cancel", ca "Cancel·la").

### D4. New offering Cancel (offering-management)

No code change: `NewOfferingForm.tsx` already renders `Link` with `texts.cancelLabel` to `/{locale}/manage/offerings` after the submit. The spec now states it and one test covers the new scenario.

### D5. QA copies made stale by the required props

`qa/src/pages/evaluation-form/ui/FormActions.test.tsx`, `qa/src/features/user-account/ui/RegisterForm.test.tsx` and `qa/src/pages/register/ui/RegisterClient.test.tsx` build their props or texts without the new required members, so they fail `npx tsc --noEmit`. QA tests are not edited in a change: following refine-header-aut D4b, each one that fails the typecheck is added to the `exclude` list of `tsconfig.json`, in the commit that makes it fail. If one also fails at run time, it is added to the `exclude` list of `vitest.qa.config.mts` with a comment naming this change. Every such file is reported.

## Tests

One test per new scenario, asserting role, accessible name, `href` and class:

- `evaluations` "Cancel leaves for My evaluations without saving": `EvaluationForm.test.tsx`, a new form: the link named "Cancel" addresses `/es/manage/evaluations`, carries `text-text-link` and `self-center`, and activating it sends no request.
- `evaluations` "No Cancel on a closed evaluation": `EvaluationForm.test.tsx`, the read-only block: no link named "Cancel".
- `user-account` "Cancel opens the locale root without sending anything": `RegisterClient.test.tsx`, anonymous session: the link named with the fixture's `cancelLabel` addresses `/es`, its parent carries `flex-col` and `items-center`, and activating it sends no request.
- `offering-management` "Cancel leaves for the list": `NewOfferingForm.test.tsx`: the link named "Cancel" addresses `/es/manage/offerings` and follows the submit button.

Fixture-only updates: `FormActions.test.tsx` default props (`cancelLabel`, `cancelHref`), `form-fixtures.ts` `actions.cancelLabel: "Cancel"`, `RegisterForm.test.tsx` `TEXTS.cancelLabel` and `cancelHref` in its render helper, `RegisterClient.test.tsx` `TEXTS.cancelLabel`.

## Files

- `src/pages/evaluation-form/ui/FormActions.tsx`, `EvaluationForm.tsx`, `form-texts.ts` (FSD `pages`).
- `src/features/user-account/ui/RegisterForm.tsx` (`features`).
- `src/pages/register/ui/RegisterClient.tsx`, `RegisterScreen.tsx` (`pages`).
- `tsconfig.json` and, only if needed, `vitest.qa.config.mts` (D5).
- Tests: `src/pages/evaluation-form/ui/FormActions.test.tsx`, `EvaluationForm.test.tsx`, `form-fixtures.ts`; `src/features/user-account/ui/RegisterForm.test.tsx`; `src/pages/register/ui/RegisterClient.test.tsx`; `src/pages/new-offering/ui/NewOfferingForm.test.tsx`.

## Risks

- Excluding the three QA copies from the typecheck hides their type drift until Product owner's reduction plan updates them; they are reported.
