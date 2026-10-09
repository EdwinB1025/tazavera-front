## MODIFIED Requirements

### Requirement: Header brand and primary navigation
The header SHALL show the brand logotype, linking to the root of the active locale. The brand logotype and the primary navigation SHALL sit in one group on the left, and the language selector, the theme switch and the session control SHALL sit in one group on the right, in that order, on every viewport. On medium and larger viewports it SHALL also show the "Top rated", "Explore coffee shops" and "About us" entries, in that order; on small viewports those entries SHALL NOT be shown in the header and a navigation menu control, showing a three-lines menu icon and named from the active locale's catalog, SHALL take their place, opening a menu that lists the same entries, in the same order and with the same destinations, presented like the entries of the user menu, the entry of the current route marked as the current page, each entry showing a decorative icon that reflects it before its text. The entries of that menu SHALL take the header menu entry treatment, not the inline link treatment. The primary navigation entries SHALL be presented as navigation items of the header, not as inline text links, and the entry of the current route SHALL be marked as the current page.

#### Scenario: Brand link
- **WHEN** the user activates the brand logotype in the header
- **THEN** the application opens the root of the active locale

#### Scenario: Primary navigation on a medium or larger viewport
- **WHEN** the header renders on a medium or larger viewport
- **THEN** it shows "Top rated", pointing at the verified offerings ordered by cupping average descending, "Explore coffee shops", pointing at the coffee shop directory, and "About us", pointing at the About us page, in that order

#### Scenario: Primary navigation on a small viewport
- **WHEN** the header renders on a small viewport
- **THEN** the "Top rated", "Explore coffee shops" and "About us" entries are not shown in the header while the brand logotype, the navigation menu control, the language selector, the theme switch and the session control stay visible

#### Scenario: Navigation menu on a small viewport
- **WHEN** the user activates the navigation menu control on a small viewport
- **THEN** a menu opens listing "Top rated", "Explore coffee shops" and "About us", in that order and with the destinations of the primary navigation, each entry presented like an entry of the user menu, and activating one opens its destination

#### Scenario: Navigation menu control
- **WHEN** the header renders
- **THEN** the navigation menu control shows a three-lines icon with no visible text, carries the catalog's accessible name in the active locale and the shared visible focus ring, and is not shown on medium and larger viewports

#### Scenario: Header grouping on every viewport
- **WHEN** the header renders on any viewport
- **THEN** the brand logotype and the primary navigation form one group on the left, the language selector, the theme switch and the session control form one group on the right after it, in that order, and no viewport changes that grouping

#### Scenario: Navigation entries are navigation items
- **WHEN** the primary navigation renders on a medium or larger viewport
- **THEN** each entry fills the header's height with its label centred in the navigation item typography, shows no underline in any state, and the navigation sits visibly apart from the brand logotype

#### Scenario: Navigation entry hover
- **WHEN** the pointer rests on an entry that is not the current page
- **THEN** the entry takes the navigation hover fill and the navigation hover text colour

#### Scenario: Navigation entry keyboard focus
- **WHEN** an entry receives keyboard focus
- **THEN** it shows the shared visible focus ring

#### Scenario: Current page entry
- **WHEN** the current route's path equals an entry's path, ignoring the query
- **THEN** that entry carries `aria-current="page"` and a bottom bar in the navigation indicator colour, takes no hover fill, and no other entry is marked

#### Scenario: Navigation menu entries carry icons and the header look
- **WHEN** the user opens the navigation menu on a small viewport
- **THEN** each entry shows a decorative icon hidden from assistive technology before its text, takes `nav-text` with `nav-text-hover` on hover and focus, and shows no underline and no link colour, in both themes

### Requirement: Signed-in header and user menu
While the session is authenticated, the header SHALL show the brand logotype, the language selector, the theme switch and a user menu opened from a control carrying the initials of the user's name and surname and an accessible name. The control SHALL show an initials circle and, on a medium or larger viewport, the user's name and a chevron after the circle; below that viewport it SHALL show the circle alone. The menu SHALL offer one account entry pointing at the account page, the security entry as an external link to the API's security page, the management entry for the user's role, for a specialist the offerings entry, and sign out. Each entry SHALL show a decorative icon that reflects its action before its text and SHALL take the header menu entry treatment, not the inline link treatment, while keeping its order, destination and behaviour.

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
- **THEN** the initials circle keeps its current fill, text and hover colours and shows no boundary ring, `nav-avatar-border` being transparent in that theme

#### Scenario: Initials circle in the dark theme
- **WHEN** the header renders in the dark theme
- **THEN** the initials circle takes `nav-avatar` with `nav-text-dark` at rest and `nav-avatar-hover` on hover, those tokens holding in the dark theme the "Sign in" pair (`nav-button-bg` with `nav-button-text`) at rest and the `action-primary-hover` value on hover

#### Scenario: Circle boundary in the dark theme
- **WHEN** the initials circle renders in the dark theme
- **THEN** it carries a boundary in `nav-avatar-border`, which holds the `nav-button-border` value in the dark theme, so the circle is perceivable against the header surface

#### Scenario: Menu content
- **WHEN** the user opens the user menu
- **THEN** it offers the account entry, the external security entry, the management entry for the user's role and, for a specialist, the offerings entry, and the sign out action

#### Scenario: The account entry points at the account page
- **WHEN** the user opens the user menu
- **THEN** its account entry points at `/{locale}/account`

#### Scenario: Management entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Manage offerings", pointing at the management area for offerings

#### Scenario: Management entry for a specialist
- **WHEN** the authenticated user's `data.role` from `GET /user` is `specialist`
- **THEN** the menu offers "Manage evaluations", pointing at the management area for evaluations, followed by "Explore offerings", pointing at `/{locale}/offerings` with no query

#### Scenario: No management entry for the role
- **WHEN** the authenticated user's `data.role` is neither `coffeeshop` nor `specialist`
- **THEN** the menu offers the account entry and sign out with no management entry

#### Scenario: Sign out
- **WHEN** the user activates "Sign out"
- **THEN** the application signs the user out and the header renders as anonymous

#### Scenario: Menu entries carry icons and the header look
- **WHEN** the user opens the user menu
- **THEN** each entry shows a decorative icon hidden from assistive technology before its text, takes `nav-text` with `nav-text-hover` on hover and focus, and shows no underline and no link colour, in both themes
