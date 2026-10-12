## MODIFIED Requirements

### Requirement: Management sidebar entry
The offerings list, offering creation, locations, inventory list and inventory detail routes SHALL show three sidebar entries in this order, each with an icon and a visible label: "Manage offerings", addressing the list route, "Manage locations", addressing `/{locale}/manage/locations`, and "Explore coffee inventory", addressing `/{locale}/manage/inventory`. "Manage offerings" SHALL be the current entry on the list and create routes, "Manage locations" on the locations route and "Explore coffee inventory" on the inventory list and detail routes. The create route has no entry; it stays reachable from the list's "New offering" link and its empty-state link.

#### Scenario: One entry
- **WHEN** a signed-in coffeeshop opens any coffee shop management route
- **THEN** the sidebar shows the "Manage offerings" entry, then the "Manage locations" entry, then the "Explore coffee inventory" entry, each with its icon and label, and no "My offerings" or "New offering" entry

#### Scenario: Current entry marked
- **WHEN** the list route or the create route is open
- **THEN** the "Manage offerings" entry is marked as the current page and the "Manage locations" and "Explore coffee inventory" entries are not

#### Scenario: Locations entry marked
- **WHEN** the locations route is open
- **THEN** the "Manage locations" entry is marked as the current page and the "Manage offerings" and "Explore coffee inventory" entries are not

#### Scenario: Entry navigates
- **WHEN** the coffeeshop activates the "Manage offerings" entry
- **THEN** the list route opens

#### Scenario: Locations entry navigates
- **WHEN** the coffeeshop activates the "Manage locations" entry
- **THEN** the locations route opens

#### Scenario: Inventory entry navigates
- **WHEN** the coffeeshop activates the "Explore coffee inventory" entry
- **THEN** the inventory list `/{locale}/manage/inventory` opens

### Requirement: Coffee inventory sidebar
On the inventory list and the inventory detail, the sidebar SHALL show the coffee shop's management entries "Manage offerings" and "Manage locations", neither marked as the current page, followed by the entry "Explore coffee inventory", addressing `/{locale}/manage/inventory` and marked as the current page, each with its icon and visible label. On the list, that entry SHALL hold the inventory facets in its sub-section (filtering "Inventory facets in the sidebar"); on the detail it SHALL hold none.

#### Scenario: Entries on the inventory list
- **WHEN** a signed-in coffeeshop opens the inventory list
- **THEN** the sidebar shows "Manage offerings", "Manage locations" and "Explore coffee inventory" in this order, each with its icon, only the last marked as the current page, with the "Filters" toggle below it

#### Scenario: Entries on the inventory detail
- **WHEN** a signed-in coffeeshop opens an inventory item's detail
- **THEN** the sidebar shows the same three entries in this order, each with its icon, only "Explore coffee inventory" marked as the current page, and no "Filters" toggle
