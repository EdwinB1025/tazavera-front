# Spec Delta

## ADDED Requirements

### Requirement: Coffee shop facets in the sidebar
On the coffee shop directory the sidebar SHALL hold the filter panel titled "Filters" with, in this order: Name (search text), Postal code (text, with the help "E.g. 08012"), City (text) and Verified offerings (a radio list with "Any" first and "With verified offerings"). Each facet SHALL show the value the address carries.

#### Scenario: Facets in order
- **WHEN** the directory renders its sidebar
- **THEN** the panel shows Name, Postal code, City and Verified offerings in that order, with the panel's applied chips and "Clear all"

#### Scenario: Values from the address
- **WHEN** the address carries `name=nomad&verified=1`
- **THEN** the Name facet shows "nomad" and "With verified offerings" is selected

#### Scenario: Small viewport
- **WHEN** the visitor opens the filters on a small viewport
- **THEN** the panel covers the screen, as every sidebar does there

### Requirement: Coffee shop filter state in the URL
Committing a coffee shop facet SHALL navigate to the directory with that facet's key replaced — `name` up to 150, `city` up to 90 and `postalCode` up to 12 characters, trimmed, an empty value removing the key; `verified=1` or no key — keeping every other key except the page, which is dropped. Values the address carries beyond those limits SHALL be dropped before the request.

#### Scenario: Commit a text facet
- **WHEN** the visitor types "08012" in Postal code and presses Enter
- **THEN** the address carries `postalCode=08012`, keeps the other filters, the sort and the view, and has no page key

#### Scenario: Clear a facet
- **WHEN** the visitor empties the Name facet and leaves it
- **THEN** the address has no `name` key

#### Scenario: Out-of-range value in the address
- **WHEN** the address carries a `postalCode` longer than 12 characters or a `verified` value other than `1`
- **THEN** that key is not sent to the API and its facet shows no value

### Requirement: Applied coffee shop filters
The panel SHALL show one removable chip per applied coffee shop filter, in facet order — Name, Postal code, City and "With verified offerings" — and "Clear all", which SHALL remove every facet key and the page, keeping the sort and the view. The Filters trigger SHALL count the same chips. The sort SHALL never be a chip.

#### Scenario: Remove one chip
- **WHEN** the visitor removes the Postal code chip
- **THEN** the address drops `postalCode` and the page, keeping the other filters, the sort and the view

#### Scenario: Clear all
- **WHEN** the visitor activates "Clear all" with three filters, a Z–A sort and the map view applied
- **THEN** the address keeps only the sort and the view

### Requirement: Coffee shop sort
The directory toolbar SHALL offer a "Sort by" select with "Name (A–Z)", the default, and "Name (Z–A)". Choosing an option SHALL write the matching name order to the address, removing it for the default, and drop the page.

#### Scenario: Default order
- **WHEN** the address carries no order keys
- **THEN** the select shows "Name (A–Z)" and the request carries no order keys

#### Scenario: Reverse order
- **WHEN** the visitor chooses "Name (Z–A)"
- **THEN** the address carries the name order descending and the coffee shops render in the API's descending order

#### Scenario: Unknown order in the address
- **WHEN** the address carries an order value the directory does not offer
- **THEN** the order keys are not sent and the select shows "Name (A–Z)"

### Requirement: Coffee shop filter toolbar
The directory's body toolbar SHALL show the Filters trigger — "Filters" or "Filters ({count})" with the applied chips' count — at the start, followed by the view control, and the sort select at the end. The trigger SHALL open the sidebar; it SHALL render on a small viewport and, from the medium breakpoint, only while the sidebar is collapsed.

#### Scenario: Trigger count
- **WHEN** two coffee shop filters are applied
- **THEN** the trigger reads "Filters (2)"

#### Scenario: Trigger opens the sidebar
- **WHEN** the visitor activates the trigger
- **THEN** the sidebar opens with the coffee shop facets

#### Scenario: Toolbar wraps on a small viewport
- **WHEN** the toolbar renders at 375px
- **THEN** the trigger and the view control share the first row, the sort takes the second at full width, and nothing scrolls horizontally

### Requirement: Filtered coffee shop results
When at least one coffee shop filter is applied and the API returns no coffee shop, the directory SHALL show the "no matches" message with "Clear all" instead of its empty message. In the success and empty states it SHALL announce the result count politely, as a visually hidden status that stays mounted across filter navigations.

#### Scenario: Filtered empty
- **WHEN** a filter is applied and no coffee shop matches
- **THEN** the "no matches" message and "Clear all" render, in the list view and in the map view

#### Scenario: Result count announced
- **WHEN** a filter changes and the new page loads with 12 coffee shops in total
- **THEN** the status announces "Results: 12"
