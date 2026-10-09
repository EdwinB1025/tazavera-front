## MODIFIED Requirements

### Requirement: Theme-driven corner radii
Corner radii SHALL come from the radius token family — `radius-pill` for action buttons and pill shapes, `radius-container` for containers and for menus opened from a card, `radius-field` for fields and for menus opened from a field or the navigation, `radius-check` for checkboxes — and every radius token SHALL have a value in both themes.

#### Scenario: Traditional shapes
- **WHEN** the traditional theme is active
- **THEN** action buttons render fully rounded, containers and menus opened from a card at 16px corner radius, fields and menus opened from a field or the navigation at 8px, and checkboxes at 4px

#### Scenario: Menu opened from a field or the navigation
- **WHEN** a menu panel opens from a field (Select, Combobox) or from the navigation (the header nav menu)
- **THEN** its panel uses the field radius (`radius-field`)

#### Scenario: Menu opened from a card
- **WHEN** a menu panel opens from a card
- **THEN** its panel uses the container radius (`radius-container`)

#### Scenario: Dark theme shapes
- **WHEN** the dark theme is active
- **THEN** every radius token resolves to 0 and those controls render square

#### Scenario: Intrinsic circular shapes are exempt
- **WHEN** a shape that is intrinsically circular (avatar, coffee bean, slider thumb) renders in the dark theme
- **THEN** it stays circular, because its shape does not come from a radius token

#### Scenario: Radius completeness detected
- **WHEN** verification finds a radius token defined in one theme and missing from the other
- **THEN** verification fails and reports the missing token
