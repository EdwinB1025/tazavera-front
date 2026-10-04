# Spec Delta

## ADDED Requirements

### Requirement: Brand logotype colors
The brand logotype SHALL render its three drawn parts — leaf, cup and coffee — from three dedicated semantic color tokens, `--color-logo-leaf`, `--color-logo-cup` and `--color-logo-coffee`, and each of those tokens SHALL have a value in both themes.

#### Scenario: Logotype parts take their token values
- **WHEN** the brand logotype renders in either theme
- **THEN** its leaf, cup and coffee parts take their colors from `--color-logo-leaf`, `--color-logo-cup` and `--color-logo-coffee` and each resolves to the value of the active theme

#### Scenario: Logotype token missing from one theme
- **WHEN** verification finds a logotype color token defined in one theme and missing from the other
- **THEN** verification fails and reports the missing token instead of shipping a logotype that loses a part in one theme

## MODIFIED Requirements

### Requirement: UI boundary and focus contrast
Input borders, focus indicators and other UI boundaries that identify a component or its state, and non-text parts of controls such as icons, SHALL have a contrast ratio of at least 3:1 against each adjacent color in both themes (WCAG 2.2, SC 1.4.11). Decorative separators, and borders whose component fill already identifies the component at 3:1 or more, SHALL be exempt from this rule. Logotypes and brand marks SHALL be exempt from this rule, because a part of a logo or brand name is excluded from WCAG 2.2, SC 1.4.11.

#### Scenario: Traditional theme boundaries
- **WHEN** an input border, focus ring or other state-identifying boundary renders in the traditional theme
- **THEN** its contrast against each adjacent color is at least 3:1

#### Scenario: Dark theme boundaries
- **WHEN** an input border, focus ring or other state-identifying boundary renders in the dark theme
- **THEN** its contrast against each adjacent color is at least 3:1

#### Scenario: Decorative separators are exempt
- **WHEN** a decorative separator (a hairline that does not identify a component or its state, such as the filter-bar separator) renders in either theme
- **THEN** it is excluded from the 3:1 rule and verification accepts it without an exception

#### Scenario: Non-text control parts
- **WHEN** an icon or other non-text part of a control renders in either theme
- **THEN** its contrast against the surface it sits on is at least 3:1

#### Scenario: Logotypes are exempt
- **WHEN** a part of the brand logotype renders in either theme and measures below 3:1 against the surface it sits on
- **THEN** it is excluded from the 3:1 rule and verification accepts it without an exception

#### Scenario: Boundary regression detected
- **WHEN** any documented boundary or icon pair measures below 3:1 in either theme
- **THEN** automated verification fails and names the failing pair
