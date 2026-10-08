# Spec Delta

## Purpose

Facet controls and filtering behaviour: how visitors and specialists narrow and sort a list through facets kept in the URL query.

## ADDED Requirements

### Requirement: Evaluation facets in the sidebar

The list `/{locale}/manage/evaluations` SHALL show, in its sidebar below the management navigation entries, a facet panel titled "Filters" that holds these facets in this order, each writing the listed query key:

| # | Facet | Control | Query key |
|---|---|---|---|
| 1 | Status | single choice: Any, Open, Closed | `status` (`open`, `closed`) |
| 2 | Score | score range 0–100 | `scoreMin`, `scoreMax` |
| 3 | Process | single choice with "see more" | `process` |
| 4 | City | text field, at most 90 characters, help "Exact city name" | `city` |

The evaluation form routes (`/{locale}/manage/evaluations/new` and `/{locale}/manage/evaluations/{ulid}`) SHALL show no evaluation facets.

#### Scenario: A specialist sees the facets

- **WHEN** a signed-in specialist opens `/{locale}/manage/evaluations`
- **THEN** the sidebar shows the "Filters" panel with the four facets in the order of the table, below the management navigation entries

#### Scenario: Form routes have no facets

- **WHEN** the specialist opens `/{locale}/manage/evaluations/new` or `/{locale}/manage/evaluations/{ulid}`
- **THEN** no evaluation facet is shown and the sidebar keeps only its navigation entries

### Requirement: Evaluation facet options

The Status facet SHALL list "Any", Open and Closed. The Process facet SHALL list "Any" first and then the distinct non-empty `process` values returned by the coffee catalog, sorted alphabetically and without duplicates or empty values. Values SHALL be shown as the API returns them.

#### Scenario: Distinct sorted options

- **WHEN** the coffee catalog returns the processes `washed`, `natural`, `washed` and an empty value
- **THEN** the Process facet lists "Any", `natural`, `washed`, in that order

#### Scenario: Status options

- **WHEN** a specialist opens the Status facet
- **THEN** it lists "Any", Open and Closed, in that order

### Requirement: Evaluation facet options unavailable

When the coffee catalog cannot be loaded, the Process facet SHALL render disabled with the help text "Options unavailable". Every other facet, the sort and the list SHALL keep working.

#### Scenario: Coffee catalog fails

- **WHEN** the coffee catalog request fails
- **THEN** Process is disabled with "Options unavailable"
- **AND** Status, Score and City still apply their changes

### Requirement: Evaluation filter state in the URL

The URL query SHALL be the only state of the evaluation facets and sort, using the contract's key names. On load, each facet SHALL show the value of its key; an absent key SHALL show "Any", an empty field or the full 0–100 range. Each committed change SHALL navigate to the same path with the new query and without `page`, add one history entry, keep the focus on the control that changed and keep the scroll position. A value outside the contract limits (text longer than its limit, `status` other than `open` or `closed`, a score outside 0–100 or a minimum above the maximum, a sort pair that is not one of the sort options) SHALL be dropped before the list request, and its facet SHALL show its empty state. Pagination SHALL keep every other key.

#### Scenario: Facets reflect the URL

- **WHEN** a specialist opens `/{locale}/manage/evaluations?status=open&process=washed&scoreMin=80`
- **THEN** Status shows Open, Process shows `washed`, Score shows 80–100 and every other facet shows its empty state

#### Scenario: A change returns to page 1

- **WHEN** the specialist on `?process=washed&page=3` selects `natural` in Process
- **THEN** the URL becomes `?process=natural` without `page`, the focus stays on the Process option and the scroll position is kept

#### Scenario: Back restores the previous filters

- **WHEN** the specialist selects a process and then presses the browser's Back
- **THEN** the URL and the facets return to the state before that selection

#### Scenario: Out-of-range values dropped

- **WHEN** a specialist opens `?status=draft&scoreMin=120&scoreMax=80`
- **THEN** the list is requested without `status`, `scoreMin` and `scoreMax`, Score shows 0–100 and Status shows "Any"

#### Scenario: Full range removes the bounds

- **WHEN** the specialist sets the score range back to 0–100
- **THEN** neither `scoreMin` nor `scoreMax` is in the URL

#### Scenario: Pagination keeps the query

- **WHEN** the specialist on `?process=washed&orderBy=created_at&orderDirection=asc&page=2` activates Next
- **THEN** the URL keeps `process=washed` and the sort pair and the page becomes 3

### Requirement: Applied evaluation filters

The facet panel SHALL show one removable chip per applied value, labelled with the value ("Open" or "Closed" for `status`, "{min}–{max}" for the score range, the value itself for `process` and `city`), each named "Remove filter: {facet}: {value}", followed by "Clear all". Removing a chip SHALL drop only that value; the score chip SHALL drop both bounds. "Clear all" SHALL remove every filter key and keep the sort keys. The "Any" choice SHALL never count as an applied value.

#### Scenario: Remove one chip

- **WHEN** `status=open` and `process=washed` are applied and the specialist removes the `washed` chip
- **THEN** the URL keeps `status=open` and drops `process`

#### Scenario: Clear all keeps the sort

- **WHEN** filters and `orderBy=cupping_score&orderDirection=desc` are applied and the specialist activates "Clear all"
- **THEN** the URL keeps only `orderBy=cupping_score&orderDirection=desc`

#### Scenario: No chips without filters

- **WHEN** no filter key is applied
- **THEN** neither chips nor "Clear all" are shown

### Requirement: Evaluation sort

The page body SHALL show a "Sort by" select with the options Default order (no sort keys), Highest score (`cupping_score`, `desc`), Lowest score (`cupping_score`, `asc`), Newest (`created_at`, `desc`) and Oldest (`created_at`, `asc`). Choosing an option SHALL write both keys, or remove both for Default order, under the URL rules of "Evaluation filter state in the URL". With no sort keys in the URL the list SHALL arrive in its default order, `created_at` descending.

#### Scenario: Choosing a sort

- **WHEN** the specialist chooses Highest score
- **THEN** the URL carries `orderBy=cupping_score&orderDirection=desc`

#### Scenario: Default order removes the keys

- **WHEN** the specialist chooses Default order
- **THEN** neither `orderBy` nor `orderDirection` is in the URL and the newest evaluations arrive first

### Requirement: Evaluations filter toolbar

The page body SHALL show, at the top of the list section above the results, a toolbar with a "Filters" trigger at the start and the sort select at the end. The trigger SHALL read "Filters" without applied values and "Filters ({count})" with them, expose whether the sidebar is expanded and which region it controls, and open the sidebar. Below the medium breakpoint the trigger SHALL always be shown and open the full-screen filter overlay, where every facet change applies while it stays open. From the medium breakpoint the trigger SHALL be shown only while the sidebar is collapsed.

#### Scenario: Count in the trigger

- **WHEN** two filter values are applied
- **THEN** the trigger reads "Filters (2)"

#### Scenario: Collapsed sidebar on a wide screen

- **WHEN** the sidebar is collapsed from the medium breakpoint and the specialist activates "Filters"
- **THEN** the sidebar expands with the facets and the trigger is no longer shown

#### Scenario: Mobile overlay

- **WHEN** a specialist below the medium breakpoint activates "Filters"
- **THEN** the full-screen overlay opens with the facets, and a facet change updates the list behind it while the overlay stays open

### Requirement: Filtered evaluation results

While the evaluations load or fail, the facets SHALL keep their values. When the list is empty and at least one filter value is applied, the list SHALL show "No results match these filters." and a "Clear all" button with the behaviour of the panel's "Clear all", instead of its unfiltered empty message. After each committed change, the list SHALL announce the result total in a polite status message "Results: {count}".

#### Scenario: Loading keeps the facets

- **WHEN** the list reloads after a facet change
- **THEN** the loading state is shown in the list's place and every facet keeps its value

#### Scenario: Empty with filters

- **WHEN** the applied filters return no evaluations
- **THEN** the results area shows "No results match these filters." and a "Clear all" button

#### Scenario: Empty without filters

- **WHEN** no filter is applied and the list is empty
- **THEN** the results area shows the unfiltered empty message

#### Scenario: Result count announced

- **WHEN** a facet change returns 12 evaluations in total
- **THEN** a polite status message reads "Results: 12"

#### Scenario: List error keeps the facets

- **WHEN** the list request fails after a facet change
- **THEN** the list shows its failure state with a retry action and every facet keeps its value
