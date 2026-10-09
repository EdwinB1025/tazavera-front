## MODIFIED Requirements

### Requirement: Offering detail page
The offering detail route SHALL render one offering of the API, in the locale of the route and with no sign-in required: a back link to the previous page, whose fallback destination is the offerings route, the verification state badge, the coffee name as the page heading, the coffeeshop name and the roaster name as labeled captions, an Evaluate button for a signed-in specialist only, and the offering's tabs below the header. The header and the tabs SHALL sit on the page background, with the tab panels' cards hanging from it. It SHALL show no score in the header and SHALL cover loading, success and error states. On success it SHALL repeat the back control as a back button, with the same text and destination, as the last block of the page, after the tabs and outside any tab panel; the loading and error states SHALL keep only the top back link.

#### Scenario: Header
- **WHEN** the visitor opens the detail route of an offering
- **THEN** the verification badge, the coffee name heading and the coffeeshop and roaster captions render with the API's names, and no score renders in the header

#### Scenario: Detail on the page background
- **WHEN** the detail of an offering renders
- **THEN** the back link, the header, the tab bar and the panels' cards render on the page background, and no section background renders on the page

#### Scenario: Evaluate link for specialists
- **WHEN** the viewer is signed in with the specialist role
- **THEN** an Evaluate button renders, addressing the new-evaluation route of the active locale with the offering's identifier

#### Scenario: No Evaluate link for other viewers
- **WHEN** the viewer is anonymous or signed in with another role
- **THEN** no Evaluate button renders

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

#### Scenario: Back link at the end
- **WHEN** the detail of an offering renders its content
- **THEN** a second back button with the same text and destination renders after the last tab panel, outside any tab panel

#### Scenario: Back buttons on the offering detail
- **WHEN** the detail of an offering renders, while loading, on an error or with its content
- **THEN** its top back control is a link, the one at the end is a button with the same text and destination, and the Evaluate action for a specialist is a button, not a link

### Requirement: Coffee shop detail page
The coffee shop detail route SHALL render one coffee shop of the API, in the locale of the route and with no sign-in required: a back link to the previous page, whose fallback destination is the directory, the verified-offerings badge when it has verified offerings, the name as the page heading, its number of locations and its offering counts as captions, and its tabs. It SHALL cover loading, success and error states. On success it SHALL repeat the back control as a back button, with the same text and destination, as the last block of the page, after the tabs and outside any tab panel; the loading and error states SHALL keep only the top back link.

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

#### Scenario: Back link at the end
- **WHEN** the detail of a coffee shop renders its content
- **THEN** a second back button with the same text and destination renders after the last tab panel, outside any tab panel

#### Scenario: Back buttons on the coffee shop detail
- **WHEN** the detail of a coffee shop renders its content
- **THEN** its top back control is a link and the one at the end is a button, with the same text and destination
