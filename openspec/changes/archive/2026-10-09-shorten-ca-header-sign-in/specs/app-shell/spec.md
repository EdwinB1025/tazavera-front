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

#### Scenario: Catalan sign-in label fits on one line
- **WHEN** a signed-out visitor opens a page in Catalan on a 375px-wide viewport
- **THEN** the header's sign-in label fits on one line
