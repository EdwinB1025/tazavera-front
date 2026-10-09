## ADDED Requirements

### Requirement: Own-field controls kept within the size limits
The checkbox, radio group, bean scale, intensity slider and descriptor chip group SHALL each be built from components and functions of at most 80 lines and a cyclomatic complexity of at most 15, in files of at most 300 lines, and SHALL render the same structure, class names, texts and accessible names, wire the same help and error messages, and report the same values for the same props, as the other requirements of this capability state. This requirement adds no behaviour.

#### Scenario: Lint reports no size warning for the controls
- **WHEN** `npm run lint` runs
- **THEN** it reports no `max-lines-per-function`, `complexity` or `max-lines` warning for the checkbox, radio group, bean scale, intensity slider or descriptor chip group, or for the units they render

#### Scenario: A control renders as before
- **WHEN** a checkbox, radio group, bean scale, intensity slider or descriptor chip group renders with a help text and an error message, in read-only or interactive mode where it has one
- **THEN** it renders its label or legend, its options or track, its value text, and the help message before the error message, both referenced by the control's `aria-describedby`, exactly as before
