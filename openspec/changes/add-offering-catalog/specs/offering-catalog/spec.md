# Spec Delta

## Purpose

Defines Tazavera's public offering catalog and offering detail: how any visitor browses the offerings behind a query of the address and inspects one offering's inventory data and cupping consensus, in every supported locale and in both themes.

## ADDED Requirements

### Requirement: Offering catalog page
The offerings route SHALL render, in the locale of the route and with no sign-in required, the offerings the API returns for the query of the address, one offering card per offering of the current page, and SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the visitor opens the offerings route and the API returns offerings
- **THEN** one offering card renders per offering of the current page and the pagination reflects the API's current and last page

#### Scenario: Loading
- **WHEN** the offerings are loading
- **THEN** skeleton cards render in the grid's place and no empty or error message renders

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

### Requirement: Catalog grid by available width
The catalog's cards SHALL fill one column, two columns when the width available to the results region reaches 768px, and three columns when it reaches 1280px, separated by a 1.5rem gap, with the cards of one row sharing the same height. The columns SHALL follow the width available to the results region, so content beside the region narrows the columns instead of squeezing the cards.

#### Scenario: Columns by region width
- **WHEN** the results region renders at some width
- **THEN** the cards fill one, two or three columns according to that width's thresholds, whatever the viewport width

#### Scenario: Equal card heights
- **WHEN** one row of cards renders
- **THEN** the cards of that row share the same height

### Requirement: Offering detail page
The offering detail route SHALL render one offering of the API, in the locale of the route and with no sign-in required: a back link to the offerings route, the verification state badge, the coffee name as the page heading, the coffeeshop name and the roaster name as labeled captions, an Evaluate link for a signed-in specialist only, and the offering's tabs below the header. It SHALL show no score in the header and SHALL cover loading, success and error states.

#### Scenario: Header
- **WHEN** the visitor opens the detail route of an offering
- **THEN** the verification badge, the coffee name heading and the coffeeshop and roaster captions render with the API's names, and no score renders in the header

#### Scenario: Evaluate link for specialists
- **WHEN** the viewer is signed in with the specialist role
- **THEN** an Evaluate link renders, addressing the new-evaluation route of the active locale with the offering's identifier

#### Scenario: No Evaluate link for other viewers
- **WHEN** the viewer is anonymous or signed in with another role
- **THEN** no Evaluate link renders

#### Scenario: Back link
- **WHEN** the visitor activates the back link
- **THEN** the offerings route of the active locale opens

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
- **THEN** no score renders and the rest of the tab renders normally

#### Scenario: No score
- **WHEN** the Consensus tab renders for a verified offering carrying no cupping average
- **THEN** no score renders and the rest of the tab renders normally

### Requirement: Consensus SCA attribute averages
The Consensus tab SHALL show the eight SCA attribute averages — fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel and overall — each labelled with its attribute name in the active locale, on a read-only nine-bean scale that fills the beans up to the average and fills the last bean only to the value's fraction when it is not whole. Each scale SHALL state its value as text beside the beans and SHALL change nothing on interaction.

#### Scenario: Averages as bean scales
- **WHEN** the Consensus tab renders for an offering carrying attribute averages
- **THEN** one labelled, read-only bean scale renders per attribute, its beans filled up to the average and its value stated as text

#### Scenario: Fractional value
- **WHEN** an attribute average is not a whole number
- **THEN** the last filled bean is filled only to the value's fraction and the text states the value with its decimal

#### Scenario: Missing average
- **WHEN** an attribute average is absent
- **THEN** its scale renders nothing and the remaining scales render normally

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
The Consensus tab SHALL show the main tastes and the defects the consensus identified as read-only selections of taxonomy badges — the identified notes of each group only — and beside each of those two cards SHALL show its consensus legend listing every note of the card with its `n/total` share, the evaluations that identified the note over the offering's total evaluations. A group with no identified note SHALL show an empty text in its card and no legend beside it.

#### Scenario: Identified notes
- **WHEN** the consensus identified main tastes or defects
- **THEN** each identified note renders as its taxonomy badge in its group's card, and the legend beside the card lists each note with its `n/total` share

#### Scenario: Empty group
- **WHEN** the consensus identified no main taste, or no defect
- **THEN** its card shows the empty text and no legend renders beside it

#### Scenario: Unresolved reference
- **WHEN** an identified note matches no taxonomy
- **THEN** no badge renders for that note and the remaining notes render normally

### Requirement: Consensus taste trees
The Consensus tab SHALL present the offering's sensory taxonomy tree and CATA concordance tree as interactive flavor wheels — circular diagrams laid out from the center outward by level — one wheel per tree. Each segment SHALL carry the `n/total` legend of its note, and hovering a segment or focusing it with the keyboard SHALL show the description of that olfactory taxonomy. A reference that resolves to no taxonomy SHALL show no segment, and an empty tree SHALL show the empty text instead of a wheel.

#### Scenario: One wheel per tree
- **WHEN** the Consensus tab renders for an offering carrying taxonomy trees
- **THEN** one flavor wheel renders for the sensory taxonomy and one for the CATA concordance

#### Scenario: Segment legend and description
- **WHEN** the visitor hovers a segment or focuses it with the keyboard
- **THEN** that segment's `n/total` legend and the description of its olfactory taxonomy show

#### Scenario: Unresolved reference
- **WHEN** a tree reference matches no taxonomy
- **THEN** no segment renders for that reference and the remaining segments render normally

#### Scenario: Empty tree
- **WHEN** a tree is empty
- **THEN** its card shows the empty text and no wheel renders

### Requirement: Catalog and detail texts and metadata
Every text of the two screens — labels, captions, headings, messages and badge words — SHALL render in the active locale (Spanish, English or Catalan) from the message catalog, and no page text SHALL be hardcoded. Both pages SHALL carry the document title exactly `Tazavera` and a description drawn from the message catalog of the active locale.

#### Scenario: Texts follow the locale
- **WHEN** a visitor opens either screen in Spanish, English or Catalan
- **THEN** every text renders in that locale and no text renders in another

#### Scenario: Metadata
- **WHEN** a visitor opens either screen in any supported locale
- **THEN** the document title is exactly `Tazavera` and the description is that locale's metadata text
