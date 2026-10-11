## MODIFIED Requirements

### Requirement: Coffee shop detail page
The coffee shop detail route SHALL render one coffee shop of the API, in the locale of the route and with no sign-in required: a back link to the previous page, whose fallback destination is the directory, the verified-offerings badge when it has verified offerings, the name as the page heading, its number of locations and its offering counts as captions, and its tabs. It SHALL cover loading, success and error states. On success it SHALL repeat the back control as a back button, with the same text and destination, as the last block of the page, after the tabs and outside any tab panel; the loading and error states SHALL keep only the top back link. It SHALL also cover the not-found state: when the API answers `404` for the identifier, the page SHALL show, in place of the header and the tabs, the title "Coffee shop not found" as the page heading and the line "It may have been removed, or the link may be wrong." below it (in the route's locale), followed by the back button, with no retry action and no back link. Every back control of the page, in every state, SHALL read "Back" in the route's locale (es "Volver", en "Back", ca "Tornar").

#### Scenario: Header
- **WHEN** the visitor opens the detail of a coffee shop with two locations, four offerings and one verified
- **THEN** the badge, the name heading, "2 locations" and "Offerings: 4 · Verified: 1" render

#### Scenario: Back link
- **WHEN** the visitor activates "Back"
- **THEN** the previous page of the application opens with its query, or the directory route of the active locale when there is no previous page of the application

#### Scenario: Loading
- **WHEN** the coffee shop is loading
- **THEN** the "Back" link, placeholder bars in the header's place and skeleton cards in the tabs' place render

#### Scenario: Unknown coffee shop
- **WHEN** the coffee shop request answers `404` for the identifier
- **THEN** the heading "Coffee shop not found" and the line "It may have been removed, or the link may be wrong." render, the "Back" button renders below them, and no retry action and no tab render

#### Scenario: Unknown coffee shop or failure
- **WHEN** the request fails or returns a non-success status other than `404`
- **THEN** the "Back" link renders and, below it, a message saying the coffee shop could not be loaded with a retry action, and no tab renders

#### Scenario: Back link at the end
- **WHEN** the detail of a coffee shop renders its content
- **THEN** a second "Back" button with the same destination renders after the last tab panel, outside any tab panel

#### Scenario: Back buttons on the coffee shop detail
- **WHEN** the detail of a coffee shop renders its content
- **THEN** its top back control is a link and the one at the end is a button, with the same text and destination

#### Scenario: Back label in each locale
- **WHEN** the detail of a coffee shop renders its content in es, en or ca
- **THEN** its top back link and its back button both read "Volver", "Back" or "Tornar" respectively, the link pointing at the directory route of that locale
