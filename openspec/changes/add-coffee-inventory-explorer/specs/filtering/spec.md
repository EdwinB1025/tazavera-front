## ADDED Requirements

### Requirement: Inventory facets in the sidebar
On the inventory list `/{locale}/manage/inventory` the sidebar SHALL hold the facet panel titled "Filters" in the sub-section of the "Explore coffee inventory" entry, with the behaviour of "Sidebar facets sub-section", holding six text facets in this order, each limited to the contract's maximum length: Coffee name (search field, 150), Country (60), Region (90), Process (60), Producer (150) and City (90). Each facet SHALL show the value the address carries. The panel SHALL hold no other facet.

#### Scenario: Facets in order
- **WHEN** the inventory list renders its sidebar with the address `?coffeeName=geisha&city=Barcelona`
- **THEN** the panel shows Coffee name, Country, Region, Process, Producer and City in that order, Coffee name showing "geisha" and City showing "Barcelona"

### Requirement: Inventory filter state in the URL
Committing an inventory facet SHALL navigate to the inventory list with that facet's key replaced — `coffeeName`, `originCountry`, `originRegion`, `process`, `producer` or `city`, trimmed, an empty value removing the key — keeping every other key. The inventory read SHALL carry exactly the facet keys the address carries, by those names; a value longer than its key's limit (`coffeeName` 150, `originCountry` 60, `originRegion` 90, `process` 60, `producer` 150, `city` 90) SHALL be dropped before the request and its facet SHALL show no value, and no other key of the address SHALL reach the request.

#### Scenario: Commit a text facet
- **WHEN** the coffeeshop types "Huila" in Region and presses Enter
- **THEN** the address carries `originRegion=Huila`, keeps the other filters, and the read is sent again with `originRegion=Huila`

#### Scenario: Out-of-range value in the address
- **WHEN** the address carries a `city` longer than 90 characters and an unknown key
- **THEN** neither the `city` key nor the unknown key is sent to the API, and the City facet shows no value

### Requirement: Applied inventory filters
The panel SHALL show one removable chip per applied inventory filter, in facet order, and "Clear all", which SHALL remove every facet key. The Filters trigger SHALL count the same chips.

#### Scenario: Remove one chip
- **WHEN** the coffeeshop removes the Process chip while Process and Country are applied
- **THEN** the address drops `process` and keeps `originCountry`

#### Scenario: Clear all
- **WHEN** the coffeeshop activates "Clear all" with three filters applied
- **THEN** the address is the bare inventory path, with no query

### Requirement: Inventory filter toolbar
The inventory list's body toolbar SHALL show the Filters trigger at its start — "Filters" or "Filters ({count})" with the applied chips' count — with the behaviour of the other lists' trigger (it opens the sidebar with its filters sub-section open). The toolbar SHALL show no sort control.

#### Scenario: Trigger count
- **WHEN** two inventory filters are applied
- **THEN** the trigger reads "Filters (2)" and no sort control renders

### Requirement: Filtered inventory results
When at least one inventory filter is applied and the read returns no item, the list SHALL show "No results match these filters." and a "Clear all" button with the behaviour of the panel's "Clear all", instead of its empty message. In the success and empty states it SHALL announce the number of returned items politely, "Results: {count}", as a visually hidden status.

#### Scenario: Filtered empty
- **WHEN** a filter is applied and no inventory item matches
- **THEN** "No results match these filters." and a "Clear all" button render, and the unfiltered empty message does not

#### Scenario: Result count announced
- **WHEN** the read returns 2 items
- **THEN** a polite status reads "Results: 2"
