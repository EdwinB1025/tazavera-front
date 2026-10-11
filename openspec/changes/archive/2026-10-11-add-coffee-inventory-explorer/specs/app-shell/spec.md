## MODIFIED Requirements

### Requirement: Signed-in header and user menu
While the session is authenticated, the header SHALL show the brand logotype, the language selector, the theme switch and a user menu opened from a control carrying the initials of the user's name and surname and an accessible name. The control SHALL show an initials circle and, on a medium or larger viewport, the user's name and a chevron after the circle; below that viewport it SHALL show the circle alone. The menu SHALL offer one account entry pointing at the account page, the security entry as an external link to the API's security page, the management entries for the user's role — for a coffeeshop "Manage offerings", "Manage locations" and "Explore coffee inventory" in this order — for a specialist the offerings entry, and sign out. Each entry SHALL show a decorative icon that reflects its action before its text and SHALL take the header menu entry treatment, not the inline link treatment, while keeping its order, destination and behaviour.

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
- **THEN** it offers the account entry, the external security entry, the management entries for the user's role and, for a specialist, the offerings entry, and the sign out action

#### Scenario: The account entry points at the account page
- **WHEN** the user opens the user menu
- **THEN** its account entry points at `/{locale}/account`

#### Scenario: Management entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Manage offerings", pointing at the management area for offerings

#### Scenario: Manage locations entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Manage locations", pointing at `/{locale}/manage/locations`, right after "Manage offerings"

#### Scenario: Explore coffee inventory entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Explore coffee inventory", pointing at `/{locale}/manage/inventory`, right after "Manage locations"

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
