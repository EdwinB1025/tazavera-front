## MODIFIED Requirements

### Requirement: Signed-out header
While the session is anonymous, the header SHALL show the language selector, the theme switch and a "Sign in" action, and SHALL NOT show a user menu. On a 375px-wide viewport the signed-out header SHALL fit without horizontal overflow.

#### Scenario: Signed-out header renders
- **WHEN** the session is anonymous
- **THEN** the header shows the brand logotype, the language selector, the theme switch and the "Sign in" action, and shows no user menu

#### Scenario: Sign in starts from the current route
- **WHEN** the user activates "Sign in"
- **THEN** signing in starts for the route the user is on

#### Scenario: Header fits a small viewport
- **WHEN** a signed-out visitor opens a page with the sidebar control on a 375px-wide viewport
- **THEN** the header shows the language selector as an icon with its accessible name, the theme toggle at its full size and the sign-in action without horizontal overflow

### Requirement: Language selection
The header SHALL offer a language selector that opens a menu listing exactly the supported locales, and choosing one SHALL open the current route in that locale. Its control SHALL show a globe icon and a chevron on every viewport and the code of the current locale on medium and larger viewports, and its accessible name SHALL identify what it selects and carry the current language in its own name. Each entry SHALL show its language in that language's own name and carry that language's own `lang` attribute, and the entry of the current language SHALL be marked as the list's single choice.

#### Scenario: Choosing a locale
- **WHEN** the user chooses a locale in the language selector
- **THEN** the application opens the same route in the chosen locale and its texts change accordingly

#### Scenario: Choosing the current language changes nothing
- **WHEN** the user chooses the entry of the language that is already active
- **THEN** the menu closes and the application navigates nowhere, adding no history entry

#### Scenario: Only supported locales are offered
- **WHEN** the language selector renders
- **THEN** it lists exactly the supported locales and offers no locale the application does not support

#### Scenario: Selector is named
- **WHEN** assistive technology reaches the language selector
- **THEN** its accessible name is the code of the current locale in uppercase, then ` — `, then what it selects and the current language in its own name — `ES — Idioma: Español` when the current language is `es`

#### Scenario: Trigger content on every viewport
- **WHEN** the header renders on any viewport
- **THEN** the language selector's control shows a globe icon and a chevron, and on medium and larger viewports also the code of the current locale

#### Scenario: Each language in its own name
- **WHEN** the language selector's menu renders
- **THEN** each entry shows its language in that language's own name and carries that language's own `lang` attribute

#### Scenario: Current language is marked
- **WHEN** the menu renders with the current language among the choices
- **THEN** the current language's entry is marked as the list's single choice and no other entry is marked
