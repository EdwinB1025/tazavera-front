# Spec Delta

## MODIFIED Requirements

### Requirement: Header brand and primary navigation
The header SHALL show the brand logotype, linking to the root of the active locale. The brand logotype and the primary navigation SHALL sit in one group on the left, and the language selector and the session control SHALL sit in one group on the right, on every viewport. On medium and larger viewports it SHALL also show the "Top rated", "Explore coffee shops" and "About us" entries, in that order; on small viewports those entries SHALL NOT be shown. The primary navigation entries SHALL be presented as navigation items of the header, not as inline text links, and the entry of the current route SHALL be marked as the current page.

#### Scenario: Brand link
- **WHEN** the user activates the brand logotype in the header
- **THEN** the application opens the root of the active locale

#### Scenario: Primary navigation on a medium or larger viewport
- **WHEN** the header renders on a medium or larger viewport
- **THEN** it shows "Top rated", pointing at the verified offerings ordered by cupping average descending, "Explore coffee shops", pointing at the coffee shop directory, and "About us", pointing at the About us page, in that order

#### Scenario: Primary navigation on a small viewport
- **WHEN** the header renders on a small viewport
- **THEN** the "Top rated", "Explore coffee shops" and "About us" entries are not shown while the brand logotype, the language selector and the session control stay visible

#### Scenario: Header grouping on every viewport
- **WHEN** the header renders on any viewport
- **THEN** the brand logotype and the primary navigation form one group on the left, the language selector and the session control form one group on the right after it, and no viewport changes that grouping

#### Scenario: Navigation entries are navigation items
- **WHEN** the primary navigation renders on a medium or larger viewport
- **THEN** each entry fills the header's height with its label centred in the navigation item typography, shows no underline in any state, and the navigation sits visibly apart from the brand logotype

#### Scenario: Navigation entry hover
- **WHEN** the pointer rests on an entry that is not the current page
- **THEN** the entry takes the navigation hover fill and the navigation hover text colour

#### Scenario: Navigation entry keyboard focus
- **WHEN** an entry receives keyboard focus
- **THEN** it shows the shared visible focus ring

#### Scenario: Current page entry
- **WHEN** the current route's path equals an entry's path, ignoring the query
- **THEN** that entry carries `aria-current="page"` and a bottom bar in the navigation indicator colour, takes no hover fill, and no other entry is marked

### Requirement: Management sidebar
The sidebar SHALL appear for an authenticated user on a management route and, for every session state, on the offerings list route, on the coffee shop directory route and on a coffee shop detail route while its Offerings tab is shown; on every other route there SHALL be no sidebar. The content of the sidebar SHALL come from the route in view: the navigation entries of a management area, or the controls of a list, supplied by the capability that owns that route; this capability defines the region, its presentation and its controls. On medium and larger viewports the sidebar SHALL be expanded on arrival and collapsible; on small viewports it SHALL be closed on arrival and SHALL open as a full-screen overlay. When the user navigates within the application, the sidebar SHALL follow the route reached, never keeping the content of the previous route.

#### Scenario: Shown on a management route
- **WHEN** an authenticated user is on a management route
- **THEN** the sidebar appears with the navigation entries of that management area

#### Scenario: Shown on the offerings list
- **WHEN** a visitor, signed in or not, is on the offerings list route, with or without a query
- **THEN** the sidebar appears with the content the offerings list supplies and no navigation entries

#### Scenario: Shown on the coffee shop directory
- **WHEN** a visitor, signed in or not, is on the coffee shop directory route, with or without a query
- **THEN** the sidebar appears with the coffee shop facets and no navigation entries

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

### Requirement: Content-Security-Policy
Every document response of the application SHALL carry a Content-Security-Policy that allows scripts only from the application itself, allows connections to the API origin and to `https://nominatim.openstreetmap.org`, and allows images from the map tile server `https://tile.openstreetmap.org`. Static assets — framework paths under `/_next/` and file paths — are intentionally excluded from the policy, and `/callback` gets its policy from `add-auth`, which owns that route.

#### Scenario: Own scripts run
- **WHEN** the application's own scripts load on a page
- **THEN** the policy allows them and the page works

#### Scenario: Scripts from other origins are blocked
- **WHEN** a response attempts to load a script from an origin other than the application's
- **THEN** the policy blocks it

#### Scenario: Connections to the API are allowed
- **WHEN** the application connects to the API origin
- **THEN** the policy allows the connection

#### Scenario: Connections to the geocoding service are allowed
- **WHEN** the application looks up an address at `https://nominatim.openstreetmap.org`
- **THEN** the policy allows the connection, and connections to any other origin outside the application, the API and that service stay blocked

#### Scenario: Map images are allowed
- **WHEN** the map loads its images from the map tile server `https://tile.openstreetmap.org`
- **THEN** the policy allows them, and images from any other external origin stay blocked

#### Scenario: Policy present on every document response
- **WHEN** verification inspects the responses of the application
- **THEN** each document response carries a Content-Security-Policy, while the excluded static assets and the `/callback` route carry none from this policy

