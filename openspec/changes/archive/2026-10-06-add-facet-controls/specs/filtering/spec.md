# Spec Delta

## Purpose

Lets visitors and signed-in users narrow and order a list through facet controls placed beside it, with every applied value visible and removable.

## ADDED Requirements

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
Options of a radio-list facet and of a cascade facet SHALL render as facet rows: the whole row is the click target, at least 2.5rem high, with the control and its label side by side. A row whose option is an applied value SHALL show the selected look: the selected fill, a 4px left indicator, the label underlined and the selected shadow, with the control checked; it SHALL take no hover change. A row that is not applied SHALL show, on hover, a soft inner shadow and a bold label without changing its fill or label colour. The indicator, underline and shadows SHALL be decorative: the checked control carries the state. In the traditional theme the selected shadow SHALL equal a medium drop shadow and the hover shadow a small inner shadow; in the dark theme both SHALL be none.

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

### Requirement: Taxonomy cascade facet
A cascade facet SHALL be a group named by its legend whose top-level options are checkbox rows and whose second-level options render below their parent, indented. Each parent row SHALL have its own expand/collapse control, separate from its checkbox, that exposes whether its children are shown and which group it controls. Checkboxes SHALL be independent: checking or unchecking a parent SHALL not change its children, a child SHALL be checkable without its parent, and checking every child SHALL not check the parent. Children SHALL be hidden only when the user collapses their parent; a parent with a checked child SHALL start expanded and the others collapsed. Each change SHALL report the set of checked options in option order. The "See more" rule of the radio-list facet SHALL apply to the top-level options, a parent with a checked child counting as applied.

#### Scenario: Expanding a parent
- **WHEN** the user activates the expand control of a collapsed parent
- **THEN** its children render below it and the control is exposed as expanded

#### Scenario: Checking a parent
- **WHEN** the user checks a parent whose children are unchecked
- **THEN** the facet reports the parent alone and the children stay unchecked

#### Scenario: Checking a child without its parent
- **WHEN** the user checks a child while its parent is unchecked
- **THEN** the facet reports the child alone

#### Scenario: Every child checked
- **WHEN** the user checks the last unchecked child of a parent
- **THEN** the parent stays unchecked

#### Scenario: Initial expansion
- **WHEN** the facet renders with a checked child
- **THEN** that child's parent is expanded and every parent without a checked child is collapsed

#### Scenario: Unchecking keeps children visible
- **WHEN** the user unchecks an expanded parent
- **THEN** its children stay visible with their checks unchanged

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
A combobox SHALL be a labelled editable input exposed as a combobox with a listbox popup, rendering in the input's default variant on light surfaces or its inverse variant on dark surfaces. Typing SHALL open the popup; the up and down arrow keys SHALL move the active option, Enter SHALL choose it, and Escape SHALL close the popup; keyboard focus SHALL stay in the input while the popup is open. The input SHALL expose whether the popup is open, the listbox it controls and the active option. Choosing an option SHALL report it, put its label in the input and close the popup; the chosen option SHALL show a check mark. Emptying the input and pressing Enter or leaving it SHALL report the removal of the value. Each option SHALL show its label on a first line, with the part matching the typed text in bold, and an optional detail on a second line. With options given up front, typing SHALL keep only the options whose label contains the typed text, ignoring case. With a search, the combobox SHALL search after at least 2 characters and 300 ms without typing, cancel an older search when a newer one starts, and replace the options with the results. The state rows "Searching…", "No matches" and "Results could not be loaded" SHALL not be selectable and SHALL be announced politely. A disabled combobox SHALL reject input and show its help text.

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
