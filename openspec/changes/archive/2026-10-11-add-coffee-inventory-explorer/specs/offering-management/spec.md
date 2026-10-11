## ADDED Requirements

### Requirement: Access to the coffee inventory pages
The inventory list `/{locale}/manage/inventory` and the inventory detail `/{locale}/manage/inventory/{ulid}` SHALL present their content only to a signed-in coffeeshop, through the protected content gate (app-shell "Protected content gate"). While the session is being resolved the page SHALL show its heading block and its loading presentation. An anonymous visitor SHALL see the heading block, the signed-out message and a "Sign in" action in place of the content, with no redirect. A signed-in user whose role is not `coffeeshop` SHALL get the 404 page, and no inventory request SHALL be sent before the session is a signed-in coffeeshop.

#### Scenario: Session loading
- **WHEN** a visitor opens the inventory list while the session is being resolved
- **THEN** the heading block and the loading presentation render, and neither the signed-out message, a card nor the 404 page renders

#### Scenario: Anonymous visitor
- **WHEN** an anonymous visitor opens the inventory list
- **THEN** the heading block, the signed-out message and its "Sign in" action render in place of the list, no inventory request is sent, and activating "Sign in" starts the sign-in flow for the inventory route

#### Scenario: Another role
- **WHEN** a signed-in user whose role is not `coffeeshop` opens the inventory list or an inventory detail
- **THEN** the 404 page renders and no inventory request is sent

### Requirement: Coffee inventory list
For a signed-in coffeeshop the inventory list SHALL read `GET /coffeeInventory` with the filters the address carries (see filtering "Inventory filter state in the URL") and show every returned item, in the order returned, as one inventory card per item in a grid of one column below 1024px, two columns from 1024px and three from 1536px, the cards of one row sharing their height. The contract has no pagination: the list SHALL show no pagination. The page SHALL show, above the results, the heading block (the "Management" eyebrow, the heading "Coffee inventory" and an intro line) and the list toolbar (filtering "Inventory filter toolbar"). The list SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the read answers `200` with inventory items
- **THEN** one inventory card renders per returned item, in the order returned, and no pagination renders

#### Scenario: Loading
- **WHEN** the read is pending
- **THEN** three skeleton cards render in the grid's place and no card, empty message or error message renders

#### Scenario: Empty
- **WHEN** no filter is applied and the read answers `200` with an empty `data`
- **THEN** the empty message "There is no coffee in the inventory." renders and no card renders

#### Scenario: Error and retry
- **WHEN** the read answers any non-2xx status or fails, and the coffeeshop then activates the retry action
- **THEN** the error message and a retry action render in the list's place, no card renders, and the retry sends the read again through the loading state

### Requirement: Coffee inventory card
Each inventory card SHALL show, from the item's fields only: the coffee name (`coffee.name`) as the card heading; the origin line joining `coffee.country` and `coffee.region` with " · ", skipping an empty part; and labelled values for process (`coffee.process`), variety (`coffee.variety`), roast level (`coffee.roastLevel`), altitude (`coffee.altitude`, followed by " m"), producer (`coffee.producer`, only when not null), certifications (the `code` of each item of `coffee.certifications` joined with ", ", only when there is at least one), roastery (`roastery.name`), roast lot (`roastLot`) and production date (`productionDate`). API values SHALL render exactly as returned, untranslated. The card's actions SHALL be, in this order, "View", an action button in positional treatment 3 that opens the item's detail `/{locale}/manage/inventory/{ulid}`, and "Create offering", an action button in positional treatment 1 that opens New offering with that item preselected (see "Creating an offering from an inventory item").

#### Scenario: Card contents
- **WHEN** an inventory card renders for an item with a producer and one certification
- **THEN** it shows the coffee name, the country and region line, and the process, variety, roast level, altitude, producer, certification code, roastery name, roast lot and production date, each exactly as returned, with the altitude followed by " m"

#### Scenario: No producer and no certification
- **WHEN** an inventory card renders for an item whose `coffee.producer` is null and whose `coffee.certifications` is empty
- **THEN** no producer row and no certifications row render

#### Scenario: Card actions
- **WHEN** an inventory card renders
- **THEN** "View" is a button in positional treatment 3 that opens `/{locale}/manage/inventory/{ulid}`, and "Create offering" is a button in positional treatment 1 that opens `/{locale}/manage/offerings/new?inventory={ulid}`

### Requirement: Coffee inventory detail
The detail page `/{locale}/manage/inventory/{ulid}` SHALL read the same `GET /coffeeInventory`, with no filter, and show the returned item whose `ulid` is the route's: its header shows, in this order, a back link to the previous page whose fallback destination is `/{locale}/manage/inventory` (base-controls "Back link to the previous page"), the "Coffee inventory" eyebrow, the coffee name as the page heading and "Create offering" as an action button in positional treatment 1 with the card's destination; below the header, a section card lists every field of the item as labelled values — the card's fields plus the coffee's lot (`coffee.lot`), each certification's `code` with its `description`, and the roastery's `description` when present. While the read is pending the page SHALL show the loading status below the back link; when it fails, the error message and a retry action. When no returned item has the route's `ulid`, the page SHALL show, in place of the header and the fields, the title "Inventory item not found" as the page heading, the line "It may have been removed, or the link may be wrong." below it and a back button in positional treatment 3 with the back text, addressing `/{locale}/manage/inventory`, with no retry action.

#### Scenario: Detail of an item
- **WHEN** the read answers `200` and an item has the route's `ulid`
- **THEN** the back link renders first, then the eyebrow, the coffee name as the page heading and the "Create offering" button, and the section card shows every field of the item, including the coffee's lot, each certification's code and description and the roastery's description, exactly as returned

#### Scenario: Detail loading
- **WHEN** the read is pending
- **THEN** the back link and the loading status render, and no heading of the item renders

#### Scenario: Detail error and retry
- **WHEN** the read answers any non-2xx status or fails, and the coffeeshop then activates the retry action
- **THEN** the error message and a retry action render, and the retry sends the read again

#### Scenario: Unknown item
- **WHEN** the read answers `200` and no item has the route's `ulid`
- **THEN** the heading "Inventory item not found", the line "It may have been removed, or the link may be wrong." and a back button to `/{locale}/manage/inventory` render, with no retry action and no back link

### Requirement: Creating an offering from an inventory item
New offering opened with the query `inventory={ulid}` SHALL read `GET /coffeeInventory` with no filter and, when an item has that `ulid`, choose it in the inventory field as if the user had chosen its result row: the input shows its coffee name and the field's help shows its `roastLot` and `productionDate`, so the coffee shop only picks the locations. A choice the user makes before the read answers SHALL be kept. When the query is absent, no item has that `ulid`, or the read fails, New offering SHALL behave as it does without the query: the field stays empty and its typing hint shows, with no error. Every other behaviour of "Creating offerings" stays as stated, the reset after a successful create included.

#### Scenario: Preselected item
- **WHEN** New offering opens with `inventory={ulid}` and the read returns an item with that `ulid`
- **THEN** the inventory input shows the item's coffee name, the field's help shows its `roastLot` and `productionDate`, and submitting sends that item's `ulid` as `coffeeInventoryId`

#### Scenario: Unknown preselected item
- **WHEN** New offering opens with `inventory={ulid}` and no returned item has that `ulid`
- **THEN** the inventory input is empty, the typing hint shows as the field's help, and no error renders

### Requirement: Coffee inventory sidebar
On the inventory list and the inventory detail, the sidebar SHALL show the coffee shop's management entries "Manage offerings" and "Manage locations", neither marked as the current page, followed by the entry "Explore coffee inventory", addressing `/{locale}/manage/inventory` and marked as the current page. On the list, that entry SHALL hold the inventory facets in its sub-section (filtering "Inventory facets in the sidebar"); on the detail it SHALL hold none.

#### Scenario: Entries on the inventory list
- **WHEN** a signed-in coffeeshop opens the inventory list
- **THEN** the sidebar shows "Manage offerings", "Manage locations" and "Explore coffee inventory" in this order, only the last marked as the current page, with the "Filters" toggle below it
