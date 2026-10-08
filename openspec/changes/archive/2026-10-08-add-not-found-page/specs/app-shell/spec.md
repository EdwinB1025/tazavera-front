## ADDED Requirements

### Requirement: Not-found page
When a route under a supported locale is not found — the path matches no route, or the route reports its content as not found or not allowed for the signed-in user — the application SHALL show its not-found page inside the shell, in the active locale and theme. The page SHALL show a heading that names the outcome, a short text saying the page does not exist or is not available to them, and a link back to the root of the active locale. Every text SHALL come from the active locale's catalog.

#### Scenario: Not-found page content
- **WHEN** the not-found page renders for a supported locale
- **THEN** it shows a level-one heading with that locale's not-found title and the not-found text, inside the shell's main area

#### Scenario: Back to the home page
- **WHEN** the not-found page renders for a supported locale
- **THEN** it offers a link, named with that locale's "back to the home page" text, that opens the root of that locale
