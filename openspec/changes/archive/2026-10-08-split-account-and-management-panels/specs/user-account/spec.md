## ADDED Requirements

### Requirement: Contact section kept as one view
The Contact details section SHALL render its states — reading, read error with "Try again", empty with "Add contact details", the add form with its errors, generic error and step-up notice, and the read-only contact with its saved or exists status — with the same markup, texts, accessible names and focus moves, and SHALL send the contact read and creation and map their response statuses to outcomes in the account feature's request layer, never in the screen that shows them, however the section is organised internally. This requirement adds no behaviour: every state keeps what the "Contact details" and "Contact details form" requirements state.

#### Scenario: Contact states render as before
- **WHEN** the Contact details section renders for a given read response, form input and creation response
- **THEN** it shows the same state, texts, accessible names and focused element as before the refactor

#### Scenario: Contact requests unchanged
- **WHEN** the section reads the contacts or creates the primary contact
- **THEN** the API receives the same method, path, headers and body as before the refactor, and the status is mapped to an outcome by the account feature's request layer
