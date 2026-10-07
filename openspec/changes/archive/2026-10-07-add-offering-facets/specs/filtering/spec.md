# Spec Delta

## Purpose

Facet controls and filtering behaviour: how visitors and specialists narrow and sort a list through facets kept in the URL query.

## ADDED Requirements

### Requirement: Offering facets in the sidebar

The public offerings list (`/{locale}/offerings`, any query) SHALL show, in its sidebar, for every session state, a facet panel titled "Filters" that holds these facets in this order, each writing the listed query key:

| # | Facet | Control | Query key |
|---|---|---|---|
| 1 | Coffee | search field, at most 150 characters | `coffeeName` |
| 2 | Verification | single choice: Any, Verified, Provisional | `verified` (`1` Verified, `0` Provisional) |
| 3 | Average score | score range 0–100 | `cuppingAvgMin`, `cuppingAvgMax` |
| 4 | Taste notes | taxonomy cascade, levels 0 and 1 | `cataRef` (repeated, one value per selected note) |
| 5 | Origin country | single choice with "see more" | `originCountry` |
| 6 | Origin region | single choice with "see more" | `originRegion` |
| 7 | Process | single choice with "see more" | `process` |
| 8 | Variety | single choice with "see more" | `variety` |
| 9 | Producer | combobox over the loaded options | `producer` |
| 10 | Roastery | combobox that searches while typing | `roasteryName` |
| 11 | City | text field, at most 90 characters, help "Exact city name" | `city` |

The offering detail route and every other public route SHALL show no offering facets.

#### Scenario: Anonymous visitor sees the facets
- **WHEN** an anonymous visitor opens `/{locale}/offerings`
- **THEN** the sidebar shows the "Filters" panel with the eleven facets in the order of the table

#### Scenario: Detail route has no facets
- **WHEN** a visitor opens `/{locale}/offerings/{ulid}`
- **THEN** no offering facet is shown

### Requirement: Offering facet options

Single-choice facets and the Producer combobox SHALL list the distinct non-empty values of the matching coffee field returned by the coffee catalog (`country`, `region`, `process`, `variety`, `producer`), sorted alphabetically, without duplicates or empty values; each single-choice facet SHALL list "Any" first. Origin region SHALL list every region, independent of the selected country. Taste notes SHALL list the level-0 taxonomy nodes with their level-1 children, named in the active locale. Roastery SHALL show the roasteries whose name matches the typed text, as returned by the API. Values SHALL be shown as the API returns them.

#### Scenario: Distinct sorted options
- **WHEN** the coffee catalog returns the processes `washed`, `natural`, `washed` and an empty value
- **THEN** the Process facet lists "Any", `natural`, `washed`, in that order

#### Scenario: Roastery search
- **WHEN** the visitor types "nóm" in the Roastery combobox
- **THEN** the combobox lists the roasteries the API returns for that name, each with its description

### Requirement: Offering facet options unavailable

When the coffee catalog cannot be loaded, the Origin country, Origin region, Process, Variety and Producer facets SHALL render disabled with the help text "Options unavailable". When the taxonomy cannot be loaded, the Taste notes facet SHALL render disabled with the same help text. Every other facet, the sort and the list SHALL keep working.

#### Scenario: Coffee catalog fails
- **WHEN** the coffee catalog request fails
- **THEN** the five coffee-based facets are disabled with "Options unavailable"
- **AND** Coffee, Verification, Average score, Taste notes, Roastery and City still apply their changes

#### Scenario: Taxonomy fails
- **WHEN** the taxonomy request fails
- **THEN** Taste notes is disabled with "Options unavailable" and the other facets keep working

### Requirement: Offering filter state in the URL

The URL query SHALL be the only state of the offering facets and sort, using the contract's key names. On load, each facet SHALL show the value of its key; an absent key SHALL show "Any", an empty field or the full 0–100 range. Each committed change SHALL navigate to the same path with the new query and without `page`, add one history entry, keep the focus on the control that changed and keep the scroll position. A value outside the contract limits (text longer than its limit, `verified` other than `0` or `1`, a score outside 0–100 or a minimum above the maximum, a sort pair that is not one of the sort options) SHALL be dropped before the list request, and its facet SHALL show its empty state. A `cataRef` value that is not a listed taste note SHALL be shown neither as checked nor as a chip; it is still sent, and a rejection by the API shows the catalog's error state. Pagination SHALL keep every other key.

#### Scenario: Facets reflect the URL
- **WHEN** a visitor opens `/{locale}/offerings?verified=1&process=washed&cuppingAvgMin=80`
- **THEN** Verification shows Verified, Process shows `washed`, Average score shows 80–100 and every other facet shows its empty state

#### Scenario: A change returns to page 1
- **WHEN** the visitor on `?process=washed&page=3` selects `natural` in Process
- **THEN** the URL becomes `?process=natural` without `page`, the focus stays on the Process option and the scroll position is kept

#### Scenario: Back restores the previous filters
- **WHEN** the visitor selects a process and then presses the browser's Back
- **THEN** the URL and the facets return to the state before that selection

#### Scenario: Out-of-range values dropped
- **WHEN** a visitor opens `?cuppingAvgMin=120&verified=yes`
- **THEN** the list is requested without `cuppingAvgMin` and `verified`, Average score shows 0–100 and Verification shows "Any"

#### Scenario: Full range removes the bounds
- **WHEN** the visitor sets the score range back to 0–100
- **THEN** neither `cuppingAvgMin` nor `cuppingAvgMax` is in the URL

### Requirement: Applied offering filters

The facet panel SHALL show one removable chip per applied value, labelled with the value (the taste note's name for `cataRef`, Verified or Provisional for `verified`, "{min}–{max}" for the score range), each named "Remove filter: {facet}: {value}", followed by "Clear all". Removing a chip SHALL drop only that value. "Clear all" SHALL remove every filter key and keep the sort keys. The "Any" choice SHALL never count as an applied value.

#### Scenario: Remove one chip
- **WHEN** `process=washed` and `originCountry=Colombia` are applied and the visitor removes the `washed` chip
- **THEN** the URL keeps `originCountry=Colombia` and drops `process`

#### Scenario: Clear all keeps the sort
- **WHEN** filters and `orderBy=cupping_avg&orderDirection=desc` are applied and the visitor activates "Clear all"
- **THEN** the URL keeps only `orderBy=cupping_avg&orderDirection=desc`

#### Scenario: No chips without filters
- **WHEN** no filter key is applied
- **THEN** neither chips nor "Clear all" are shown

### Requirement: Offering sort

The page body SHALL show a "Sort by" select with the options Default order (no sort keys), Highest score (`cupping_avg`, `desc`), Lowest score (`cupping_avg`, `asc`), Most evaluated (`evaluation_count`, `desc`), Newest (`created_at`, `desc`) and Oldest (`created_at`, `asc`). Choosing an option SHALL write both keys, or remove both for Default order, under the URL rules of "Offering filter state in the URL".

#### Scenario: Top rated entry
- **WHEN** a visitor follows the "Top rated" header entry
- **THEN** Verification shows Verified and the sort select shows Highest score

#### Scenario: Default order removes the keys
- **WHEN** the visitor chooses Default order
- **THEN** neither `orderBy` nor `orderDirection` is in the URL

### Requirement: Offerings filter toolbar

The page body SHALL show, above the results, a toolbar with a "Filters" trigger at the start and the sort select at the end. The trigger SHALL read "Filters" without applied values and "Filters ({count})" with them, expose whether the sidebar is expanded and which region it controls, and open the sidebar. Below the medium breakpoint the trigger SHALL always be shown and open the full-screen filter overlay, where every facet change applies while it stays open. From the medium breakpoint the trigger SHALL be shown only while the sidebar is collapsed.

#### Scenario: Count in the trigger
- **WHEN** two filter values are applied
- **THEN** the trigger reads "Filters (2)"

#### Scenario: Collapsed sidebar on a wide screen
- **WHEN** the sidebar is collapsed from the medium breakpoint and the visitor activates "Filters"
- **THEN** the sidebar expands with the facets and the trigger is no longer shown

#### Scenario: Mobile overlay
- **WHEN** a visitor below the medium breakpoint activates "Filters"
- **THEN** the full-screen overlay opens with the facets, and a facet change updates the list behind it while the overlay stays open

### Requirement: Filtered offerings results

While the offering list loads or fails, the facets SHALL keep their values. When the list is empty and at least one filter value is applied, the catalog SHALL show "No results match these filters." and a "Clear all" button with the behaviour of the panel's "Clear all", instead of its unfiltered empty message. After each committed change, the catalog SHALL announce the result total in a polite status message "Results: {count}".

#### Scenario: Empty with filters
- **WHEN** the applied filters return no offerings
- **THEN** the results area shows "No results match these filters." and a "Clear all" button

#### Scenario: Empty without filters
- **WHEN** no filter is applied and the list is empty
- **THEN** the results area shows the catalog's unfiltered empty message

#### Scenario: Result count announced
- **WHEN** a facet change returns 12 offerings in total
- **THEN** a polite status message reads "Results: 12"

#### Scenario: List error keeps the facets
- **WHEN** the list request fails after a facet change
- **THEN** the catalog shows its error state and every facet keeps its value
