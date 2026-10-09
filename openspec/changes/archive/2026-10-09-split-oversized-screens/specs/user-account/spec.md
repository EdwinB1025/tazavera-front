## ADDED Requirements

### Requirement: Account forms kept within the size limits
The forms of the `user-account` capability in the pages, widgets, features and entities layers SHALL each keep every function at no more than 80 lines and a cyclomatic complexity of no more than 15, and every file at no more than 300 lines, while their props, public exports, requests, rendered markup, class names, texts and accessible names stay as the other requirements of this capability state. This requirement adds no behaviour.

#### Scenario: No size or complexity warning
- **WHEN** `npm run lint` runs
- **THEN** it reports no `max-lines-per-function`, `complexity` or `max-lines` warning for a file of this capability in the pages, widgets, features or entities layers

#### Scenario: Behaviour unchanged
- **WHEN** the validation suite and the QA suite run with no test added and no assertion changed
- **THEN** every test of this capability's units passes as before the split
