## ADDED Requirements

### Requirement: Cancelling registration
Both registration forms, specialist and coffee shop, SHALL show a "Cancel" link under the full-width submit action, centred, that opens the root of the active locale `/{locale}` without sending anything. The success panel and the loading state SHALL have no Cancel link. No warning about unsaved input SHALL be shown.

#### Scenario: Cancel opens the locale root without sending anything
- **WHEN** the registration form renders and the user activates "Cancel"
- **THEN** the link under the submit action addresses `/{locale}` and no `POST /register` is sent
