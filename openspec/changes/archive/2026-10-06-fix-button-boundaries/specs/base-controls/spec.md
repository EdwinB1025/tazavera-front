# Spec Delta

## MODIFIED Requirements

### Requirement: Action button treatments
Action buttons SHALL render in one of the defined action treatments — primary action, positional actions 1 through 4, and the navigation action used in the header — and each treatment SHALL take its background, text, border and hover colors from semantic tokens that resolve per theme.

#### Scenario: Primary action
- **WHEN** an action button with the primary treatment renders in either theme
- **THEN** its background, label, border and hover colors resolve to the primary action values of the active theme

#### Scenario: Positional actions
- **WHEN** an action button with positional treatment 1, 2, 3 or 4 renders in either theme
- **THEN** its background, label, border and hover colors resolve to that position's action values of the active theme

#### Scenario: Navigation action in the header
- **WHEN** an action button with the navigation treatment renders in the header
- **THEN** its background, label and border colors resolve to the navigation action values of the active theme
