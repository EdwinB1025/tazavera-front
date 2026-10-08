## MODIFIED Requirements

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

### Requirement: Offering filter state in the URL

The URL query SHALL be the only state of the offering facets and sort, using the contract's key names. On load, each facet SHALL show the value of its key; an absent key SHALL show "Any", an empty field or the full 60–100 range. Each committed change SHALL navigate to the same path with the new query and without `page`, add one history entry, keep the focus on the control that changed and keep the scroll position. A value outside the facet limits (text longer than its limit, `verified` other than `0` or `1`, a score outside 60–100 or a minimum above the maximum, a sort pair that is not one of the sort options) SHALL be dropped before the list request, and its facet SHALL show its empty state. A `cataRef` value that is not a listed taste note SHALL be shown neither as checked nor as a chip; it is still sent, and a rejection by the API shows the catalog's error state. Pagination SHALL keep every other key.

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

## REMOVED Requirements

### Requirement: Taxonomy cascade facet
**Reason**: Product owner's AUT findings 15 and 16 (backlog R48): the cascade's independent checkbox rows and separate expand control are replaced by a chip cascade whose second-level options render only while their parent is chosen.
**Migration**: See "Taxonomy chip cascade facet" below; it keeps the "See more" rule and the option-order report.

## ADDED Requirements

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
