# filtering Specification

## Purpose
Lets visitors and signed-in users narrow and order a list through facet controls placed beside it, with every applied value visible and removable.

## Requirements

### Requirement: Facet panel
A facet panel SHALL be a search region named by its visible title. It SHALL show, below the title, one chip per applied facet value it is given followed by a "Clear all" action, and below them the facets in the order it is given. The chips block SHALL render only while at least one value is applied. Pressing Enter inside the panel SHALL never submit or reload the page. Every facet in the panel SHALL render in the inverse variant on the sidebar surface.

#### Scenario: Panel named by its title
- **WHEN** the facet panel renders
- **THEN** assistive technology exposes it as a search region whose name is the visible panel title

#### Scenario: No applied values
- **WHEN** the panel is given no applied value
- **THEN** no chip and no "Clear all" action render

#### Scenario: Enter does not submit
- **WHEN** the user presses Enter in a text field of the panel
- **THEN** the page does not reload and only that field's own commit happens

### Requirement: Applied-filter chips
Each applied facet value SHALL be shown as a chip whose visible text is the value and whose accessible name is "Remove filter: {facet}: {value}". Activating a chip SHALL remove only that value. "Clear all" SHALL remove every applied value at once. After a chip removes its value, keyboard focus SHALL move to the chip that took its place, else to the previous chip, else to the panel title; after "Clear all", focus SHALL move to the panel title. A chip SHALL carry the shared chip geometry with its own treatments on top: pill corners, a minimum height of 1.75rem, a 1px inverse boundary, no fill, the sidebar text colour, an underline on hover and the shared focus ring.

#### Scenario: Chip name
- **WHEN** the value "Washed" of the facet "Process" is applied
- **THEN** a chip with the visible text "Washed" renders, named "Remove filter: Process: Washed" for assistive technology

#### Scenario: Removing one value
- **WHEN** the user activates one of several chips
- **THEN** only that value is reported as removed and the other applied values stay

#### Scenario: Clear all
- **WHEN** the user activates "Clear all"
- **THEN** every applied value is reported as removed in one action, and once the chips are gone focus is on the panel title

#### Scenario: Focus after removal
- **WHEN** a chip's value has been removed and the chips render again
- **THEN** focus is on the chip now at the removed chip's position, or on the last chip when the removed one was last, or on the panel title when no chip remains

#### Scenario: Chip matches the badge geometry
- **WHEN** an applied-filter chip renders in either theme
- **THEN** it renders from the shared chip geometry, and its pill corners, minimum height, padding and icon gap are its own treatments on top of that geometry, never a second definition

### Requirement: Facet rows
Options of a radio-list facet SHALL render as facet rows: the whole row is the click target, at least 2.5rem high, with the control and its label side by side. A row whose option is an applied value SHALL show the selected look: the selected fill, a 4px left indicator, the label underlined and the selected shadow, with the control checked; it SHALL take no hover change. A row that is not applied SHALL show, on hover, a soft inner shadow and a bold label without changing its fill or label colour. The indicator, underline and shadows SHALL be decorative: the checked control carries the state. The help text under a radio-list or cascade facet SHALL start 0.75rem in from the panel's content edge on both sides, aligned with the facet's legend. In the traditional theme the selected shadow SHALL equal a medium drop shadow and the hover shadow a small inner shadow; in the dark theme both SHALL be none.

#### Scenario: Applied value row
- **WHEN** a row's option is applied
- **THEN** the row shows the selected fill, the left indicator, the underlined label and the selected shadow, and its control is checked

#### Scenario: Hover on a row that is not applied
- **WHEN** the pointer hovers a row that is not applied
- **THEN** the row shows the hover shadow and a bold label, and its fill and label colour do not change

#### Scenario: Label does not shift
- **WHEN** a row changes between rest, hover and the selected look
- **THEN** its label does not move horizontally

#### Scenario: Contrast on every row background
- **WHEN** a row renders at rest, on hover or with the selected look in either theme
- **THEN** its label reaches at least 4.5:1 and its control boundary and focus ring at least 3:1 against the row background

#### Scenario: Help aligned with the legend
- **WHEN** a radio-list or cascade facet shows a help text
- **THEN** the help text has 0.75rem of side padding, so it starts at the same horizontal position as the facet's legend

### Requirement: Text facet
A text facet SHALL be a labelled inverse text input, either a search field or a plain text field, limited to the maximum length it is given and optionally carrying a help text. It SHALL report its value when the user presses Enter or leaves the field with a changed value, trimmed; an empty value SHALL be reported as removing the facet. It SHALL show the value it is given.

#### Scenario: Commit on Enter
- **WHEN** the user types "Huila" and presses Enter
- **THEN** the facet reports "Huila" once

#### Scenario: Commit on leaving the field
- **WHEN** the user changes the value and moves focus out of the field
- **THEN** the facet reports the new value once

#### Scenario: No change, no report
- **WHEN** the user leaves the field without changing its value
- **THEN** nothing is reported

#### Scenario: Emptied field
- **WHEN** the user empties the field and presses Enter
- **THEN** the facet reports the removal of its value

#### Scenario: Length limit
- **WHEN** the facet is limited to 90 characters
- **THEN** the field accepts no more than 90 characters

### Requirement: Radio-list facet
A radio-list facet SHALL be a group named by its legend whose first option is "Any", followed by the options it is given in the given order, as facet rows. "Any" SHALL be checked while no value is applied and SHALL never take the selected look. Choosing an option SHALL report it at once; choosing "Any" SHALL report the removal of the value. Arrow keys SHALL move the choice, each move reporting it. When more than five options follow "Any", only the first five and any applied option SHALL be visible, followed by a "See more ({count})" action that shows the hidden options and becomes "See less"; the action SHALL expose whether the options are shown and which group it controls.

#### Scenario: Nothing applied
- **WHEN** the facet is given no value
- **THEN** "Any" is checked and no row shows the selected look

#### Scenario: Choosing an option
- **WHEN** the user chooses "Washed"
- **THEN** the facet reports "Washed" and, once given that value, its row shows the selected look

#### Scenario: Choosing Any
- **WHEN** the user chooses "Any" while "Washed" is applied
- **THEN** the facet reports the removal of its value

#### Scenario: See more
- **WHEN** the facet has eight options and none is applied
- **THEN** five options are visible and "See more (3)" is shown, collapsed; activating it shows all eight and turns into "See less", expanded

#### Scenario: Applied option beyond the threshold
- **WHEN** the seventh option is applied and the list is collapsed
- **THEN** the first five options and the seventh are visible, and the action reads "See more (2)"

### Requirement: Score range facet
A score range facet SHALL be a group named by its legend holding a two-thumb slider and two number inputs, "From" and "To", kept in sync with the thumbs both ways, over the bounds it is given in steps of 1. Each thumb SHALL have its own accessible name and announce its value. The slider SHALL report the range when a thumb is released or moved one keyboard step. An input SHALL report the range when the user presses Enter in it or leaves it with a changed value; a typed value SHALL be clamped to the bounds and to the other end of the range, with no error message, and an empty input SHALL take its bound. The minimum SHALL never exceed the maximum.

#### Scenario: Keyboard step
- **WHEN** the minimum thumb has focus at 0 and the user presses the right arrow key
- **THEN** the facet reports the range 1–100 and the "From" input shows 1

#### Scenario: Typed value applied on Enter
- **WHEN** the user types 60 in "From" and presses Enter
- **THEN** the minimum thumb moves to 60 and the facet reports 60–100 once

#### Scenario: Value out of bounds
- **WHEN** the user types 140 in "To" and leaves the input
- **THEN** the input shows 100 and no error message renders

#### Scenario: Minimum above maximum
- **WHEN** the range is 20–50 and the user types 80 in "From" and presses Enter
- **THEN** the input shows 50 and the facet reports 50–50

#### Scenario: Thumb names
- **WHEN** the facet renders with the names "Minimum score" and "Maximum score"
- **THEN** the thumbs are exposed with those names and their current values

### Requirement: Combobox
A combobox SHALL be a labelled editable input exposed as a combobox with a listbox popup, rendering in the input's default variant on light surfaces or its inverse variant on dark surfaces. Typing SHALL open the popup; the up and down arrow keys SHALL move the active option, Enter SHALL choose it, and Escape SHALL close the popup; keyboard focus SHALL stay in the input while the popup is open. The input SHALL expose whether the popup is open, the listbox it controls and the active option. Choosing an option SHALL report it, put its label in the input and close the popup; the chosen option SHALL show a check mark. Emptying the input and pressing Enter or leaving it SHALL report the removal of the value. Typed text that is abandoned, by pressing Escape or by leaving the input without choosing an option, SHALL be replaced without reporting anything: the input SHALL show the chosen value's label again, or become empty when no value is chosen, and the popup SHALL close without reopening. Escape SHALL do so whether or not the popup is open, also on an emptied input, which keeps the value. Each option SHALL show its label on a first line, with the part matching the typed text in bold, and an optional detail on a second line. With options given up front, typing SHALL keep only the options whose label contains the typed text, ignoring case. With a search, the combobox SHALL search for typed text after at least 2 characters and 300 ms without typing, cancel an older search when a newer one starts, and replace the options with the results. A label the combobox puts in the input itself, for its value on first render, after a choice, after a restore or when the value changes, SHALL run no search. The state rows "Searching…", "No matches" and "Results could not be loaded" SHALL not be selectable and SHALL be announced politely. A disabled combobox SHALL reject input and show its help text.

#### Scenario: Popup state exposed
- **WHEN** the user types in a closed combobox and the popup opens
- **THEN** the input is exposed as expanded, and as collapsed again once the popup closes

#### Scenario: Keyboard choice
- **WHEN** the popup shows three options and the user presses the down arrow key twice and Enter
- **THEN** the second option is reported, its label fills the input and the popup closes

#### Scenario: Local filtering
- **WHEN** options are given up front and the user types "fin"
- **THEN** only the options whose label contains "fin" in any case remain, with "fin" in bold

#### Scenario: No match
- **WHEN** no option matches the typed text
- **THEN** the popup shows the row "No matches", which cannot be chosen

#### Scenario: Searching while typing
- **WHEN** a search is given and the user types "ca", then "f" within 300 ms
- **THEN** one search runs for "caf" after 300 ms without typing, and "Searching…" shows while it runs

#### Scenario: Too few characters
- **WHEN** a search is given and the input holds one character
- **THEN** no search runs

#### Scenario: Older search cancelled
- **WHEN** a search is still running and a newer search starts
- **THEN** the older search is cancelled and only the newer results are shown

#### Scenario: Search failure
- **WHEN** the search fails
- **THEN** the popup shows the row "Results could not be loaded" and the status is announced

#### Scenario: Clearing the value
- **WHEN** a value is chosen and the user empties the input and leaves it
- **THEN** the combobox reports the removal of its value

#### Scenario: Default variant
- **WHEN** a combobox renders in the default variant on a light surface
- **THEN** its input looks as a default text input and its popup as on the sidebar

#### Scenario: Escape after typing over a chosen value
- **WHEN** a value "Finca A" is chosen and the user types "zz" and presses Escape
- **THEN** the input shows "Finca A", the popup is closed and nothing is reported

#### Scenario: Leaving after typing over a chosen value
- **WHEN** a value "Finca A" is chosen and the user types "zz" and leaves the input
- **THEN** the input shows "Finca A" and nothing is reported

#### Scenario: Abandoned text with no value
- **WHEN** no value is chosen and the user types "fin" and presses Escape or leaves the input
- **THEN** the input is empty, the popup is closed and nothing is reported

#### Scenario: Escape on an emptied input
- **WHEN** a value "Finca A" is chosen and the user empties the input and presses Escape
- **THEN** the input shows "Finca A" and nothing is reported

#### Scenario: No search for the combobox's own label
- **WHEN** a search is given and the input shows a label the combobox put there itself, on first render with a value, after a choice or after a restore
- **THEN** no search runs until the user types

### Requirement: Sort control
A list SHALL be ordered with a select labelled "Sort by" in the page body, in the default variant, whose choice applies at once without a separate action. Its text SHALL reach at least 4.5:1 against the input surface in both themes.

#### Scenario: Choosing an order
- **WHEN** the user chooses another option in "Sort by"
- **THEN** the choice is reported at once

#### Scenario: Sort text contrast
- **WHEN** the sort control renders in either theme
- **THEN** its text reaches at least 4.5:1 against the input surface

### Requirement: Facet option data unavailable
A facet whose options could not be loaded SHALL render disabled with a help text, while the other facets keep working.

#### Scenario: Disabled facet
- **WHEN** a facet is rendered disabled with the help text "Options unavailable"
- **THEN** it rejects input, renders at 50% opacity and shows "Options unavailable", and the other facets stay enabled

### Requirement: Offering facets in the sidebar

The public offerings list (`/{locale}/offerings`, any query) SHALL show, in its sidebar, for every session state, a facet panel titled "Filters" that holds these facets in this order, each writing the listed query key:

| # | Facet | Control | Query key |
|---|---|---|---|
| 1 | Coffee | combobox that searches while typing, at most 150 characters | `coffeeName` |
| 2 | Verification | single choice: Any, Verified, Provisional | `verified` (`1` Verified, `0` Provisional) |
| 3 | Average score | score range 60–100 | `cuppingAvgMin`, `cuppingAvgMax` |
| 4 | Taste notes | taxonomy cascade, levels 0 and 1 | `cataRef` (repeated, one value per selected note) |
| 5 | Origin country | single choice with "see more" | `originCountry` |
| 6 | Origin region | single choice with "see more" | `originRegion` |
| 7 | Process | single choice with "see more" | `process` |
| 8 | Variety | single choice with "see more" | `variety` |
| 9 | Producer | combobox over the loaded options | `producer` |
| 10 | Roastery | combobox that searches while typing | `roasteryName` |
| 11 | City | text field, at most 90 characters, help "Exact city name" | `city` |

The Coffee and Roastery comboboxes SHALL behave alike: choosing an option SHALL write the option's name to the facet's key, and clearing the combobox SHALL remove the key.

The offering detail route and every other public route SHALL show no offering facets.

#### Scenario: Anonymous visitor sees the facets
- **WHEN** an anonymous visitor opens `/{locale}/offerings`
- **THEN** the sidebar shows the "Filters" panel with the eleven facets in the order of the table

#### Scenario: Choosing a coffee
- **WHEN** the visitor chooses "Huila El Mirador" in the Coffee combobox
- **THEN** the list navigates to the same path with `coffeeName=Huila El Mirador` and without `page`

#### Scenario: Score scale
- **WHEN** a visitor opens `/{locale}/offerings` with no score filter
- **THEN** the Average score facet shows 60–100, its thumbs and its From and To inputs run from 60 to 100, and neither `cuppingAvgMin` nor `cuppingAvgMax` is sent

#### Scenario: Detail route has no facets
- **WHEN** a visitor opens `/{locale}/offerings/{ulid}`
- **THEN** no offering facet is shown

### Requirement: Offering facet options

Single-choice facets and the Producer combobox SHALL list the distinct non-empty values of the matching coffee field returned by the coffee catalog (`country`, `region`, `process`, `variety`, `producer`), sorted alphabetically, without duplicates or empty values; each single-choice facet SHALL list "Any" first. Origin region SHALL list every region, independent of the selected country. Taste notes SHALL list the level-0 taxonomy nodes with their level-1 children, named in the active locale. Roastery SHALL show the roasteries whose name matches the typed text, as returned by the API. Coffee SHALL show the coffees whose name matches the typed text, as returned by the API, one option per distinct name, each with a second line joining its `country`, `region`, `process` and `variety` with " · ", empty fields skipped and the line omitted when every one is empty. Values SHALL be shown as the API returns them.

#### Scenario: Distinct sorted options
- **WHEN** the coffee catalog returns the processes `washed`, `natural`, `washed` and an empty value
- **THEN** the Process facet lists "Any", `natural`, `washed`, in that order

#### Scenario: Roastery search
- **WHEN** the visitor types "nóm" in the Roastery combobox
- **THEN** the combobox lists the roasteries the API returns for that name, each with its description

#### Scenario: Coffee search
- **WHEN** the visitor types "hui" in the Coffee combobox
- **THEN** the combobox lists the coffees the API returns for that name, each with its non-empty country, region, process and variety joined by " · "

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

The URL query SHALL be the only state of the offering facets and sort, using the contract's key names. On load, each facet SHALL show the value of its key; an absent key SHALL show "Any", an empty field or the full 60–100 range. Each committed change SHALL navigate to the same path with the new query and without `page`, add one history entry, keep the focus on the control that changed and keep the scroll position. A value outside the facet limits (text longer than its limit, `verified` other than `0` or `1`, a score outside 60–100 or a minimum above the maximum, a sort pair that is not one of the sort options) SHALL be dropped before the list request, and its facet SHALL show its empty state. A `cataRef` value that is not a listed taste note SHALL be shown neither as checked nor as a chip; it is still sent, and a rejection by the API shows the catalog's error state. The list request SHALL send each chosen taste note as a `cataRef[]` pair, one per note in the URL's order, while the URL keeps the plain `cataRef` key. Pagination SHALL keep every other key.

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
- **WHEN** a visitor opens `?cuppingAvgMin=50&verified=yes`
- **THEN** the list is requested without `cuppingAvgMin` and `verified`, Average score shows 60–100 and Verification shows "Any"

#### Scenario: Full range removes the bounds
- **WHEN** the visitor sets the score range back to 60–100
- **THEN** neither `cuppingAvgMin` nor `cuppingAvgMax` is in the URL

#### Scenario: Taste notes sent as an array
- **WHEN** the visitor has chosen taste notes A and B, so the URL carries `?cataRef=A&cataRef=B`
- **THEN** the offerings request carries `cataRef[]=A&cataRef[]=B` (brackets percent-encoded) and the URL keeps `cataRef=A&cataRef=B`

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

The page body SHALL show, above the results, a toolbar with a "Filters" trigger at the start and the sort select at the end. The trigger SHALL read "Filters" without applied values and "Filters ({count})" with them, expose whether the sidebar and its filters sub-section are expanded and which region it controls, and open the sidebar with the filters sub-section open. Below the medium breakpoint the trigger SHALL always be shown and open the full-screen filter overlay with the filters sub-section open, where every facet change applies while it stays open. From the medium breakpoint the trigger SHALL be shown only while the sidebar is collapsed or its filters sub-section is closed.

#### Scenario: Count in the trigger
- **WHEN** two filter values are applied
- **THEN** the trigger reads "Filters (2)"

#### Scenario: Collapsed sidebar on a wide screen
- **WHEN** the sidebar is collapsed from the medium breakpoint and the visitor activates "Filters"
- **THEN** the sidebar expands with the filters sub-section open and the trigger is no longer shown

#### Scenario: Mobile overlay
- **WHEN** a visitor below the medium breakpoint activates "Filters"
- **THEN** the full-screen overlay opens with the filters sub-section open, and a facet change updates the list behind it while the overlay stays open

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

### Requirement: Clear all action for an empty filtered list

A filtered list that is empty while at least one filter value is applied MAY show a "Clear all" button below its empty message, with the text the list provides. Activating it SHALL remove every query parameter of the list's address except the ones the list keeps, SHALL always remove the page, and SHALL open the result without a full page reload and without moving the scroll position. The button SHALL add no text of its own and SHALL NOT be shown while no filter value is applied.

#### Scenario: Keeps the list's kept parameters
- **WHEN** the list keeps the sort parameters, the address is `?process=washed&orderBy=cupping_avg&orderDirection=desc&page=2` and the visitor activates "Clear all"
- **THEN** the address becomes `?orderBy=cupping_avg&orderDirection=desc` and the scroll position does not move

#### Scenario: No parameter kept
- **WHEN** the list keeps no parameter, the address carries `?status=open` and the visitor activates "Clear all"
- **THEN** the address becomes the bare path, with no query

#### Scenario: Text from the list
- **WHEN** the list provides the text "Clear all"
- **THEN** the button's accessible name and visible text are exactly "Clear all"

#### Scenario: No filter applied
- **WHEN** the list is empty and no filter value is applied
- **THEN** no "Clear all" button is shown below the empty message

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

The page body SHALL show, at the top of the list section above the results, a toolbar with a "Filters" trigger at the start and the sort select at the end. The trigger SHALL read "Filters" without applied values and "Filters ({count})" with them, expose whether the sidebar and its filters sub-section are expanded and which region it controls, and open the sidebar with the filters sub-section open. Below the medium breakpoint the trigger SHALL always be shown and open the full-screen filter overlay with the filters sub-section open, where every facet change applies while it stays open. From the medium breakpoint the trigger SHALL be shown only while the sidebar is collapsed or its filters sub-section is closed.

#### Scenario: Count in the trigger

- **WHEN** two filter values are applied
- **THEN** the trigger reads "Filters (2)"

#### Scenario: Collapsed sidebar on a wide screen

- **WHEN** the sidebar is collapsed from the medium breakpoint and the specialist activates "Filters"
- **THEN** the sidebar expands with the filters sub-section open and the trigger is no longer shown

#### Scenario: Mobile overlay

- **WHEN** a specialist below the medium breakpoint activates "Filters"
- **THEN** the full-screen overlay opens with the filters sub-section open, and a facet change updates the list behind it while the overlay stays open

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
The directory's body toolbar SHALL show the Filters trigger — "Filters" or "Filters ({count})" with the applied chips' count — at the start, followed by the view control, and the sort select at the end. The trigger SHALL open the sidebar with its filters sub-section open; it SHALL render on a small viewport and, from the medium breakpoint, only while the sidebar is collapsed or its filters sub-section is closed.

#### Scenario: Trigger count
- **WHEN** two coffee shop filters are applied
- **THEN** the trigger reads "Filters (2)"

#### Scenario: Trigger opens the sidebar
- **WHEN** the visitor activates the trigger
- **THEN** the sidebar opens with the filters sub-section open on the coffee shop facets

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

### Requirement: Taxonomy chip cascade facet
A cascade facet SHALL render its options as a descriptor chip group named by its legend, in the inverse variant. The top-level options SHALL be chips. While a top-level option is chosen, its second-level options SHALL render as a row titled with that option's label, directly after the line of chips that holds it. Unchosen chips SHALL show the taxonomy's data-colour dot before the label; chosen chips SHALL show the option's taxonomy badge with a check mark. The "See more" rule of the radio-list facet SHALL apply to the top-level chips, a chosen chip counting as applied. Choosing a top-level option SHALL show its second-level options unchosen; unchoosing it SHALL hide them and remove them from the chosen set, so no hidden second-level option stays chosen. There SHALL be no separate control to show or hide the second-level options. Each change SHALL report the set of chosen options in option order, a top-level option before its second-level options.

#### Scenario: Children hidden while the parent is not chosen
- **WHEN** the facet renders with a top-level option that is not chosen
- **THEN** none of that option's second-level options render and no control to show them is offered

#### Scenario: Choosing a parent
- **WHEN** the user chooses a top-level option whose second-level options are hidden
- **THEN** the facet reports that option alone and, once given that value, its second-level options render unchosen in a row titled with its label

#### Scenario: Choosing a child
- **WHEN** the user chooses a second-level option of a chosen top-level option
- **THEN** the facet reports the top-level option and the second-level option, in option order

#### Scenario: Unchoosing a parent
- **WHEN** the user unchooses a top-level option while some of its second-level options are chosen
- **THEN** the facet reports neither that option nor any of its second-level options and, once given that value, its row of second-level options no longer renders

#### Scenario: Chosen parent at load
- **WHEN** the facet renders with a chosen top-level option and one of its second-level options chosen
- **THEN** that option's row shows the chosen second-level option as chosen and its siblings unchosen, and no other top-level option's second-level options render

#### Scenario: Chip look
- **WHEN** the facet renders a chosen and an unchosen option
- **THEN** the unchosen chip shows the taxonomy's data-colour dot before its label, and the chosen chip shows the option's taxonomy badge with a check mark before its label

#### Scenario: Chips on the sidebar
- **WHEN** the facet renders in either theme
- **THEN** every chip boundary reaches at least 3:1, and every label and check mark at least 4.5:1, against the sidebar surface

### Requirement: Sidebar facets sub-section
On every list whose facets live in the sidebar (the offerings list, the coffee shop directory, a coffee shop's Offerings tab, the public evaluations list and the specialist's evaluations list), the facet panel SHALL sit in the sidebar sub-section (app-shell "Sidebar entry sub-section") of the list's entry: "Explore offerings" on the offerings list, "Explore coffee shops" on the coffee shop directory and "My evaluations" on the specialist's evaluations list; on a list with no entry in the sidebar, the sub-section SHALL stand alone. The sub-section's toggle SHALL carry the facet panel's title ("Filters") as its accessible name and SHALL be closed on arrival. Inside the sub-section the toggle SHALL be the panel's only visible title: the panel SHALL show no heading of its own, its search region SHALL take its name from the toggle, and the focus that "Applied-filter chips" sends to the panel title SHALL land on the toggle. The list toolbar's "Filters" trigger SHALL open it, together with the sidebar. Collapsing it SHALL neither change nor clear the applied filters: the URL, the results, the chips and the trigger's count stay as they are.

#### Scenario: Facets closed by default
- **WHEN** a visitor arrives on a list whose facets live in the sidebar
- **THEN** the sidebar shows the list's entry with a "Filters" toggle below it reporting collapsed, and the facet panel is not shown

#### Scenario: Facets open on their toggle
- **WHEN** the visitor activates the "Filters" toggle in the sidebar
- **THEN** the toggle reports expanded and the facet panel is shown below it

#### Scenario: Facets open from the toolbar
- **WHEN** the visitor activates the toolbar's "Filters" trigger while the sub-section is closed, on any viewport
- **THEN** the sidebar is open, the sub-section's toggle reports expanded and the facet panel is shown

#### Scenario: Filters keep applying while collapsed
- **WHEN** filter values are applied and the sub-section is collapsed
- **THEN** the URL keeps the values, the facets keep showing them on the next opening and the trigger keeps their count

#### Scenario: Title shown once in the sidebar
- **WHEN** a visitor opens the facets in the sidebar
- **THEN** "Filters" shows only as the sub-section's toggle, the panel shows no heading of its own, and the search region is still named "Filters"

### Requirement: Facet comboboxes loaded on first opening
On a list whose facets live in the sidebar sub-section ("Sidebar facets sub-section"), the client code of the facet comboboxes, and of the libraries only they use (the command-menu library and the popover behind it), SHALL load the first time the sub-section opens on that route, by its toggle or by the toolbar's "Filters" trigger, and not with the route. While that first load is pending, the place of each combobox in the panel SHALL show the loading status (feedback "Request status messages") with the text "Loading…" (es "Cargando…", ca "Carregant…"), and every other facet SHALL be shown in its place. Once loaded, the facets, their order and their behaviour SHALL be those of the list's facet requirements, on every viewport.

#### Scenario: First opening while the comboboxes load
- **WHEN** a visitor opens the facets sub-section of the offerings list for the first time and the combobox code has not finished loading
- **THEN** the combobox code starts loading only at that opening, and the places of Coffee, Producer and Roastery each show the loading status "Loading…" while the other facets are shown

#### Scenario: Facets after loading
- **WHEN** the combobox code has loaded after the first opening
- **THEN** the loading statuses are gone and the Coffee, Producer and Roastery comboboxes are shown in their places of the facet order
