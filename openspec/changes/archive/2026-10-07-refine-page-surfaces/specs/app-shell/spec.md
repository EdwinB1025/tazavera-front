## MODIFIED Requirements

### Requirement: Shell layout and main area
The shell SHALL present the header above a main area that holds the content of the current route. The main area SHALL be a single column when no sidebar is present, and SHALL give the sidebar its own column beside the content when the route in view has a sidebar. The shell SHALL occupy at least the viewport height, and the main area SHALL extend from the header to the bottom of the viewport whatever the height of its content. The main area SHALL show the page backdrop: in the traditional theme a light blue-green surface distinct from the cream card surface, and in the dark theme a surface darker than the card surface.

#### Scenario: Single column
- **WHEN** a route renders with no sidebar
- **THEN** the main area holds the content in one column below the header

#### Scenario: Sidebar column
- **WHEN** a route renders with its sidebar expanded on a medium or larger viewport
- **THEN** the sidebar occupies its own column beside the content and the content region keeps the remaining width

#### Scenario: Main area fills the viewport
- **WHEN** a route renders content shorter than the viewport, in either theme
- **THEN** the main area, with the page surface, reaches from the header to the bottom of the viewport and no other background shows below it

#### Scenario: Page backdrop
- **WHEN** a route renders in the traditional theme
- **THEN** the main area shows the light blue-green backdrop, and cards on it show the cream card surface; and in the dark theme the backdrop is darker than the cards on it
