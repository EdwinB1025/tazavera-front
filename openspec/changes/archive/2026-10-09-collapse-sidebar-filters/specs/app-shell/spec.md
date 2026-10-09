## MODIFIED Requirements

### Requirement: Management sidebar
The sidebar SHALL appear for an authenticated user on a management route and, for every session state, on the offerings list route, on the coffee shop directory route and on a coffee shop detail route while its Offerings tab is shown; on every other route there SHALL be no sidebar. The content of the sidebar SHALL come from the route in view: the navigation entries of a management area, or the controls of a list, supplied by the capability that owns that route, a list's controls sitting in the sub-section of the list's entry (see "Sidebar entry sub-section"); this capability defines the region, its presentation and its controls. On medium and larger viewports the sidebar SHALL be expanded on arrival and collapsible; on small viewports it SHALL be closed on arrival and SHALL open as a full-screen overlay. When the user navigates within the application, the sidebar SHALL follow the route reached, never keeping the content of the previous route.

#### Scenario: Shown on a management route
- **WHEN** an authenticated user is on a management route
- **THEN** the sidebar appears with the navigation entries of that management area

#### Scenario: Shown on the offerings list
- **WHEN** a visitor, signed in or not, is on the offerings list route, with or without a query
- **THEN** the sidebar appears with one navigation entry, "Explore offerings", pointing at `/{locale}/offerings` and marked as the current page, holding the content the offerings list supplies in its sub-section

#### Scenario: Shown on the coffee shop directory
- **WHEN** a visitor, signed in or not, is on the coffee shop directory route, with or without a query
- **THEN** the sidebar appears with one navigation entry, "Explore coffee shops", pointing at `/{locale}/coffeeshops` and marked as the current page, holding the coffee shop facets in its sub-section

#### Scenario: Shown on the coffee shop Offerings tab
- **WHEN** a visitor, signed in or not, is on a coffee shop detail route with the Offerings tab shown, and then selects the Locations tab
- **THEN** the sidebar appears with the offering facets on the Offerings tab and is not shown on the Locations tab

#### Scenario: Hidden outside the management area
- **WHEN** the user is on a route that is neither a management route, the offerings list, the coffee shop directory nor a coffee shop's Offerings tab, or the session is not authenticated on a management route
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

### Requirement: Sidebar entry sub-section
A sidebar entry MAY hold a collapsible sub-section, nested below the entry and indented from it, built on the shared collapsible section (content-structure "Collapsible section"). Its header SHALL be a toggle with the sidebar entry look, whose accessible name is the title its consumer supplies and which exposes whether the sub-section is expanded. The sub-section SHALL be closed on arrival on its route, SHALL open only when the user activates its toggle or a control of the route opens it, and SHALL close again when the user leaves the route. While closed, its content SHALL stay mounted, keeping its state, out of the tab order and the accessibility tree. When no entry of the list is in the sidebar, the sub-section SHALL stand at the top of the sidebar content with the same behaviour.

#### Scenario: Closed by default
- **WHEN** the user arrives on a route whose sidebar entry holds a sub-section
- **THEN** the sub-section's toggle, nested below the entry, reports it collapsed and its content is not shown

#### Scenario: Opens on its toggle
- **WHEN** the user activates the sub-section's toggle by pointer or keyboard
- **THEN** the toggle reports it expanded and its content is shown below it
