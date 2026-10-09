## MODIFIED Requirements

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


## ADDED Requirements

### Requirement: Sidebar facets sub-section
On every list whose facets live in the sidebar (the offerings list, the coffee shop directory, a coffee shop's Offerings tab, the public evaluations list and the specialist's evaluations list), the facet panel SHALL sit in the sidebar sub-section (app-shell "Sidebar entry sub-section") of the list's entry: "Explore offerings" on the offerings list, "Explore coffee shops" on the coffee shop directory and "My evaluations" on the specialist's evaluations list; on a list with no entry in the sidebar, the sub-section SHALL stand alone. The sub-section's toggle SHALL carry the facet panel's title ("Filters") as its accessible name and SHALL be closed on arrival. The list toolbar's "Filters" trigger SHALL open it, together with the sidebar. Collapsing it SHALL neither change nor clear the applied filters: the URL, the results, the chips and the trigger's count stay as they are.

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
