## MODIFIED Requirements

### Requirement: Facet rows
Options of a radio-list facet and of a cascade facet SHALL render as facet rows: the whole row is the click target, at least 2.5rem high, with the control and its label side by side. A row whose option is an applied value SHALL show the selected look: the selected fill, a 4px left indicator, the label underlined and the selected shadow, with the control checked; it SHALL take no hover change. A row that is not applied SHALL show, on hover, a soft inner shadow and a bold label without changing its fill or label colour. The indicator, underline and shadows SHALL be decorative: the checked control carries the state. The help text under a radio-list or cascade facet SHALL start 0.75rem in from the panel's content edge on both sides, aligned with the facet's legend. In the traditional theme the selected shadow SHALL equal a medium drop shadow and the hover shadow a small inner shadow; in the dark theme both SHALL be none.

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
