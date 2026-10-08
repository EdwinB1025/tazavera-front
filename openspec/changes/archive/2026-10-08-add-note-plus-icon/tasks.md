# Tasks

No type is needed: the change only adds markup to an existing component.

## 1. Plus icon on the Add note control

- [x] 1.1 Test (spec "Notes", scenario "The Add note control shows a plus icon"): in `src/pages/evaluation-form/ui/NoteField.test.tsx`, add one test: rendering the closed `Harness`, `getByRole("button", { name: "Add note" })` is found (accessible name exactly its text) and holds an `svg` with `aria-hidden="true"` as its last child element, after the text. Expected: the new test fails because the button has no icon yet; the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implementation: in `src/pages/evaluation-form/ui/NoteField.tsx`, the Add note button renders the `Plus` icon of design.md D1 after `addLabel` and adds `inline-flex items-center gap-2` to its classes; update the component comment to name the icon. Protecting tests: the other tests of `NoteField.test.tsx`, `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` and the QA tests `vitest related` selects; no assertion changes. Expected: `npx vitest related src/pages/evaluation-form/ui/NoteField.tsx --run` passes, `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [x] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: both suites pass, with one more test than on `origin/develop` in the validation suite; the typecheck and lint report no errors; the build succeeds.
