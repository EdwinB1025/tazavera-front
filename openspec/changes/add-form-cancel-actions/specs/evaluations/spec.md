## ADDED Requirements

### Requirement: Cancelling the evaluation form
An editable evaluation form, new or existing, SHALL show a "Cancel" link after the Save draft and Close evaluation actions that opens the My evaluations route `/{locale}/manage/evaluations` without saving and without sending any request, and that stays usable while an action runs. Below 768px the sticky actions bar SHALL stack the status region, the two actions side by side with equal widths, and the Cancel link centred on its own line; from 768px the actions SHALL form one right-aligned row with Cancel last. A closed evaluation, shown read-only, SHALL have no Cancel link. No warning about unsaved input SHALL be shown.

#### Scenario: Cancel leaves for My evaluations without saving
- **WHEN** the editable evaluation form renders and the user activates "Cancel"
- **THEN** the link after Close evaluation addresses `/{locale}/manage/evaluations` and no save or close request is sent

#### Scenario: No Cancel on a closed evaluation
- **WHEN** a closed evaluation renders read-only
- **THEN** no "Cancel" link renders
