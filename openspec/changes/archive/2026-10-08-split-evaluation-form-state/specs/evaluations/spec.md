## ADDED Requirements

### Requirement: Evaluation form kept as one form
The evaluation form SHALL present, for the same offering, evaluation, taxonomy tree and locale, the same header, context fields, groups with their controls, notes, descriptor blocks and completeness indicators, the same 1–9 legend and the same actions or read-only status, with the same texts, accessible names, initial open states and validation messages, and SHALL send the same draft-save and close requests with the same bodies and in the same order, however the form keeps its state internally. This requirement adds no behaviour: every part of the form keeps what the other requirements of this capability state.

#### Scenario: Editable form renders and saves as before
- **WHEN** the form opens for a new evaluation of an existing offering, the user changes a score and saves the draft
- **THEN** the header, the context fields, the eight collapsed groups and the 1–9 legend render as the "Evaluation form" requirement states, the create request carries the changed score and the saved message shows

#### Scenario: Refused close renders as before
- **WHEN** the user closes a draft and the API answers `409`
- **THEN** the incomplete groups expand and are highlighted and the incomplete message shows, as the "Closing an evaluation" requirement states

#### Scenario: Closed evaluation renders as before
- **WHEN** the form opens for a closed evaluation
- **THEN** every group and the 1–9 legend start expanded, every control is read-only and no action renders
