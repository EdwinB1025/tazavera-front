# Corrections — add-form-fields

## Round 1

1. RadioGroup: aria-invalid on a fieldset (role group) is not exposed by
   assistive technology. End state: the fieldset has role="radiogroup" and
   aria-labelledby pointing to the legend's id; aria-describedby and
   aria-invalid stay on the fieldset. design.md D1.1 table updated.
   Existing tests affected: RadioGroup.test.tsx fieldset attribute assertions.
   New test: getByRole("radiogroup", { name: <legend text> }) finds the group;
   aria-invalid="true" on it when an error is shown.

2. Spacing in Field, Checkbox and RadioGroup (no spacing was defined).
   End state: the label of Field and the legend of RadioGroup carry mb-2
   (8px to the control); help text and error message carry mt-1 (4px) in
   Field, Checkbox and RadioGroup. Recorded in design.md as a decision.
   Existing tests affected: none.
   New test: the label/legend have mb-2; help and error have mt-1.

3. Input password toggle: the component must not write copy (all texts come
   from the consuming capability; language belongs to another capability).
   End state: Input takes showPasswordLabel and hidePasswordLabel (strings);
   the toggle's accessible name is showPasswordLabel while masked and
   hidePasswordLabel while revealed; no text is written inside Input. Both
   are required when type="password" (discriminated on the literal type
   prop); if TypeScript cannot express it, stop and ask. design.md D9 updated.
   Existing tests affected: Input.test.tsx assertions on /show/i and /hide/i.
   New test: the toggle's name equals each supplied label; a @ts-expect-error
   case for type="password" without the labels.

4. tasks.md 6.2 and 7.2 say "D1 context defaults"; Checkbox and Radio group
   follow the D1.1 own-field contract. Artifact fix only, no new task.
   
5. design.md D9 and tasks 6.1 / 7.1 describe the check mark and the radio dot
as rendered only when checked. Applied as an unplanned fix: both are always
rendered and follow the input's real state through CSS (the input carries
peer; hidden with invisible, shown with peer-checked:visible, faded with
peer-disabled:opacity-50). Spec unchanged: the mark is visible exactly when
checked. Artifact fix only, no new task.

## Round 2

1. Input password mode (supersedes round 1 correction 3): its end state — both
   toggle labels required when `type="password"` through a discriminated union
   on the literal `type` prop — is not expressible in TypeScript. `type` comes
   from InputHTMLAttributes and includes `(string & {})`, so
   `Exclude<..., "password">` still admits the literal "password":
   `type="password"` without the labels compiles (verified: that
   `@ts-expect-error` case is unused, TS2578). End state: password mode moves
   to a separate PasswordInput component (`src/shared/ui/PasswordInput.tsx`,
   exported from `@/shared/ui` and listed in the focus guard's shared-focus
   list). PasswordInput is the password input: its value is masked by default
   and readable while revealed, so it takes no `type` prop; it takes
   `showPasswordLabel` and `hidePasswordLabel` as required props and writes no
   copy of its own. Input stays a single-line text input with native `type`
   passthrough, no visibility toggle and no toggle labels. All else unchanged:
   the D1 field attribute contract as defaults, the inverse variant as an
   explicit prop, the D7 value modes, and the D9 toggle treatment
   (`type="button"` in the input's `relative` wrapper, Eye / EyeOff at
   `size-4 text-text-secondary`, the shared focus indicator, disabled with the
   input). design.md D8 (PasswordInput files) and D9 (the toggle labels are
   plain required props of PasswordInput) updated; specs/form-fields/spec.md
   drops the password mode from "Text input" and moves its scenarios (Password
   masked, Reveal and mask, Visibility toggle is named) to a "Password input"
   requirement.
   Existing tests affected: the correction 3 cases of task 9.5 in
   `src/shared/ui/Input.test.tsx` move to
   `src/shared/ui/PasswordInput.test.tsx` and drop their `type="password"`
   props; the remaining Input tests stay.
   New test: the PasswordInput toggle's accessible name equals
   `showPasswordLabel` while masked and `hidePasswordLabel` while revealed, and
   the two `@ts-expect-error` cases (no labels, only one label) are
   missing-required-prop errors kept in use by `npx tsc --noEmit`.

### Status

- Date: 2026-10-03
- `openspec validate add-form-fields --strict` → `Change 'add-form-fields' is valid`

1. Artifacts updated: design.md D1.1 (radio fieldset carries `role="radiogroup"` and `aria-labelledby`; `aria-describedby` and `aria-invalid` stay on it). Spec unchanged (the scenarios already state the naming and invalid-exposure behaviour). Tasks created: 9.1 (tests), 9.2 (implementation).
2. Artifacts updated: design.md D10 created (spacing decision). Spec unchanged (visual spacing, not behaviour). Tasks created: 9.3 (tests), 9.4 (implementation).
3. Artifacts updated: design.md D9 (toggle labels `showPasswordLabel` / `hidePasswordLabel` required on `type="password"`, no copy in the component) and specs/form-fields/spec.md ("Visibility toggle is named" scenario now states the consumer-supplied name). Tasks created: 9.5 (tests, naming the task 3.1 assertions to replace), 9.6 (implementation).
4. Artifact fix: tasks.md 6.2 and 7.2 reference the D1.1 own-field contract. No tasks.
5. Unplanned fix (already applied by the build in commit `36fe83a`); artifact fix: design.md D9 and tasks 6.1 / 7.1 aligned to the always-rendered, CSS-driven mark and dot. Spec unchanged. No tasks.

### Status

- Date: 2026-10-03
- `openspec validate add-form-fields --strict` → `Change 'add-form-fields' is valid`

1. Correction 1 (round 2; supersedes round 1 correction 3 and task 9.6). Artifacts updated: design.md D1 (Field wraps Input, PasswordInput, Select and Textarea; the variant default rule names PasswordInput), D4 (PasswordInput defaults its variant to the field's — product-owner decision: it keeps Input's rule, an explicit `variant` prop winning), D8 (the `PasswordInput.tsx` / `PasswordInput.test.tsx` row; the Input row retitled to a single-line text input with native `type` passthrough) and D9 (the toggle lives in PasswordInput, whose `showPasswordLabel` / `hidePasswordLabel` are plain required props; Input keeps native `type` passthrough with no toggle and no labels); specs/form-fields/spec.md ("Text input" drops the password mode, the new "Password input" requirement carries the scenarios Password masked, Reveal and mask and Visibility toggle is named, and the Purpose, the Field requirement and the "Control without a field" scenario name the password input). Tasks created: 10.1 (tests), 10.2 (implementation). Task 9.6 is closed at its stop-and-report branch and superseded.