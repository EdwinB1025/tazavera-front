## MODIFIED Requirements

### Requirement: Cancelling registration
Both registration forms, specialist and coffee shop, SHALL show a "Cancel" button after the submit action, the two in one action group (base-controls "Action group"), that opens the root of the active locale `/{locale}` without sending anything. Neither button SHALL span the form's full width. The success panel and the loading state SHALL have no Cancel button. No warning about unsaved input SHALL be shown.

#### Scenario: Cancel opens the locale root without sending anything
- **WHEN** the registration form renders and the user activates "Cancel"
- **THEN** the button after the submit action navigates to `/{locale}` and no `POST /register` is sent

#### Scenario: Cancel is a button
- **WHEN** the registration form renders
- **THEN** "Cancel" is a button, not a link, and activating it navigates to `/{locale}`

#### Scenario: Register and Cancel share one action group
- **WHEN** the registration form renders
- **THEN** the submit action and "Cancel" are in one action group and neither is full width
