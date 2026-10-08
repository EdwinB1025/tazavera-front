# offering-catalog Specification

## Purpose
Defines Tazavera's public offering catalog and offering detail: how any visitor browses the offerings behind a query of the address and inspects one offering's inventory data and cupping consensus, in every supported locale and in both themes.

## Requirements

### Requirement: Offering catalog page
The offerings route SHALL render, in the locale of the route and with no sign-in required, the offerings the API returns for the query of the address, one offering card per offering of the current page, and SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the visitor opens the offerings route and the API returns offerings
- **THEN** one offering card renders per offering of the current page and the pagination reflects the API's current and last page

#### Scenario: Loading
- **WHEN** the offerings are loading
- **THEN** skeleton cards render in the list's place and no empty or error message renders

#### Scenario: Empty
- **WHEN** the API returns no offering for the query
- **THEN** a centered message renders and no offering card renders

#### Scenario: Error and retry
- **WHEN** the offerings cannot be loaded, whether a request fails or returns a non-success status — an invalid filter value included
- **THEN** a message with a retry action renders and no offering card renders

#### Scenario: Retry reloads
- **WHEN** the visitor activates the retry action
- **THEN** the list loads again through its loading state into success, empty or error

### Requirement: Catalog query pass-through
The catalog SHALL forward to the API only the query parameter names the contract declares for `GET /offerings` plus `page`, keeping every value of a repeated key, and SHALL drop any other key. With no query it SHALL request the offering list as it is and add no filter or sort of its own.

#### Scenario: Contract names kept
- **WHEN** the address carries contract parameter names such as `verified`, `orderBy`, `orderDirection`, or repeated `cataRef` values
- **THEN** the API request carries exactly those names and values plus the current page

#### Scenario: Unknown keys dropped
- **WHEN** the address carries a key the contract does not declare for `GET /offerings`
- **THEN** the request omits that key and the rest of the query applies

#### Scenario: No default filter
- **WHEN** the visitor opens the offerings route without a query
- **THEN** the request carries no verification filter and verified and provisional offerings show together in the API's order

### Requirement: Catalog pagination
Below a successfully loaded, non-empty list the catalog SHALL render Previous and Next actions driven by the API's current and last page. Activating one SHALL open the preceding or following page at the offerings route's address, replacing only the page and keeping every other query parameter. Previous SHALL be unavailable on the first page and Next on the last.

#### Scenario: Next and Previous keep the query
- **WHEN** the address carries filter or sort parameters and the visitor activates Next
- **THEN** the following page opens at the offerings route with every other parameter keeping its value and the page replaced

#### Scenario: Boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable and activating it opens nothing; and when the list shows the last page, Next is unavailable and activating it opens nothing

#### Scenario: Paging only with a successful list
- **WHEN** the list is loading, empty or failed
- **THEN** no paging action renders

### Requirement: Catalog heading and toolbar slot
The catalog page SHALL render an eyebrow label and a heading above its results, and SHALL provide a toolbar region between the heading block and the results where the filter and sort controls render. That region SHALL contribute no content of its own.

#### Scenario: Heading block
- **WHEN** the visitor opens the offerings route
- **THEN** the eyebrow and the heading render in the locale of the route above the results

#### Scenario: Toolbar region contributes nothing
- **WHEN** no capability fills the toolbar region
- **THEN** it renders nothing and adds no space between the heading block and the results

### Requirement: Catalog single column
The catalog's cards SHALL render in a single column at every viewport width, 1.5rem apart, centered in the results region. The column SHALL have no fixed width: it takes the width the results region's side margins leave, and the results region SHALL sit on the page background, so the page background shows in those margins on both sides.

#### Scenario: One column at every width
- **WHEN** the results region renders at any viewport width, with or without content beside it
- **THEN** the cards render one below the other in a single column, never side by side

#### Scenario: Centered column on the page background
- **WHEN** the results region renders
- **THEN** the column is centered in the region and the page background shows in the side margins on both sides of it

### Requirement: Offering detail page
The offering detail route SHALL render one offering of the API, in the locale of the route and with no sign-in required: a back link to the previous page, whose fallback destination is the offerings route, the verification state badge, the coffee name as the page heading, the coffeeshop name and the roaster name as labeled captions, an Evaluate link for a signed-in specialist only, and the offering's tabs below the header. The header and the tabs SHALL sit on the page background, with the tab panels' cards hanging from it. It SHALL show no score in the header and SHALL cover loading, success and error states.

#### Scenario: Header
- **WHEN** the visitor opens the detail route of an offering
- **THEN** the verification badge, the coffee name heading and the coffeeshop and roaster captions render with the API's names, and no score renders in the header

#### Scenario: Detail on the page background
- **WHEN** the detail of an offering renders
- **THEN** the back link, the header, the tab bar and the panels' cards render on the page background, and no section background renders on the page

#### Scenario: Evaluate link for specialists
- **WHEN** the viewer is signed in with the specialist role
- **THEN** an Evaluate link renders, addressing the new-evaluation route of the active locale with the offering's identifier

#### Scenario: No Evaluate link for other viewers
- **WHEN** the viewer is anonymous or signed in with another role
- **THEN** no Evaluate link renders

#### Scenario: Back link
- **WHEN** the visitor activates the back link
- **THEN** the previous page of the application opens with its query, or the offerings route of the active locale when there is no previous page of the application

#### Scenario: Loading
- **WHEN** the offering is loading
- **THEN** placeholder shapes render in the header's place and skeleton cards render in the tabs' place

#### Scenario: Error and retry
- **WHEN** the offering cannot be loaded — the request fails, returns a non-success status, or the identifier is unknown
- **THEN** the back link renders and, below it, a message with a retry action renders instead of the tabs

#### Scenario: Retry reloads
- **WHEN** the visitor activates the retry action
- **THEN** the detail loads again through its loading state into success or error

### Requirement: Detail tabs in the address
The detail page SHALL present its content in two tabs — Inventory data and Consensus — with exactly one panel rendering at a time. The active tab SHALL be kept in the address as a `tab` parameter: selecting a tab changes that parameter at the same route, and an absent or unrecognized value shows the Inventory data tab.

#### Scenario: Default tab
- **WHEN** the visitor opens the detail route with no `tab` parameter
- **THEN** the Inventory data tab is selected and its panel renders

#### Scenario: Tab named in the address
- **WHEN** the address carries `?tab=consensus`
- **THEN** the Consensus tab is selected and its panel renders

#### Scenario: Switching tabs
- **WHEN** the visitor selects the other tab
- **THEN** its panel renders, the previous panel renders nothing, and the address carries the new `tab` value at the same route

#### Scenario: Keyboard switching
- **WHEN** the visitor moves with the arrow keys along the tab labels and activates the focused one
- **THEN** the arrows move the focus without changing the visible panel, and activating the focused tab shows its panel

### Requirement: Inventory data tab
The Inventory data tab SHALL show, as label/value rows and in this order: the roast lot and the production date of the coffee inventory; the coffee's country, region, producer, variety, process, altitude, lot and roast level; and the roastery name and the location name, and no other roastery or location data. A field whose value is null SHALL render no row, and every value SHALL render as the API returns it.

#### Scenario: Rows and order
- **WHEN** the Inventory data tab renders for an offering with every field set
- **THEN** one labelled row per listed field renders, in the stated order

#### Scenario: Null row omitted
- **WHEN** any listed field is null
- **THEN** its row renders nothing and the remaining rows render normally

#### Scenario: Roastery and location by name
- **WHEN** the Inventory data tab renders
- **THEN** only the roastery name and the location name render, with no description, coordinate or identifier

### Requirement: Consensus score
When the offering is verified and carries a cupping average, the Consensus tab SHALL show the score out of 100 with the rating badge of its range — exceptional at 90 or above, excellent from 85 to below 90, good from 80 to below 85, commercial below 80 — and the badge's text SHALL be the word of that tier in the active locale. A provisional offering, or one carrying no cupping average, SHALL show no score.

#### Scenario: Verified offering with a score
- **WHEN** the Consensus tab renders for a verified offering carrying a cupping average
- **THEN** the score renders out of 100 with the rating badge of its range and the tier word as its text

#### Scenario: Provisional offering
- **WHEN** the Consensus tab renders for a provisional offering, with or without a cupping average
- **THEN** no score renders and the rest of the tab renders as its own requirements state

#### Scenario: No score
- **WHEN** the Consensus tab renders for a verified offering carrying no cupping average
- **THEN** no score renders and the rest of the tab renders normally

### Requirement: Consensus SCA attribute averages
For a verified offering, the Consensus tab SHALL show the eight SCA attribute averages — fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel and overall — each labelled in the active locale on a read-only nine-bean scale filled up to the average, the last bean filled to the value's fraction, with the value as text. For an offering that is not verified, it SHALL show instead a message that the offering is not verified yet.

#### Scenario: Averages as bean scales
- **WHEN** the Consensus tab renders for an offering carrying attribute averages
- **THEN** one labelled, read-only bean scale renders per attribute, its beans filled up to the average and its value stated as text

#### Scenario: Fractional value
- **WHEN** an attribute average is not a whole number
- **THEN** the last filled bean is filled only to the value's fraction and the text states the value with its decimal

#### Scenario: Missing average
- **WHEN** an attribute average is absent
- **THEN** its scale renders nothing and the remaining scales render normally

#### Scenario: Offering not verified
- **WHEN** the Consensus tab renders for an offering that is not verified
- **THEN** no attribute scale and no attribute card render, and the not-verified message renders in their place

### Requirement: Consensus counts and concordances
The Consensus tab SHALL show the offering's evaluation count and defective evaluation count as labelled values, and its affective and descriptive concordances as labelled values that state the 0–1 value as text together with the word of its scale: below 0.50 Low, 0.50 to below 0.75 Moderate, 0.75 to below 0.90 High, 0.90 and above Excellent. The scale word SHALL never be conveyed by colour alone.

#### Scenario: Counts
- **WHEN** the Consensus tab renders
- **THEN** the evaluation count and the defective evaluation count render with their labels

#### Scenario: Concordance with its scale
- **WHEN** a concordance value renders
- **THEN** the value renders as text together with the word of its scale band

#### Scenario: Band boundaries
- **WHEN** a concordance is exactly 0.50, 0.75 or 0.90
- **THEN** it reads Moderate, High and Excellent respectively

#### Scenario: Missing value
- **WHEN** a count or concordance field is absent
- **THEN** its row renders nothing and the remaining rows render normally

### Requirement: Consensus Defects and Main tastes
The Consensus tab SHALL show the main tastes and the defects the CATA concordance identified as read-only selections of taxonomy badges — the identified notes of each group only — and beside each of those two cards SHALL show its consensus legend listing every note of the card with its `n/total` share, the evaluations that identified the note over the offering's total evaluations. A group with no identified note SHALL show an empty text in its card and no legend beside it.

#### Scenario: Identified notes
- **WHEN** the CATA concordance identified main tastes or defects
- **THEN** each identified note renders as its taxonomy badge in its group's card, and the legend beside the card lists each note with its `n/total` share

#### Scenario: Empty group
- **WHEN** the consensus identified no main taste, or no defect
- **THEN** its card shows the empty text and no legend renders beside it

#### Scenario: Unresolved reference
- **WHEN** an identified note matches no taxonomy
- **THEN** no badge renders for that note and the remaining notes render normally

### Requirement: Consensus taste trees
The Consensus tab SHALL present one interactive flavor wheel fed only the `aromatics` group of the offering's CATA concordance, and no wheel for the sensory taxonomy. Each segment SHALL carry the `n/total` legend of its note, and hovering or focusing it SHALL show the description of its olfactory taxonomy. An unresolved reference SHALL show no segment, and an empty concordance SHALL show the empty text instead of a wheel.

#### Scenario: One wheel from the CATA concordance
- **WHEN** the Consensus tab renders for an offering carrying a CATA concordance
- **THEN** exactly one flavor wheel renders, built from the concordance's `aromatics` group, and no sensory-profile wheel or heading renders

#### Scenario: Segment legend and description
- **WHEN** the visitor hovers a segment or focuses it with the keyboard
- **THEN** that segment's `n/total` legend and the description of its olfactory taxonomy show

#### Scenario: Unresolved reference
- **WHEN** a concordance reference matches no taxonomy
- **THEN** no segment renders for that reference and the remaining segments render normally

#### Scenario: Empty tree
- **WHEN** the concordance is empty
- **THEN** its card shows the empty text and no wheel renders

### Requirement: Mouthfeel group in the CATA wheel
When the CATA wheel holds aromatic and mouthfeel notes — a note is mouthfeel when its top-level taxonomy is in the mouthfeel category — each group SHALL occupy one contiguous arc, the arcs separated by a gap wider than between ordinary segments; a legend inside the wheel SHALL mark and name each arc, and a general legend beside it SHALL name the groups as text. With notes of one group only, no gap or group legend SHALL show.

#### Scenario: Two groups
- **WHEN** the CATA concordance carries aromatic and mouthfeel notes
- **THEN** the wheel shows the aromatic notes on one arc and the mouthfeel notes on another, the two arcs separated by gaps wider than the separation between ordinary segments, the inner legend marks and names each arc, and the general legend names both groups

#### Scenario: One group only
- **WHEN** the CATA concordance carries no mouthfeel note, or only mouthfeel notes
- **THEN** the wheel shows no group gap, no inner legend and no general legend

#### Scenario: Groups never by colour alone
- **WHEN** the two groups render
- **THEN** each group is named as text in the general legend, so telling the groups apart never rests on colour

### Requirement: Consensus detail by axis
Below a heading, the Consensus tab SHALL show one collapsible section per sensory-taxonomy axis — fragrance, aroma, flavor, aftertaste, mouthfeel, in that order — titled with the axis name and collapsed by default. Each section SHALL be a section card whose header band holds its collapsible header, the five cards 1rem apart on the page background with no card around them. Each SHALL show the axis's identified notes as read-only taxonomy badges in descriptor rows (level 2 not shown) and beside them a legend with each shown note's `n/total` share; an axis with no identified note SHALL show the empty text and no legend.

#### Scenario: Sections collapsed by default
- **WHEN** the Consensus tab renders
- **THEN** five section cards render in the axis order, 1rem apart, each with its axis name in its header band, and each is collapsed with its content out of the tab order

#### Scenario: Identified notes of an axis
- **WHEN** the visitor expands an axis section whose axis carries identified notes
- **THEN** each identified note shown by the descriptor rows renders as its taxonomy badge and the legend beside the selection lists each of them with its `n/total` share

#### Scenario: Empty axis
- **WHEN** the visitor expands an axis section whose axis carries no identified note
- **THEN** the section shows the empty text and no legend

### Requirement: Catalog and detail texts and metadata
Every text of the two screens — labels, captions, headings, messages and badge words — SHALL render in the active locale (Spanish, English or Catalan) from the message catalog, and no page text SHALL be hardcoded. Both pages SHALL carry the document title exactly `Tazavera` and a description drawn from the message catalog of the active locale.

#### Scenario: Texts follow the locale
- **WHEN** a visitor opens either screen in Spanish, English or Catalan
- **THEN** every text renders in that locale and no text renders in another

#### Scenario: Metadata
- **WHEN** a visitor opens either screen in any supported locale
- **THEN** the document title is exactly `Tazavera` and the description is that locale's metadata text

### Requirement: Filtered offerings scoped by a host
A view that lists offerings with the catalog's filters MAY fix query keys of the offerings request. A fixed key SHALL override the same key in the address, and the facets, "Clear all" and paging SHALL never remove it from the request. Every other key of the request SHALL follow the catalog's query rules. With no fixed key the request SHALL be the catalog's for the same address.

#### Scenario: Fixed key overrides the address
- **WHEN** a view fixes `coffeeshopUlid` to `Y` and the address carries `coffeeshopUlid=X&process=washed`
- **THEN** the request carries `coffeeshopUlid=Y` and `process=washed`

#### Scenario: Fixed key survives Clear all and paging
- **WHEN** the visitor of a view that fixes `coffeeshopUlid` activates "Clear all" or opens another page
- **THEN** the following request still carries the fixed `coffeeshopUlid`

#### Scenario: Catalog without fixed keys unchanged
- **WHEN** the visitor opens the offerings route with any address
- **THEN** the request is the one the catalog's query rules build from that address, with no key added

#### Scenario: Scoped list fails
- **WHEN** the request of a view with a fixed key fails
- **THEN** the view shows the catalog's error state and the facets keep their values

### Requirement: View evaluations link on the offering detail
The offering detail SHALL show a "View evaluations" link in the header's actions row, beside the specialist's Evaluate link and always, whatever the offering's evaluation count and whatever the visitor's session. Activating it SHALL open the public evaluations list of the `evaluations` capability at `/{locale}/evaluations?offeringId={ulid}`, so the list loads with the Offering facet selected and its chip applied. The link's accessible name SHALL be unique on the page.

#### Scenario: Opening the evaluations of an offering
- **WHEN** a visitor activates "View evaluations"
- **THEN** the public evaluations list opens with `offeringId` in the URL, the Offering facet showing the offering selected and the chip "Offering: {coffee name}" applied

#### Scenario: An offering without evaluations
- **WHEN** the visitor activates "View evaluations" on an offering with no evaluations and the list returns an empty page
- **THEN** the list shows its no-matches message with the "Clear all" control, and the Offering facet keeps the offering selected

#### Scenario: The link is always shown
- **WHEN** the offering detail renders for any visitor, signed in or not, with zero or more evaluations
- **THEN** the "View evaluations" link renders in the header's actions row before the Evaluate link

### Requirement: Provisional evaluation tab on the offering detail
The offering detail SHALL show a third tab labelled "Provisional evaluation" after "Inventory data" and "Consensus", reachable at `?tab=provisional`, whose panel shows the coffee shop's `baseline` evaluation of that offering read-only in the same read-only evaluation presentation as the evaluation view of the `evaluations` capability. When several baselines exist the newest SHALL be shown. The tab SHALL follow the same activation contract as the other tabs (manual activation, active tab in the URL, an absent or unknown `tab` value opening the Inventory data tab), and its loading, empty and error states SHALL stay inside the panel, leaving the header and the other tabs unaffected.

#### Scenario: Selecting the tab
- **WHEN** the visitor selects "Provisional evaluation"
- **THEN** the URL gains `tab=provisional`, the tab becomes selected with the same treatment as the other two, and the panel loads the offering's baseline evaluation

#### Scenario: Showing the baseline evaluation
- **WHEN** the panel's request returns 200 with at least one baseline evaluation
- **THEN** the presentation shows the newest one's results read-only, its summary, scales, descriptors, notes and extrinsic attributes following the read-only evaluation presentation of the `evaluations` capability

#### Scenario: An offering without a baseline evaluation
- **WHEN** the panel's request returns 200 with an empty `data`
- **THEN** the panel shows the provisional-empty message centred with no box

#### Scenario: The baseline cannot be loaded
- **WHEN** the panel's request fails with any non-2xx status or a transport failure
- **THEN** the panel shows the provisional-error message with a Retry control, and the header and the other tabs keep working unaffected

#### Scenario: Loading the panel
- **WHEN** the panel is being loaded
- **THEN** two placeholder cards render inside the panel only

#### Scenario: An unknown tab value in the URL
- **WHEN** the detail is opened with a `tab` value that is not one of the three tabs
- **THEN** the Inventory data tab is selected as when the value is absent

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
Each coffee shop card SHALL show, from the API's data: a "With verified offerings" badge when the coffee shop has at least one verified offering; the coffee shop name as a heading; its number of locations; the cities of its locations, each once, in the API's order; its number of offerings and of verified offerings; a View action button to the coffee shop detail; and, when at least one of its locations has coordinates, a named action that shows it on the map.

#### Scenario: Card content
- **WHEN** a coffee shop with two locations in one city, four offerings and one verified offering renders
- **THEN** the card shows the badge, the name, the two locations, the city once, the four offerings, the one verified offering and the View action

#### Scenario: No verified offering
- **WHEN** a coffee shop has no verified offering
- **THEN** its card shows no badge

#### Scenario: View link
- **WHEN** the visitor activates a card's View action, an action button and not a link
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
The coffee shop detail route SHALL render one coffee shop of the API, in the locale of the route and with no sign-in required: a back link to the previous page, whose fallback destination is the directory, the verified-offerings badge when it has verified offerings, the name as the page heading, its number of locations and its offering counts as captions, and its tabs. It SHALL cover loading, success and error states.

#### Scenario: Header
- **WHEN** the visitor opens the detail of a coffee shop with two locations, four offerings and one verified
- **THEN** the badge, the name heading, "2 locations" and "Offerings: 4 · Verified: 1" render

#### Scenario: Back link
- **WHEN** the visitor activates "Back to coffee shops"
- **THEN** the previous page of the application opens with its query, or the directory route of the active locale when there is no previous page of the application

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
- **THEN** the following page opens at the same detail route with the filters and the Offerings tab kept

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

### Requirement: Public reads through the shared public request client
Every public read of the front (the coffees, roasteries, evaluations, taxonomies and offerings reads) SHALL be sent through the shared public request client, the one place that builds the API URL from the configured base. The requests sent to the API SHALL stay the same: method, path, query string, headers and request options.

#### Scenario: Public read sent through the shared client
- **WHEN** a public read of the front is sent
- **THEN** it goes through the shared public request client and no other module builds its URL from the configured API base

#### Scenario: Requests unchanged
- **WHEN** a public read is sent with the API base configured
- **THEN** the API receives the same method, URL, query string, headers and request options as before the refactor, and the read returns the same result
