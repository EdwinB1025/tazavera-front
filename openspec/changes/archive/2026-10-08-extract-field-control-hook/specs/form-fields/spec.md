## ADDED Requirements

### Requirement: One field resolution for every field control
Every data-entry control that binds to a field (text input, password input, select, textarea and checkbox) SHALL take its identifier, its description from the help text and error message, its invalid state and its required state through one shared resolution of the field it belongs to, so the controls cannot drift apart. A value set explicitly on the control SHALL always win over the value from the field. This requirement adds no behaviour: every control keeps the attributes, states and appearance the other requirements of this capability state.

#### Scenario: Same binding across controls
- **WHEN** a text input, a password input, a select and a textarea each render inside a field that is required and shows help text and an error message
- **THEN** each control is identified by its field's label, is associated with the help text and the error message, and is exposed as invalid and required

#### Scenario: Explicit value wins
- **WHEN** a control inside a field is given its own description explicitly
- **THEN** the control is associated with that description instead of the field's help text and error message

#### Scenario: Checkbox keeps its own field
- **WHEN** a checkbox renders with its own help text and error message
- **THEN** it is associated with those messages and exposed as invalid through the same resolution, from its own texts
