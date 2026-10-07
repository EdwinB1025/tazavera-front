## MODIFIED Requirements

### Requirement: Shell layout and main area
The shell SHALL present the header above a main area that holds the content of the current route. The main area SHALL be a single column when no sidebar is present, and SHALL give the sidebar its own column beside the content when the route in view has a sidebar. The shell SHALL occupy at least the viewport height, and the main area SHALL extend from the header to the bottom of the viewport whatever the height of its content.

#### Scenario: Single column
- **WHEN** a route renders with no sidebar
- **THEN** the main area holds the content in one column below the header

#### Scenario: Sidebar column
- **WHEN** a route renders with its sidebar expanded on a medium or larger viewport
- **THEN** the sidebar occupies its own column beside the content and the content region keeps the remaining width

#### Scenario: Main area fills the viewport
- **WHEN** a route renders content shorter than the viewport, in either theme
- **THEN** the main area, with the page surface, reaches from the header to the bottom of the viewport and no other background shows below it

### Requirement: Management sidebar
The sidebar SHALL appear for an authenticated user on a management route and, for every session state, on the offerings list route; on every other route there SHALL be no sidebar. The content of the sidebar SHALL come from the route in view: the navigation entries of a management area, or the controls of a list, supplied by the capability that owns that route; this capability defines the region, its presentation and its controls. On medium and larger viewports the sidebar SHALL be expanded on arrival and collapsible; on small viewports it SHALL be closed on arrival and SHALL open as a full-screen overlay. When the user navigates within the application, the sidebar SHALL follow the route reached, never keeping the content of the previous route.

#### Scenario: Shown on a management route
- **WHEN** an authenticated user is on a management route
- **THEN** the sidebar appears with the navigation entries of that management area

#### Scenario: Shown on the offerings list
- **WHEN** a visitor, signed in or not, is on the offerings list route, with or without a query
- **THEN** the sidebar appears with the content the offerings list supplies and no navigation entries

#### Scenario: Hidden outside the management area
- **WHEN** the user is on a route that is neither a management route nor the offerings list, or the session is not authenticated on a management route
- **THEN** the sidebar is not shown and the main area uses a single column

#### Scenario: Sidebar follows in-app navigation
- **WHEN** the user moves within the application from a route with a sidebar to a route without one, and back again
- **THEN** the sidebar disappears on the second route and appears again, with the first route's content, on returning to it

#### Scenario: Unknown route stays not found
- **WHEN** the user opens a path under a supported locale that no route defines
- **THEN** the application reports the page as not found, without a sidebar

#### Scenario: Collapsible on a medium or larger viewport
- **WHEN** the user collapses the sidebar on a medium or larger viewport
- **THEN** the main area returns to a single column until the user expands the sidebar again

#### Scenario: Expanded on arrival on a medium or larger viewport
- **WHEN** the user arrives on a route with a sidebar on a medium or larger viewport
- **THEN** the sidebar is expanded beside the content

#### Scenario: Closed on arrival on a small viewport
- **WHEN** the user arrives on a route with a sidebar on a small viewport
- **THEN** the sidebar is closed and the content of the route is visible, not covered by the overlay

#### Scenario: Full-screen overlay on a small viewport
- **WHEN** the user opens the sidebar on a small viewport
- **THEN** the sidebar covers the screen and returns to the content when it is dismissed

#### Scenario: No entries contributed
- **WHEN** the management area in view contributes no navigation entries
- **THEN** the sidebar shows its region with no entries rather than an empty placeholder

## ADDED Requirements

### Requirement: Sidebar re-open control
On a route that has a sidebar, the header SHALL offer a control that opens the sidebar whenever the sidebar is collapsed on a medium or larger viewport, and on a small viewport, where the sidebar is closed until the user opens it. The control SHALL be presented as the header's navigation buttons are, SHALL carry an accessible name from the message catalog of the active locale and SHALL report that the sidebar is not expanded. On a route without a sidebar the header SHALL NOT show it.

#### Scenario: Control shown while collapsed
- **WHEN** the user collapses the sidebar on a medium or larger viewport
- **THEN** the header shows the re-open control, named and reporting the sidebar as not expanded, and keyboard focus moves to it

#### Scenario: Re-opening the sidebar
- **WHEN** the user activates the re-open control on a medium or larger viewport
- **THEN** the sidebar is expanded again, the re-open control is no longer shown and keyboard focus moves to the sidebar's collapse control

#### Scenario: Control hidden while expanded
- **WHEN** the sidebar is expanded on a medium or larger viewport
- **THEN** the header shows no re-open control, the sidebar's own collapse control being available

#### Scenario: Opening on a small viewport
- **WHEN** the user activates the re-open control on a small viewport
- **THEN** the sidebar opens as the full-screen overlay, and dismissing it returns keyboard focus to the re-open control

#### Scenario: No control without a sidebar
- **WHEN** the route in view has no sidebar, on any viewport
- **THEN** the header shows no re-open control

#### Scenario: Control named in every locale
- **WHEN** the shell renders the re-open control in `es`, `en` or `ca`
- **THEN** its accessible name is the sidebar toggle text of that locale's catalog

### Requirement: Sidebar entry presentation
A navigation entry in the sidebar SHALL be a link to its route, and the entry of the current route SHALL be marked as the current page. On hover, an entry that is not the current one SHALL show the navigation hover fill with its label in the navigation hover text colour, meeting the 4.5:1 text contrast in both themes. Every control inside the sidebar SHALL show the inverse focus indicator, meeting 3:1 against the sidebar surface in both themes.

#### Scenario: Entry is a link
- **WHEN** a management area contributes an entry to the sidebar
- **THEN** the entry is a link to its route, keeps the sidebar entry look and can carry an icon before its label

#### Scenario: Current entry marked
- **WHEN** the user is on the route of a sidebar entry
- **THEN** that entry is marked as the current page

#### Scenario: Entry hover label
- **WHEN** the user hovers an entry that is not the current one
- **THEN** the entry shows the navigation hover fill and its label turns to the navigation hover text colour

#### Scenario: Focus inside the sidebar
- **WHEN** a control inside the sidebar receives keyboard focus, in either theme
- **THEN** it shows the inverse focus indicator, which meets 3:1 against the sidebar surface
