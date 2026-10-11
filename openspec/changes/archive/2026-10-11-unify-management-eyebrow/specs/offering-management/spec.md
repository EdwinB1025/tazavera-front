## MODIFIED Requirements

### Requirement: Coffee inventory list
For a signed-in coffeeshop the inventory list SHALL read `GET /coffeeInventory` with the filters the address carries (see filtering "Inventory filter state in the URL") and show every returned item, in the order returned, as one inventory card per item in a grid of one column below 1024px, two columns from 1024px and three from 1536px, the cards of one row sharing their height. The contract has no pagination: the list SHALL show no pagination. The page SHALL show, above the results, the heading block (the "Management" eyebrow, the heading "Coffee inventory" and an intro line) and the list toolbar (filtering "Inventory filter toolbar"). The eyebrow SHALL use the management eyebrow style (`type-eyebrow-strong`: semibold, uppercase, in the label color), the same as My offerings and New offering. The list SHALL cover loading, empty, success and error states.

#### Scenario: Inventory list eyebrow
- **WHEN** the inventory list renders its heading block
- **THEN** the "Management" eyebrow renders in the management eyebrow style (`type-eyebrow-strong`), the same as the My offerings eyebrow

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

### Requirement: Coffee inventory detail
The detail page `/{locale}/manage/inventory/{ulid}` SHALL read the same `GET /coffeeInventory`, with no filter, and show the returned item whose `ulid` is the route's: its header shows, in this order, a back link to the previous page whose fallback destination is `/{locale}/manage/inventory` (base-controls "Back link to the previous page"), the "Coffee inventory" eyebrow in the management eyebrow style (`type-eyebrow-strong`: semibold, uppercase, in the label color, the same as My offerings and New offering), the coffee name as the page heading and "Create offering" as an action button in positional treatment 1 with the card's destination; below the header, a section card lists every field of the item as labelled values — the card's fields plus the coffee's lot (`coffee.lot`), each certification's `code` with its `description`, and the roastery's `description` when present. While the read is pending the page SHALL show the loading status below the back link; when it fails, the error message and a retry action. When no returned item has the route's `ulid`, the page SHALL show, in place of the header and the fields, the title "Inventory item not found" as the page heading, the line "It may have been removed, or the link may be wrong." below it and a back button in positional treatment 3 with the back text, addressing `/{locale}/manage/inventory`, with no retry action.

#### Scenario: Detail of an item
- **WHEN** the read answers `200` and an item has the route's `ulid`
- **THEN** the back link renders first, then the eyebrow, the coffee name as the page heading and the "Create offering" button, and the section card shows every field of the item, including the coffee's lot, each certification's code and description and the roastery's description, exactly as returned

#### Scenario: Inventory detail eyebrow
- **WHEN** the read answers `200` and an item has the route's `ulid`
- **THEN** the "Coffee inventory" eyebrow renders in the management eyebrow style (`type-eyebrow-strong`), the same as the My offerings eyebrow

#### Scenario: Detail loading
- **WHEN** the read is pending
- **THEN** the back link and the loading status render, and no heading of the item renders

#### Scenario: Detail error and retry
- **WHEN** the read answers any non-2xx status or fails, and the coffeeshop then activates the retry action
- **THEN** the error message and a retry action render, and the retry sends the read again

#### Scenario: Unknown item
- **WHEN** the read answers `200` and no item has the route's `ulid`
- **THEN** the heading "Inventory item not found", the line "It may have been removed, or the link may be wrong." and a back button to `/{locale}/manage/inventory` render, with no retry action and no back link

