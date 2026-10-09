## MODIFIED Requirements

### Requirement: Header brand and primary navigation
The header SHALL show the brand logotype, linking to the root of the active locale. The brand logotype and the primary navigation SHALL sit in one group on the left, and the language selector, the theme switch and the session control SHALL sit in one group on the right, in that order, on every viewport. On medium and larger viewports it SHALL also show the "Top rated", "Explore coffee shops" and "About us" entries, in that order; on small viewports those entries SHALL NOT be shown in the header and a navigation menu control, showing a three-lines menu icon and named from the active locale's catalog, SHALL take their place, opening a menu that lists the same entries, in the same order and with the same destinations, presented like the entries of the user menu, the entry of the current route marked as the current page. The primary navigation entries SHALL be presented as navigation items of the header, not as inline text links, and the entry of the current route SHALL be marked as the current page.

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

### Requirement: Signed-out header
While the session is anonymous, the header SHALL show the language selector, the theme switch and a "Sign in" action, and SHALL NOT show a user menu.

#### Scenario: Signed-out header renders
- **WHEN** the session is anonymous
- **THEN** the header shows the brand logotype, the language selector, the theme switch and the "Sign in" action, and shows no user menu

#### Scenario: Sign in starts from the current route
- **WHEN** the user activates "Sign in"
- **THEN** signing in starts for the route the user is on

### Requirement: Signed-in header and user menu
While the session is authenticated, the header SHALL show the brand logotype, the language selector, the theme switch and a user menu opened from a control carrying the initials of the user's name and surname and an accessible name. The control SHALL show an initials circle and, on a medium or larger viewport, the user's name and a chevron after the circle; below that viewport it SHALL show the circle alone. The menu SHALL offer one account entry pointing at the account page, the security entry as an external link to the API's security page, the management entry for the user's role, for a specialist the offerings entry, and sign out.

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

## ADDED Requirements

### Requirement: Theme switch
The header SHALL offer, to every visitor and on every viewport, a theme switch next to the language selector: an icon button with no visible text that switches the application between the traditional and the dark theme and keeps the choice in the browser, so it needs no sign in and survives a reload. Its accessible name SHALL state the current theme and the theme it switches to, in the active locale.

#### Scenario: Switching the theme
- **WHEN** the user activates the theme switch
- **THEN** the whole interface renders in the other theme and the choice is kept in the browser

#### Scenario: The choice survives a reload
- **WHEN** the application loads again after the user chose a theme
- **THEN** it opens in the chosen theme

#### Scenario: No theme chosen yet
- **WHEN** the user has chosen no theme
- **THEN** the application opens in the traditional theme

#### Scenario: Unusable stored choice
- **WHEN** the stored preference is missing, unreadable or names a theme the application does not offer
- **THEN** the application opens in the traditional theme instead of failing

#### Scenario: Switch is named
- **WHEN** assistive technology reaches the theme switch
- **THEN** its accessible name states the current theme and the theme it switches to, in the active locale, and the name changes when the theme changes

#### Scenario: Switch icon
- **WHEN** the theme switch renders
- **THEN** it shows a sun in the traditional theme and a moon in the dark theme, and no visible text

#### Scenario: Switch presentation
- **WHEN** the theme switch renders
- **THEN** it shows no fill and no border at rest, its icon takes `nav-text` and `nav-text-hover` on hover, and it carries the shared visible focus ring on keyboard focus

### Requirement: Header menu surface
The menus opened from the header SHALL extend the header surface: their panel SHALL take `nav-surface` with `nav-text` text, the hover of an entry SHALL take `nav-hover` with `nav-text-hover`, and the panel corner radius SHALL come from `radius-field`. The entry carrying the current choice SHALL be marked with an indicator that follows the entry's text colour.

#### Scenario: Menu surface extends the header
- **WHEN** a header menu opens
- **THEN** its panel surface and text resolve to `nav-surface` and `nav-text` instead of the card-surface treatment other panels use

#### Scenario: Entry hover
- **WHEN** the pointer or the keyboard focus reaches an entry of a header menu
- **THEN** the entry renders `nav-hover` with `nav-text-hover`

#### Scenario: Destructive entry keeps its error colour
- **WHEN** an entry in the destructive variant renders in a header menu, at rest, hovered or focused
- **THEN** its text takes `nav-text-destructive` in all three states and never the entry hover text colour

#### Scenario: Menu panel corner radius
- **WHEN** a header menu opens in either theme
- **THEN** its panel corner radius comes from `radius-field`, while the panels of menus outside the header keep the container radius

#### Scenario: Current choice is marked with an indicator
- **WHEN** the language menu renders with the current language among the choices
- **THEN** the current entry carries an indicator that takes the entry's text colour — `nav-text`, or `nav-text-hover` while the entry is hovered

## REMOVED Requirements

### Requirement: Theme selection
**Reason**: Production AUT finding 28 (backlog R60): the theme control leaves the user menu for an icon switch in the header, offered to every visitor; Product owner's decision drops the scenarios "Choosing a theme" and "Selector is named".
**Migration**: Replaced by "Theme switch", which keeps the reload, no-choice and unusable-choice scenarios unchanged.

### Requirement: Header menu presentation
**Reason**: Production AUT finding 28 (backlog R60): the theme selector leaves the user menu, so the sentence and the scenario "Theme selector inside the menu" about it go.
**Migration**: Replaced by "Header menu surface", which keeps every other sentence and scenario unchanged.
