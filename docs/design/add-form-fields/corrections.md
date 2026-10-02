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