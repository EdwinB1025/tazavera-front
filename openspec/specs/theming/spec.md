# theming Specification

## Purpose

Defines Tazavera's design-token system: the color system and its two application themes (traditional default, dark) plus the typographic roles, so every screen renders the designed identity with guaranteed text, boundary and focus contrast.

## Requirements

### Requirement: Two complete color themes
Every semantic color token SHALL have a value in both themes. The traditional theme SHALL be the default. The dark theme SHALL define every color token the traditional theme defines.

#### Scenario: Default theme values
- **WHEN** no theme attribute is set on the document root
- **THEN** every semantic color token resolves to its traditional theme value

#### Scenario: Dark theme values
- **WHEN** `data-theme="dark"` is set on the document root
- **THEN** every semantic color token resolves to its dark theme value and no token keeps its traditional value

#### Scenario: Missing theme role detected
- **WHEN** verification finds a color role defined in one theme and missing from the other
- **THEN** verification fails and reports the missing role instead of shipping an incomplete theme

### Requirement: Text and button contrast
Body text and button text SHALL have a contrast ratio of at least 4.5:1 against their rendered background in both themes (WCAG 2.2, SC 1.4.3). This includes error text and error icons.

#### Scenario: Traditional theme text contrast
- **WHEN** body text, button text or error text renders in the traditional theme
- **THEN** its contrast against the rendered background is at least 4.5:1

#### Scenario: Dark theme text contrast
- **WHEN** body text, button text or error text renders in the dark theme
- **THEN** its contrast against the rendered background is at least 4.5:1

#### Scenario: Contrast regression detected
- **WHEN** any documented text pair measures below 4.5:1 in either theme
- **THEN** automated verification fails and names the failing pair

### Requirement: UI boundary and focus contrast
Input borders, focus indicators and other UI boundaries that identify a component or its state, and non-text parts of controls such as icons, SHALL have a contrast ratio of at least 3:1 against each adjacent color in both themes (WCAG 2.2, SC 1.4.11). Decorative separators, and borders whose component fill already identifies the component at 3:1 or more, SHALL be exempt from this rule.

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

#### Scenario: Boundary regression detected
- **WHEN** any documented boundary or icon pair measures below 3:1 in either theme
- **THEN** automated verification fails and names the failing pair

### Requirement: Typographic roles
Each typographic role SHALL define its family, weight, style, size per breakpoint, line height and tracking, and SHALL take its color from a semantic color token.

#### Scenario: Complete role definitions
- **WHEN** verification reads the defined typographic roles
- **THEN** each role defines its family, weight, style, size per breakpoint, line height and tracking and binds exactly one semantic color token

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
- **THEN** its text size is 16px

#### Scenario: Minimum size for error and action text
- **WHEN** error text or action text renders at any viewport size
- **THEN** its size is at least 14px

#### Scenario: Display roles scale with viewport
- **WHEN** the viewport grows across the documented breakpoints
- **THEN** display roles increase in size and body and UI roles keep their single size

### Requirement: Shared focus indicator
Every interactive control SHALL render the same focus indicator when it receives keyboard focus: one ring with one offset, whose colors come from the focus tokens of the active theme. No control SHALL render a focus treatment of its own.

#### Scenario: Same indicator on every interactive control
- **WHEN** interactive controls of different kinds receive keyboard focus in the same theme
- **THEN** each renders the same focus indicator, identical in ring width, offset and colors

#### Scenario: Indicator follows the active theme
- **WHEN** the active theme changes and an interactive control receives keyboard focus
- **THEN** the indicator's ring and offset resolve to the focus token values of the active theme while its shape and size stay identical

#### Scenario: Divergent indicator detected
- **WHEN** verification finds an interactive control rendering a focus indicator that differs from the shared one or is built from anything but the focus tokens
- **THEN** verification fails and names the offending control
