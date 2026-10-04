# Spec Delta

## ADDED Requirements

### Requirement: Header menu triggers
The controls that open the header menus — the user control and the language selector — are menu triggers and SHALL NOT render as action controls: they take no action-button treatment, and at rest they carry no fill and no border. Their content — text and icons alike — SHALL take the header's navigation text colour and switch to its hover value while the pointer is on the control.

#### Scenario: Triggers are not action controls
- **WHEN** the header renders its user control or its language selector
- **THEN** neither control renders with an action-button treatment, and at rest neither shows a fill or a border

#### Scenario: Trigger content follows the navigation text colours
- **WHEN** the pointer moves onto or off a header menu trigger
- **THEN** its text and its icons switch between `nav-text` and `nav-text-hover`

### Requirement: Header menu presentation
The menus opened from the header SHALL extend the header surface: their panel SHALL take `nav-surface` with `nav-text` text, the hover of an entry SHALL take `nav-hover` with `nav-text-hover`, and the panel corner radius SHALL come from `radius-field`. The entry carrying the current choice SHALL be marked with an indicator that follows the entry's text colour. The theme selector inside the user menu SHALL render in the same treatment as the menu around it.

#### Scenario: Menu surface extends the header
- **WHEN** a header menu opens
- **THEN** its panel surface and text resolve to `nav-surface` and `nav-text` instead of the card-surface treatment other panels use

#### Scenario: Entry hover
- **WHEN** the pointer or the keyboard focus reaches an entry of a header menu
- **THEN** the entry renders `nav-hover` with `nav-text-hover`

#### Scenario: Menu panel corner radius
- **WHEN** a header menu opens in either theme
- **THEN** its panel corner radius comes from `radius-field`, while the panels of menus outside the header keep the container radius

#### Scenario: Current choice is marked with an indicator
- **WHEN** the language menu renders with the current language among the choices
- **THEN** the current entry carries an indicator that takes the entry's text colour — `nav-text`, or `nav-text-hover` while the entry is hovered

#### Scenario: Theme selector inside the menu
- **WHEN** the user menu renders its theme selector
- **THEN** the selector renders in the menu's own treatment and shows no panel-coloured block inside the menu

## MODIFIED Requirements

### Requirement: Signed-in header and user menu
While the session is authenticated, the header SHALL show the brand logotype, the language selector and a user menu opened from a control carrying the initials of the user's name and surname and an accessible name. The control SHALL show an initials circle and, on a medium or larger viewport, the user's name and a chevron after the circle; below that viewport it SHALL show the circle alone. The menu SHALL offer the profile settings entries, the security entry as an external link to the API's security page, a theme selector, the management entry for the user's role, and sign out.

#### Scenario: User control carries the user's initials
- **WHEN** the session is authenticated
- **THEN** the control that opens the user menu shows the initials built from `data.name` and `data.surname` of `GET /user`, and its accessible name identifies the user

#### Scenario: Name and chevron on a medium or larger viewport
- **WHEN** the header renders the user control on a medium or larger viewport
- **THEN** the control shows the initials circle followed by the user's name and a chevron

#### Scenario: Initials circle alone on a small viewport
- **WHEN** the header renders the user control below the medium breakpoint
- **THEN** the control shows the initials circle alone

#### Scenario: Initials circle in the traditional theme
- **WHEN** the header renders in the traditional theme
- **THEN** the initials circle keeps its current fill, text and hover colours and carries no boundary ring

#### Scenario: Initials circle in the dark theme
- **WHEN** the header renders in the dark theme
- **THEN** the initials circle takes `nav-button-bg` with `nav-button-text` at rest and `action-primary-hover` with `action-primary-text` on hover

#### Scenario: Circle boundary in the dark theme
- **WHEN** the initials circle renders in the dark theme
- **THEN** it carries a boundary in `nav-button-border`, so the circle is perceivable against the header surface

#### Scenario: Menu content
- **WHEN** the user opens the user menu
- **THEN** it offers the profile settings entries, the external security entry, the management entry for the user's role and the sign out action

#### Scenario: Management entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Manage offerings", pointing at the management area for offerings

#### Scenario: Management entry for a specialist
- **WHEN** the authenticated user's `data.role` from `GET /user` is `specialist`
- **THEN** the menu offers "Manage evaluations", pointing at the management area for evaluations

#### Scenario: No management entry for the role
- **WHEN** the authenticated user's `data.role` is neither `coffeeshop` nor `specialist`
- **THEN** the menu offers the profile settings entries and sign out with no management entry

#### Scenario: Sign out
- **WHEN** the user activates "Sign out"
- **THEN** the application signs the user out and the header renders as anonymous

### Requirement: Language selection
The header SHALL offer a language selector that opens a menu listing exactly the supported locales, and choosing one SHALL open the current route in that locale. Its control SHALL show a globe icon, the code of the current locale and a chevron on every viewport, and its accessible name SHALL identify what it selects and carry the current language in its own name. Each entry SHALL show its language in that language's own name and carry that language's own `lang` attribute, and the entry of the current language SHALL be marked as the list's single choice.

#### Scenario: Choosing a locale
- **WHEN** the user chooses a locale in the language selector
- **THEN** the application opens the same route in the chosen locale and its texts change accordingly

#### Scenario: Only supported locales are offered
- **WHEN** the language selector renders
- **THEN** it lists exactly the supported locales and offers no locale the application does not support

#### Scenario: Selector is named
- **WHEN** assistive technology reaches the language selector
- **THEN** its accessible name identifies what it selects and carries the current language in its own name

#### Scenario: Trigger content on every viewport
- **WHEN** the header renders on any viewport
- **THEN** the language selector's control shows a globe icon, the code of the current locale and a chevron

#### Scenario: Each language in its own name
- **WHEN** the language selector's menu renders
- **THEN** each entry shows its language in that language's own name and carries that language's own `lang` attribute

#### Scenario: Current language is marked
- **WHEN** the menu renders with the current language among the choices
- **THEN** the current language's entry is marked as the list's single choice and no other entry is marked
