# Spec Delta

## MODIFIED Requirements

### Requirement: Signed-out header
While the session is anonymous, the header SHALL show the language selector, the theme switch and a "Sign in" action, and SHALL NOT show a user menu. From the medium breakpoint (768px) it SHALL also show a "Register" action button immediately before "Sign in", in the same group, that opens the registration landing of the active locale (`/{locale}/join`); below 768px the header SHALL NOT show it. The "Register" action SHALL NOT be shown while the session is authenticated. On a 375px-wide viewport the signed-out header SHALL fit without horizontal overflow.

#### Scenario: Signed-out header renders
- **WHEN** the session is anonymous
- **THEN** the header shows the brand logotype, the language selector, the theme switch and the "Sign in" action, shows the "Register" action immediately before "Sign in" only from 768px, and shows no user menu

#### Scenario: Register opens the registration landing
- **WHEN** a signed-out visitor activates the header's "Register" action in the `es` locale
- **THEN** the application opens `/es/join`

#### Scenario: No Register action when signed in
- **WHEN** the session is authenticated
- **THEN** the header shows no "Register" action

#### Scenario: Sign in starts from the current route
- **WHEN** the user activates "Sign in"
- **THEN** signing in starts for the route the user is on

#### Scenario: Header fits a small viewport
- **WHEN** a signed-out visitor opens a page with the sidebar control on a 375px-wide viewport
- **THEN** the header shows the language selector as an icon with its accessible name, the theme toggle at its full size and the sign-in action without horizontal overflow

#### Scenario: Catalan sign-in label fits on one line
- **WHEN** a signed-out visitor opens a page in Catalan on a 375px-wide viewport
- **THEN** the header's sign-in label fits on one line

### Requirement: Session states in the shell
The shell SHALL follow the session state. While the session is still resolving it SHALL show neither the "Sign in" action, the "Register" action nor the user menu, and when the session cannot be resolved it SHALL render the anonymous shell.

#### Scenario: Session resolving
- **WHEN** the session is still resolving
- **THEN** the header shows neither the "Sign in" action, the "Register" action nor the user menu, so the signed-out header never appears before the signed-in one

#### Scenario: Session unresolvable
- **WHEN** the session cannot be resolved
- **THEN** the shell renders as anonymous, with the "Sign in" action and no user menu

### Requirement: Named navigation landmarks
Every navigation landmark of the application SHALL carry an accessible name from the message catalog of the active locale, and no two navigation landmarks shown on the same page SHALL share a name: the header's primary navigation is named "Main" and the sidebar's navigation "Management" (in Spanish "Principal" and "Gestión"; in Catalan "Principal" and "Gestió"). Naming a landmark SHALL NOT change any visible text or presentation.

#### Scenario: Header navigation named
- **WHEN** the header renders on a medium or larger viewport in English
- **THEN** its primary navigation is a navigation landmark named "Main"

#### Scenario: Sidebar navigation named
- **WHEN** the sidebar shows navigation entries in English
- **THEN** they sit in a navigation landmark named "Management"

#### Scenario: Registration links named
- **WHEN** the entry page or the About us page renders in English
- **THEN** its single link to the About us page or to the registration landing sits in no navigation landmark, so the page shows no navigation landmark named "Registration"

#### Scenario: Names follow the locale
- **WHEN** the locale changes
- **THEN** every navigation landmark's name renders from the new locale's catalog
