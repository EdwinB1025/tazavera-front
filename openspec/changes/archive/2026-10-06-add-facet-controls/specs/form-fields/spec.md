## ADDED Requirements

### Requirement: Facet row presentation
A checkbox and the options of a radio group SHALL offer a facet-row presentation for facets on the sidebar surface. In it, each choice SHALL be a full-width row at least 2.5rem high whose whole area is the label, the control and its label side by side and vertically centred, with a constant 4px left border so the label never shifts. The control's boundary SHALL reach at least 3:1 against the sidebar surface and against the selected fill in both themes. A checked row SHALL show the selected look and no hover change, except a radio option marked as neutral, which SHALL never take the selected look. A row that is not selected SHALL show the hover look of the facet rows. A radio option MAY be hidden; a hidden option SHALL not be visible or reachable by keyboard while it stays part of the group. The existing presentation SHALL keep rendering unchanged when the facet-row presentation is not requested.

#### Scenario: Whole row is the target
- **WHEN** the user clicks anywhere on a facet row
- **THEN** its checkbox toggles or its radio option is chosen

#### Scenario: Checked row
- **WHEN** a facet-row checkbox or radio option is checked
- **THEN** the row shows the selected fill, the left indicator, the underlined label and the selected shadow

#### Scenario: Neutral option
- **WHEN** a radio option marked as neutral is checked
- **THEN** its row shows no selected look

#### Scenario: Hidden option
- **WHEN** a radio option is hidden
- **THEN** it is not visible, the arrow keys skip it, and it becomes reachable again once shown

#### Scenario: Default presentation unchanged
- **WHEN** a checkbox or radio group renders without the facet-row presentation
- **THEN** it renders exactly as before this change
