## MODIFIED Requirements

### Requirement: Coffee inventory detail
The detail page `/{locale}/manage/inventory/{ulid}` SHALL read the same `GET /coffeeInventory`, with no filter, and show the returned item whose `ulid` is the route's: its header shows, in this order, a back link to the previous page whose fallback destination is `/{locale}/manage/inventory` (base-controls "Back link to the previous page"), the "Coffee inventory" eyebrow in the management eyebrow style (`type-eyebrow-strong`: semibold, uppercase, in the label color, the same as My offerings and New offering), the coffee name as the page heading and "Create offering" as an action button in positional treatment 1 with the card's destination; below the header, a section card lists every field of the item as labelled values — the card's fields plus the coffee's lot (`coffee.lot`), each certification's `code` with its `description`, and the roastery's `description` when present. While the read is pending the page SHALL show the loading status below the back link; when it fails, the error message and a retry action. The content below the back link — the item's header and section card, the loading status, or the error message with its retry action — SHALL fill the page container's width at every width, like the offering detail, while the back link keeps its own width at the start of its line. When no returned item has the route's `ulid`, the page SHALL show, in place of the header and the fields, the title "Inventory item not found" as the page heading, the line "It may have been removed, or the link may be wrong." below it and a back button in positional treatment 3 with the back text, addressing `/{locale}/manage/inventory`, with no retry action.

#### Scenario: Detail of an item
- **WHEN** the read answers `200` and an item has the route's `ulid`
- **THEN** the back link renders first, then the eyebrow, the coffee name as the page heading and the "Create offering" button, and the section card shows every field of the item, including the coffee's lot, each certification's code and description and the roastery's description, exactly as returned

#### Scenario: Inventory detail eyebrow
- **WHEN** the read answers `200` and an item has the route's `ulid`
- **THEN** the "Coffee inventory" eyebrow renders in the management eyebrow style (`type-eyebrow-strong`), the same as the My offerings eyebrow

#### Scenario: Detail fills the page width
- **WHEN** the read answers `200` and an item has the route's `ulid`
- **THEN** the back link's column aligns its items to the start (`items-start`), so the back link keeps its own width, and the block holding the content below the back link stretches across that column (`self-stretch`), so the header and the section card fill the page container's width; the loading status and the error state render in that same stretched block

#### Scenario: Detail loading
- **WHEN** the read is pending
- **THEN** the back link and the loading status render, and no heading of the item renders

#### Scenario: Detail error and retry
- **WHEN** the read answers any non-2xx status or fails, and the coffeeshop then activates the retry action
- **THEN** the error message and a retry action render, and the retry sends the read again

#### Scenario: Unknown item
- **WHEN** the read answers `200` and no item has the route's `ulid`
- **THEN** the heading "Inventory item not found", the line "It may have been removed, or the link may be wrong." and a back button to `/{locale}/manage/inventory` render, with no retry action and no back link
