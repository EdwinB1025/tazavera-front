## MODIFIED Requirements

### Requirement: Location creation failures
A `422`, a `403`, a server error, a network failure or any other status answer to the create request SHALL show the generic form error above the actions, and the form SHALL stay open with every value kept. No step-up notice SHALL render on the locations page.

#### Scenario: The creation is rejected or fails
- **WHEN** the create request answers any status except `201`, or the request fails
- **THEN** the generic form error renders above the actions, every value is kept, no step-up notice renders, and the API's message is never rendered

#### Scenario: Step-up after 403
- **WHEN** the create request answers `403`
- **THEN** the generic form error renders above the actions, every value is kept, and no step-up notice or "Confirm identity" action renders

#### Scenario: Confirming identity
- **WHEN** the user activates "Save" again after a rejected creation
- **THEN** the create request is sent again with the current token and no write-scope sign in starts
