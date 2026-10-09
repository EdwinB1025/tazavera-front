## MODIFIED Requirements

### Requirement: Cancelling the evaluation form
An editable evaluation form, new or existing, SHALL show a "Cancel" button after the Save draft and Close evaluation actions that opens the My evaluations route `/{locale}/manage/evaluations` without saving and without sending any request, and that stays usable while an action runs. The sticky actions bar SHALL show the status region and then the actions in one action group (base-controls "Action group") aligned to the end, with Cancel last: below 768px Save draft and Close evaluation side by side with equal widths and Cancel on the next line at the same cell width; from 768px one right-aligned row. A closed evaluation, shown read-only, SHALL have no Cancel button. No warning about unsaved input SHALL be shown.

#### Scenario: Cancel leaves for My evaluations without saving
- **WHEN** the editable evaluation form renders and the user activates "Cancel"
- **THEN** the button after Close evaluation navigates to `/{locale}/manage/evaluations` and no save or close request is sent

#### Scenario: No Cancel on a closed evaluation
- **WHEN** a closed evaluation renders read-only
- **THEN** no "Cancel" button renders

#### Scenario: Cancel is a button
- **WHEN** the editable evaluation form renders
- **THEN** "Cancel" is a button, not a link, and activating it navigates to `/{locale}/manage/evaluations`

#### Scenario: The form's actions share one action group
- **WHEN** the editable evaluation form renders
- **THEN** Save draft, Close evaluation and Cancel are in one action group aligned to the end, after the status region
