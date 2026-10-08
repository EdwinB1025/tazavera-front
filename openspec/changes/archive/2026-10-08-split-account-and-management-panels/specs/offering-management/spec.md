## ADDED Requirements

### Requirement: Management panels kept as one view
The My offerings panel and the locations panel SHALL render their states — for My offerings: the header, the deleted status, the skeleton cards, the signed-out prompt, the list error with retry, the empty message, and the selection toolbar, cards and pagination with the delete confirmation; for locations: loading, the read error with "Try again", the empty card, the toolbar with "Add location", the form, the creation status and the location cards — with the same markup, texts, accessible names and focus moves, and the locations panel SHALL map the locations read status in the location management feature's request layer, never in the screen that shows it, however the panels are organised internally. This requirement adds no behaviour: every state keeps what the other requirements of this capability state.

#### Scenario: My offerings states render as before
- **WHEN** the My offerings panel renders for a given session, list response and delete outcome
- **THEN** it shows the same state, texts, accessible names and focused element as before the refactor, and sends the same requests

#### Scenario: Locations states render as before
- **WHEN** the locations panel renders for a given read response, form input and creation outcome
- **THEN** it shows the same state, texts, accessible names and focused element as before the refactor, and the API receives the same method, path, headers and body
