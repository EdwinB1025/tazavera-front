## ADDED Requirements

### Requirement: Locations map kept within the size limits
The shared locations map SHALL be built from components and functions of at most 80 lines and a cyclomatic complexity of at most 15, in files of at most 300 lines, and SHALL render the same map region, markers, zoom buttons, selected-location panel and attribution, with the same names and keyboard behaviour, for the same points, as the other map requirements of this capability state. This requirement adds no behaviour.

#### Scenario: Lint reports no size warning for the map
- **WHEN** `npm run lint` runs
- **THEN** it reports no `max-lines-per-function`, `complexity` or `max-lines` warning for the locations map or the units it renders

#### Scenario: Selecting a marker renders as before
- **WHEN** a marker of the map is activated
- **THEN** the marker takes the selected look and the selected-location panel opens with the point's title, subtitle, address line and link, and Escape or Close closes it and returns the focus to the marker
