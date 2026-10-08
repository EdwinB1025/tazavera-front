## ADDED Requirements

### Requirement: Prompt page change on server-loaded lists
When the visitor activates another page, or changes the query, of a list loaded on the server — the entry page's verified offerings, the offering catalog with the coffee shop's Offerings tab, and the coffee shop directory — the list SHALL replace the previous page's content with its loading state at once and SHALL show the requested page once it loads, instead of keeping the previous page in view until the requested one has loaded.

#### Scenario: Loading state on page change
- **WHEN** the visitor activates another page of a server-loaded list and the requested page has not loaded yet
- **THEN** the list's skeleton cards show in place of the previous page's cards until the requested page renders
