## MODIFIED Requirements

### Requirement: My offerings list
The list route SHALL show the offerings of the signed-in coffeeshop — the API's offering list filtered by the coffeeshop's user identifier — one offering card per offering of the current page, in a grid of one column below the large breakpoint (1024px), two columns from 1024px and three from the extra-large breakpoint (1536px), with the cards of one row sharing their height. Each card's footer SHALL hold the View action followed by the Delete action, each a button of the footer's group of actions with no other control between them, at the same height, so at 375px and at 1280px every button of the card lies inside the card, moving to a new line when the row has no room, and the page does not scroll sideways. The View action's accessible name SHALL start with its visible label and then name the offering by its coffee name and its location name, as the Select and Delete controls do, while its visible text stays the label alone. The requested page SHALL live in the route's query (`?page=n`) and Previous and Next pagination SHALL follow the API's current and last page. The list SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the coffeeshop's offerings load and the API returns offerings
- **THEN** one offering card renders per offering of the current page, the selection toolbar renders above the grid, and the pagination reflects the API's current and last page

#### Scenario: Grid beside the sidebar
- **WHEN** the list renders offering cards
- **THEN** the cards fill one column below 1024px, two from 1024px and three from 1536px, separated by a gap, and the cards of one row share the same height

#### Scenario: Card actions fit the card
- **WHEN** the list renders offering cards
- **THEN** each card's footer group of actions holds exactly the View button followed by the Delete button, both directly in the group, with no Select control in the footer, and both buttons at the same height

#### Scenario: Loading
- **WHEN** the list is loading its data
- **THEN** three skeleton cards render in the grid's place, the page heading renders, and no toolbar, empty message or error message renders

#### Scenario: Empty
- **WHEN** the coffeeshop has no offerings
- **THEN** a message and the "New offering" button render and no offering card renders

#### Scenario: Error and retry
- **WHEN** the offerings cannot be loaded, whether the request fails or returns a non-success status
- **THEN** a message and a retry action render and no offering card renders

#### Scenario: Retry reloads
- **WHEN** the coffeeshop activates the retry action
- **THEN** the list loads again through its loading state into success, empty or error

#### Scenario: Paging
- **WHEN** the coffeeshop activates Previous or Next
- **THEN** the route's `page` query changes to the preceding or following page and the list shows that page

#### Scenario: Paging at the boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable, and when it shows the last page Next is unavailable

#### Scenario: New offering action
- **WHEN** the list route renders for a signed-in coffeeshop, in its header or in the empty state
- **THEN** "New offering" is a button in positional treatment 1, not a link, and activating it opens the create route

#### Scenario: View names the offering
- **WHEN** the list renders offering cards
- **THEN** each card's View button is named by its visible label followed by the offering's coffee name and location name, as its Delete button is, and its visible text is the label alone

### Requirement: Coffee inventory card
Each inventory card SHALL show, from the item's fields only: the coffee name (`coffee.name`) as the card heading; the origin line joining `coffee.country` and `coffee.region` with " · ", skipping an empty part; and labelled values for process (`coffee.process`), variety (`coffee.variety`), roast level (`coffee.roastLevel`), altitude (`coffee.altitude`, followed by " m"), producer (`coffee.producer`, only when not null), certifications (the `code` of each item of `coffee.certifications` joined with ", ", only when there is at least one), roastery (`roastery.name`), roast lot (`roastLot`) and production date (`productionDate`). API values SHALL render exactly as returned, untranslated. The card's actions SHALL be, in this order, "View", an action button in positional treatment 3 that opens the item's detail `/{locale}/manage/inventory/{ulid}`, and "Create offering", an action button in positional treatment 1 that opens New offering with that item preselected (see "Creating an offering from an inventory item"). The accessible name of each of these two actions SHALL start with its visible label and then name the item's coffee (`coffee.name`), followed by its roastery (`roastery.name`) when the item has one, while its visible text stays the label alone.

#### Scenario: Card contents
- **WHEN** an inventory card renders for an item with a producer and one certification
- **THEN** it shows the coffee name, the country and region line, and the process, variety, roast level, altitude, producer, certification code, roastery name, roast lot and production date, each exactly as returned, with the altitude followed by " m"

#### Scenario: No producer and no certification
- **WHEN** an inventory card renders for an item whose `coffee.producer` is null and whose `coffee.certifications` is empty
- **THEN** no producer row and no certifications row render

#### Scenario: Card actions
- **WHEN** an inventory card renders
- **THEN** "View" is a button in positional treatment 3 that opens `/{locale}/manage/inventory/{ulid}`, and "Create offering" is a button in positional treatment 1 that opens `/{locale}/manage/offerings/new?inventory={ulid}`

#### Scenario: Card actions name the coffee
- **WHEN** the list renders an inventory card for an item with a roastery and one for an item without a roastery
- **THEN** each card's "View" and "Create offering" are named by their visible label followed by the item's coffee name and, for the item with a roastery, the roastery name, and the visible text of each is the label alone
