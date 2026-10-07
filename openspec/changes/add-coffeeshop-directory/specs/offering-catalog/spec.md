# Spec Delta

## ADDED Requirements

### Requirement: Coffee shop directory page
The coffee shop directory route SHALL render, in the locale of the route and with no sign-in required, the coffee shops the API returns for the query of the address, one coffee shop card per coffee shop of the current page, and SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the visitor opens the directory route and the API returns coffee shops
- **THEN** one coffee shop card renders per coffee shop of the current page and the pagination reflects the API's current and last page

#### Scenario: Loading
- **WHEN** the coffee shops are loading
- **THEN** three skeleton cards render in the list's place and no empty or error message renders

#### Scenario: Empty
- **WHEN** the API returns no coffee shop and no filter is applied
- **THEN** a centred message saying there are no coffee shops yet renders and no card renders

#### Scenario: Error and retry
- **WHEN** the coffee shops cannot be loaded, whether a request fails or returns a non-success status — a rejected sort or filter value included
- **THEN** a message saying the coffee shops could not be loaded renders with a retry action, and no card renders

#### Scenario: Retry reloads
- **WHEN** the visitor activates the retry action
- **THEN** the list loads again through its loading state into success, empty or error

### Requirement: Directory query pass-through
The directory SHALL forward to the API only the query parameter names the contract declares for `GET /coffeeshops` — `name`, `city`, `postalCode`, `verified`, `orderBy`, `orderDirection` and `page` — and SHALL drop every other key of the address, the view and focus keys of the directory included.

#### Scenario: Contract names kept
- **WHEN** the address carries `name`, `postalCode` and `orderDirection` values
- **THEN** the API request carries exactly those names and values plus the current page

#### Scenario: Directory keys not sent
- **WHEN** the address carries the view or focus keys of the directory, or any key the contract does not declare
- **THEN** the request omits those keys and the rest of the query applies

### Requirement: Directory pagination
Below a successfully loaded, non-empty page of coffee shops, in the list view and in the map view, the directory SHALL render Previous and Next actions driven by the API's current and last page. Activating one SHALL open the preceding or following page at the directory route, replacing only the page and keeping the filters, the sort and the view.

#### Scenario: Next keeps the query and the view
- **WHEN** the address carries filter, sort and map-view keys and the visitor activates Next
- **THEN** the following page opens at the directory route in the map view with every filter and sort value kept

#### Scenario: Boundaries
- **WHEN** the directory shows the first page
- **THEN** Previous is unavailable; and on the last page Next is unavailable

#### Scenario: Paging only with a successful list
- **WHEN** the list is loading, empty or failed
- **THEN** no paging action renders

### Requirement: Directory heading and results column
The directory SHALL render an eyebrow, a heading and an introduction above a body toolbar, and its cards SHALL render in a single column at every viewport width, 1.5rem apart, centred in the results region on the page background, with no fixed width of their own.

#### Scenario: Heading block
- **WHEN** the visitor opens the directory route
- **THEN** the eyebrow, the heading and the introduction render in the locale of the route above the toolbar

#### Scenario: One column at every width
- **WHEN** the list view renders at any viewport width, with or without the sidebar beside it
- **THEN** the cards render one below the other, never side by side, with the page background in both side margins

### Requirement: Coffee shop card
Each coffee shop card SHALL show, from the API's data: a "With verified offerings" badge when the coffee shop has at least one verified offering; the coffee shop name as a heading; its number of locations; the cities of its locations, each once, in the API's order; its number of offerings and of verified offerings; a View link to the coffee shop detail; and, when at least one of its locations has coordinates, a named action that shows it on the map.

#### Scenario: Card content
- **WHEN** a coffee shop with two locations in one city, four offerings and one verified offering renders
- **THEN** the card shows the badge, the name, the two locations, the city once, the four offerings, the one verified offering and the View link

#### Scenario: No verified offering
- **WHEN** a coffee shop has no verified offering
- **THEN** its card shows no badge

#### Scenario: View link
- **WHEN** the visitor activates a card's View link
- **THEN** the detail route of that coffee shop opens in the active locale

#### Scenario: Map action only with coordinates
- **WHEN** none of a coffee shop's locations has both coordinates
- **THEN** its card shows no map action; otherwise the action renders, named "Show {name} on the map"

### Requirement: Directory view toggle
The directory toolbar SHALL offer a view control named "View" with two options, List and Map, each with an icon and a visible label, exposing which one is pressed. The list view SHALL be the default. Choosing an option SHALL change the view key of the address at the same route, keeping every other key, the page included, without moving the scroll position.

#### Scenario: Default view
- **WHEN** the visitor opens the directory without a view key
- **THEN** the List option is pressed and the cards render

#### Scenario: Switch to the map
- **WHEN** the visitor chooses Map
- **THEN** the address carries the map view with the same filters, sort and page, the Map option is pressed and the map renders in place of the cards

#### Scenario: Keyboard
- **WHEN** the focus is on the view control and the visitor presses an arrow key
- **THEN** the focus moves to the other option, and Enter or Space chooses it

### Requirement: Directory map view
In the map view the directory SHALL show the same page of coffee shops as the list: every location of that page with both coordinates as a marker named "{coffee shop} — {location}", the map fitted to all of them, a help line above it, and a line counting the page's locations without coordinates when there are any. Loading, empty and error states SHALL be the list's.

#### Scenario: Markers of the page
- **WHEN** the map view renders a page whose coffee shops have three located locations
- **THEN** three markers render and the map shows all of them

#### Scenario: Locations without coordinates
- **WHEN** two locations of the page lack a coordinate
- **THEN** they render no marker and a line under the map says two locations are not on the map

#### Scenario: No located location
- **WHEN** no location of the page has both coordinates
- **THEN** a message saying none of these coffee shops has a location on the map renders in the map's place

#### Scenario: Map loading
- **WHEN** the map has not finished loading in the browser
- **THEN** a placeholder of the map's size with a loading indicator renders in its place

#### Scenario: Failed tiles
- **WHEN** some map images fail to load
- **THEN** the markers, the controls and the rest of the page stay usable

### Requirement: Show a coffee shop on the map
Activating a card's map action SHALL open the map view focused on that coffee shop: the map fits its located locations — at street level when it has one — their markers take the selected look and the first one's panel opens. A focus value naming no coffee shop of the current page SHALL be ignored.

#### Scenario: Focus from a card
- **WHEN** the visitor activates "Show Nomad Coffee on the map"
- **THEN** the map view opens fitted to Nomad Coffee's located locations, their markers are selected and the panel of the first one is open

#### Scenario: Unknown focus
- **WHEN** the address names a focus that is not on the current page
- **THEN** the map view renders fitted to all the page's markers with no marker selected

### Requirement: Map interaction and accessibility
The map SHALL be a region named "Coffee shop map", described by its help line, reachable by keyboard and showing the shared focus ring; arrow keys pan it and + / − zoom it. It SHALL offer its own Zoom in and Zoom out buttons, an always-visible attribution linking to the map data's copyright page, and keyboard-reachable markers. Every datum on the map SHALL also be available as text outside it.

#### Scenario: Keyboard navigation
- **WHEN** the map has the keyboard focus
- **THEN** it shows the focus ring, arrow keys pan it and + / − zoom it

#### Scenario: Zoom buttons
- **WHEN** the visitor activates Zoom in or Zoom out
- **THEN** the map zooms one level in or out

#### Scenario: Attribution
- **WHEN** the map renders, in either theme and at any size
- **THEN** "© OpenStreetMap contributors" is visible on the map, linking to the copyright page

#### Scenario: Reduced motion
- **WHEN** the visitor's system asks for reduced motion
- **THEN** panning, zooming and markers change without animation

### Requirement: Selected location panel
Activating a marker by pointer, Enter or Space SHALL select it and open a panel over the map, named by the coffee shop name, showing the location name, its address line and, on the directory, a "View coffee shop" link to the detail, with a Close action. Opening the panel SHALL not move the focus; Close or Escape SHALL close it and return the focus to its marker.

#### Scenario: Open the panel
- **WHEN** the visitor activates a marker
- **THEN** the marker takes the selected look and the panel shows the coffee shop name, the location name and "{address}, {postal code} {city}", with the focus still on the marker

#### Scenario: Close the panel
- **WHEN** the panel is open and the visitor presses Escape or activates Close
- **THEN** the panel closes and the focus is on its marker

#### Scenario: Link to the detail
- **WHEN** the visitor activates "View coffee shop" in the directory's panel
- **THEN** the coffee shop's detail route opens without a full page reload

### Requirement: Full-screen map on a small viewport
Below the medium breakpoint the map view SHALL open as a full-screen overlay titled "Coffee shop map", with a "Back to the list" action, the focus kept inside it while open. Closing it by that action or Escape SHALL return to the list view, dropping the view and focus keys, and SHALL return the focus to the control that opened it.

#### Scenario: Map opens full screen
- **WHEN** the visitor chooses Map on a small viewport
- **THEN** the map covers the screen with its title and the "Back to the list" action, and no pagination renders inside it

#### Scenario: Back to the list
- **WHEN** the visitor activates "Back to the list" or presses Escape
- **THEN** the list view renders, the address has no view or focus key, and the focus returns to the Map option or to the card's map action that opened it

### Requirement: Coffee shop detail page
The coffee shop detail route SHALL render one coffee shop of the API, in the locale of the route and with no sign-in required: a back link to the directory, the verified-offerings badge when it has verified offerings, the name as the page heading, its number of locations and its offering counts as captions, and its tabs. It SHALL cover loading, success and error states.

#### Scenario: Header
- **WHEN** the visitor opens the detail of a coffee shop with two locations, four offerings and one verified
- **THEN** the badge, the name heading, "2 locations" and "Offerings: 4 · Verified: 1" render

#### Scenario: Back link
- **WHEN** the visitor activates "Back to coffee shops"
- **THEN** the directory route of the active locale opens

#### Scenario: Loading
- **WHEN** the coffee shop is loading
- **THEN** the back link, placeholder bars in the header's place and skeleton cards in the tabs' place render

#### Scenario: Unknown coffee shop or failure
- **WHEN** the identifier is unknown, or the request fails or returns any other non-success status
- **THEN** the back link renders and, below it, a message saying the coffee shop could not be loaded with a retry action, and no tab renders

### Requirement: Coffee shop detail tabs in the address
The detail SHALL present two tabs, Offerings and Locations, with one panel rendering at a time. The active tab SHALL be kept in the `tab` key of the address at the same route; an absent or unrecognized value SHALL show Offerings. Arrow keys SHALL move the focus along the tabs without changing the panel; Enter or Space selects.

#### Scenario: Default tab
- **WHEN** the visitor opens the detail with no `tab` key
- **THEN** the Offerings tab is selected and its panel renders

#### Scenario: Locations named in the address
- **WHEN** the address carries `?tab=locations`
- **THEN** the Locations tab is selected and its panel renders

#### Scenario: Switching tabs
- **WHEN** the visitor selects the other tab
- **THEN** its panel renders, the other renders nothing, and the address carries the new `tab` value at the same route

### Requirement: Coffee shop Offerings tab
The Offerings tab SHALL show the offerings of that coffee shop with the catalog's toolbar, list, states and pagination, in one centred column. Every request SHALL carry the coffee shop's identifier as the coffee shop filter, whatever the address says, together with the address's offering filter and sort keys. Pagination SHALL stay on the detail route and keep the tab.

#### Scenario: Offerings of the coffee shop
- **WHEN** the visitor opens the Offerings tab of a coffee shop
- **THEN** the list shows only offerings the API returns for that coffee shop, as offering cards in one column

#### Scenario: Coffee shop filter cannot be replaced
- **WHEN** the address carries another coffee shop identifier as the coffee shop filter
- **THEN** the request carries the identifier of the coffee shop in the route

#### Scenario: Filters apply inside the tab
- **WHEN** the visitor applies an offering facet on the Offerings tab
- **THEN** the list reloads with that filter and the coffee shop filter, and the tab stays Offerings

#### Scenario: Pagination stays on the detail
- **WHEN** the visitor activates Next on the Offerings tab
- **THEN** the following page opens at the same detail route with the filters kept

#### Scenario: States
- **WHEN** the coffee shop's offerings are loading, empty, filtered to nothing or fail
- **THEN** the catalog's loading, empty, filtered-empty or error state renders inside the tab

### Requirement: Coffee shop Locations tab
The Locations tab SHALL show the help line, the map of the coffee shop's located locations — whose panel has no link to the detail — the count of locations without coordinates when there are any, and then one card per location in one column. A location card SHALL show the location name as a heading, its description when present, its non-null address, postal code, city, country, phone, web and social values as label/value rows, and a "not on the map" line when it lacks a coordinate.

#### Scenario: Locations and map
- **WHEN** the visitor opens the Locations tab of a coffee shop with two located locations
- **THEN** the map shows two markers and two location cards render below it, one per location

#### Scenario: Null values
- **WHEN** a location's phone and description are null
- **THEN** its card shows no phone row and no description

#### Scenario: Web value
- **WHEN** a location's web value starts with `http://` or `https://`
- **THEN** it renders as a link; any other value renders as text

#### Scenario: Location without coordinates
- **WHEN** a location lacks a coordinate
- **THEN** it renders no marker, its card shows the "not on the map" line, and the line under the map counts it

#### Scenario: No sidebar on Locations
- **WHEN** the Locations tab is selected
- **THEN** no filter sidebar and no Filters trigger render

### Requirement: Directory texts and metadata
Every text of the directory and the detail SHALL come from the message catalog of the route's locale (es, en, ca), counts included. Both routes SHALL render "Tazavera" as the document title and the directory's description as the document description.

#### Scenario: Localized texts
- **WHEN** the directory or the detail renders in es, en or ca
- **THEN** every label, message, accessible name and count text is that locale's

#### Scenario: Document metadata
- **WHEN** either route renders
- **THEN** the document title is "Tazavera" and the description is the directory's description in the route's locale
