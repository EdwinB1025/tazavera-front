# Spec Delta

## Purpose

Defines Tazavera's design-token system: the color system and its two application themes (traditional default, dark) plus the typographic roles, so every screen renders the designed identity with guaranteed text, boundary and focus contrast.

## ADDED Requirements

### Requirement: Two complete color themes
Every colored element SHALL take its color from the active theme. The traditional theme SHALL be the default. The dark theme SHALL define every color role the traditional theme defines.

#### Scenario: Default rendering
- **WHEN** the user opens any screen without a theme preference applied
- **THEN** every surface, text, border, action, navigation, feedback and rating element uses the traditional theme colors

#### Scenario: Dark theme rendering
- **WHEN** the dark theme is applied to the document
- **THEN** every colored element switches to the dark theme colors and no element is left using a traditional color

#### Scenario: Unthemed color detected
- **WHEN** verification finds a colored element whose role the active theme does not define
- **THEN** verification fails and reports the missing role instead of shipping an unthemed color

### Requirement: Text and button contrast
Body text and button text SHALL have a contrast ratio of at least 4.5:1 against their rendered background in both themes (WCAG 2.2, SC 1.4.3). This includes error text and error icons.

#### Scenario: Traditional theme text contrast
- **WHEN** body text, button text or error text renders in the traditional theme
- **THEN** its contrast against the rendered background is at least 4.5:1

#### Scenario: Dark theme text contrast
- **WHEN** body text, button text or error text renders in the dark theme
- **THEN** its contrast against the rendered background is at least 4.5:1

#### Scenario: Contrast regression detected
- **WHEN** any documented text pair measures below 4.5:1 in either theme and no explicit exception is recorded for it
- **THEN** automated verification fails and names the failing pair

### Requirement: UI boundary and focus contrast
Input borders, focus indicators and other UI boundaries that identify a component or its state SHALL have a contrast ratio of at least 3:1 against each adjacent color in both themes (WCAG 2.2, SC 1.4.11). Decorative separators SHALL be exempt from this rule.

#### Scenario: Traditional theme boundaries
- **WHEN** an input border, focus ring or other state-identifying boundary renders in the traditional theme
- **THEN** its contrast against each adjacent color is at least 3:1

#### Scenario: Dark theme boundaries
- **WHEN** an input border, focus ring or other state-identifying boundary renders in the dark theme
- **THEN** its contrast against each adjacent color is at least 3:1

#### Scenario: Decorative separators are exempt
- **WHEN** a decorative separator (a hairline that does not identify a component or its state, such as the filter-bar separator) renders in either theme
- **THEN** it is excluded from the 3:1 rule and verification accepts it without an exception

#### Scenario: Boundary regression detected
- **WHEN** any documented boundary pair measures below 3:1 in either theme and no explicit exception is recorded for it
- **THEN** automated verification fails and names the failing pair

### Requirement: Focus indicator visibility
Every interactive element SHALL display a visible focus indicator in both themes.

#### Scenario: Focused control in the traditional theme
- **WHEN** a control receives keyboard focus in the traditional theme
- **THEN** a focus ring is rendered that is distinguishable from both the control and the surrounding surface

#### Scenario: Focused control in the dark theme
- **WHEN** a control receives keyboard focus in the dark theme
- **THEN** a focus ring is rendered that is distinguishable from both the control and the surrounding surface

### Requirement: Typographic roles
Every piece of rendered text SHALL use one of the defined typographic roles. Each role SHALL define its family, weight, style, size, line height and tracking, and SHALL take its color from a semantic color token.

#### Scenario: Text renders through a role
- **WHEN** text renders on any screen
- **THEN** its family, weight, style, size, line height and tracking match one of the defined typographic roles and its color comes from that role's semantic color token

#### Scenario: Text outside every role
- **WHEN** verification finds rendered text whose metrics match no defined role
- **THEN** verification fails and reports the unclassified text

### Requirement: Theme-invariant typography
Switching themes SHALL change only text colors. Font family, weight, style, size, line height and tracking SHALL be identical in both themes.

#### Scenario: Identical metrics across themes
- **WHEN** the dark theme is applied to the document
- **THEN** every typographic role keeps the same family, weight, style, size, line height and tracking as in the traditional theme and only its color changes

#### Scenario: Metric drift detected
- **WHEN** verification finds a typographic role whose metrics differ between themes
- **THEN** verification fails and reports the drifting role

### Requirement: Text sizing accessibility
Control text SHALL render at 16px on small screens to prevent focus zoom, and error and action text SHALL never render below 14px. Display roles SHALL scale up at larger breakpoints while body and UI roles SHALL keep one size across breakpoints.

#### Scenario: Control text on a small screen
- **WHEN** a form control renders on a small screen
- **THEN** its text size is 16px and focusing it does not zoom the viewport

#### Scenario: Minimum size for error and action text
- **WHEN** error text or action text renders at any viewport size
- **THEN** its size is at least 14px

#### Scenario: Display roles scale with viewport
- **WHEN** the viewport grows across the documented breakpoints
- **THEN** display roles increase in size and body and UI roles keep their single size
