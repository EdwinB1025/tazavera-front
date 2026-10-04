# Spec Delta

## Purpose

Gives the application its shell: the locale routing and message structure every screen sits in, the header with its brand logotype, language selector and user menu, the management sidebar and the main area, and the security rules that apply to the whole front end.

## ADDED Requirements

### Requirement: Locale routing
Every application route SHALL live under a locale prefix, for the supported locales `es`, `en` and `ca`, with `es` as the default. The root URL SHALL redirect to the default locale, and a URL whose prefix is not a supported locale SHALL be reported as not found.

#### Scenario: Route under a locale prefix
- **WHEN** the user opens a route of the application
- **THEN** the URL carries one of the supported locale prefixes and the screen renders in that locale

#### Scenario: Root URL
- **WHEN** the user opens the root URL
- **THEN** the application redirects to the default locale

#### Scenario: Root of a supported locale
- **WHEN** the user opens the root of a supported locale
- **THEN** the shell renders with an empty main area instead of reporting the page as not found

#### Scenario: Unsupported locale
- **WHEN** the user opens a URL whose locale prefix is not supported
- **THEN** the application redirects it to the same path under the default locale, where it resolves to a not-found page, instead of rendering a screen in an unknown locale

### Requirement: Shell layout and main area
The shell SHALL present the header above a main area that holds the content of the current route. The main area SHALL be a single column when no sidebar is present, and SHALL give the sidebar its own column beside the content when the sidebar is present.

#### Scenario: Single column
- **WHEN** a route renders with no sidebar
- **THEN** the main area holds the content in one column below the header

#### Scenario: Sidebar column
- **WHEN** a route renders with the management sidebar present on a medium or larger viewport
- **THEN** the sidebar occupies its own column beside the content and the content region keeps the remaining width

### Requirement: Header brand and primary navigation
The header SHALL show the brand logotype, linking to the root of the active locale. On medium and larger viewports it SHALL also show the "Top rated" and "About us" entries; on small viewports those two entries SHALL NOT be shown.

#### Scenario: Brand link
- **WHEN** the user activates the brand logotype in the header
- **THEN** the application opens the root of the active locale

#### Scenario: Primary navigation on a medium or larger viewport
- **WHEN** the header renders on a medium or larger viewport
- **THEN** it shows "Top rated", pointing at the verified offerings ordered by cupping average descending, and "About us", pointing at the About us page

#### Scenario: Primary navigation on a small viewport
- **WHEN** the header renders on a small viewport
- **THEN** the "Top rated" and "About us" entries are not shown while the brand logotype, the language selector and the session control stay visible

### Requirement: Signed-out header
While the session is anonymous, the header SHALL show the language selector and a "Sign in" action, and SHALL NOT show a user menu.

#### Scenario: Signed-out header renders
- **WHEN** the session is anonymous
- **THEN** the header shows the brand logotype, the language selector and the "Sign in" action, and shows no user menu

#### Scenario: Sign in starts from the current route
- **WHEN** the user activates "Sign in"
- **THEN** signing in starts for the route the user is on

### Requirement: Signed-in header and user menu
While the session is authenticated, the header SHALL show the brand logotype, the language selector and a user menu opened from a control carrying the initials of the user's name and surname and an accessible name. The menu SHALL offer the profile settings entries, a theme selector, the management entry for the user's role, and sign out.

#### Scenario: User control carries the user's initials
- **WHEN** the session is authenticated
- **THEN** the control that opens the user menu shows the initials built from `data.name` and `data.surname` of `GET /user`, and its accessible name identifies the user

#### Scenario: Menu content
- **WHEN** the user opens the user menu
- **THEN** it offers the profile settings entries, the management entry for the user's role and the sign out action

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

### Requirement: Session states in the shell
The shell SHALL follow the session state. While the session is still resolving it SHALL show neither the "Sign in" action nor the user menu, and when the session cannot be resolved it SHALL render the anonymous shell.

#### Scenario: Session resolving
- **WHEN** the session is still resolving
- **THEN** the header shows neither the "Sign in" action nor the user menu, so the signed-out header never appears before the signed-in one

#### Scenario: Session unresolvable
- **WHEN** the session cannot be resolved
- **THEN** the shell renders as anonymous, with the "Sign in" action and no user menu

### Requirement: Language selection
The header SHALL offer a language selector listing exactly the supported locales, and choosing one SHALL open the current route in that locale. The selector SHALL carry an accessible name.

#### Scenario: Choosing a locale
- **WHEN** the user chooses a locale in the language selector
- **THEN** the application opens the same route in the chosen locale and its texts change accordingly

#### Scenario: Only supported locales are offered
- **WHEN** the language selector renders
- **THEN** it lists exactly the supported locales and offers no locale the application does not support

#### Scenario: Selector is named
- **WHEN** assistive technology reaches the language selector
- **THEN** its accessible name identifies what it selects

### Requirement: Theme selection
The menu SHALL offer a theme selector that switches the application between its themes and keeps the choice in the browser, so it needs no sign in and survives a reload. The selector SHALL carry an accessible name.

#### Scenario: Choosing a theme
- **WHEN** the user chooses a theme
- **THEN** the whole interface renders in that theme and the choice is kept in the browser

#### Scenario: The choice survives a reload
- **WHEN** the application loads again after the user chose a theme
- **THEN** it opens in the chosen theme

#### Scenario: No theme chosen yet
- **WHEN** the user has chosen no theme
- **THEN** the application opens in the traditional theme

#### Scenario: Unusable stored choice
- **WHEN** the stored preference is missing, unreadable or names a theme the application does not offer
- **THEN** the application opens in the traditional theme instead of failing

#### Scenario: Selector is named
- **WHEN** assistive technology reaches the theme selector
- **THEN** its accessible name identifies what it selects

### Requirement: Brand logotype presentation
The brand logotype SHALL render in three forms: the drawing alone, the drawing with its wordmark to the right, and the drawing with its wordmark below. Each form SHALL link to the root of the active locale, and the browser icon SHALL show the same drawing.

#### Scenario: Wordmark beside the drawing
- **WHEN** the header renders on a medium or larger viewport
- **THEN** the logotype shows the drawing with its wordmark to the right

#### Scenario: Drawing alone on a small viewport
- **WHEN** the header renders on a small viewport
- **THEN** the logotype shows the drawing alone

#### Scenario: Wordmark below the drawing
- **WHEN** a screen presents the logotype with the wordmark below the drawing
- **THEN** the wordmark is centred under the drawing and the whole logotype links to the root of the active locale

#### Scenario: Browser icon
- **WHEN** the browser shows the application's icon
- **THEN** it shows the same drawing as the logotype, in the traditional colors when the operating system uses a light appearance and in the dark colors when it uses a dark one

#### Scenario: Icon appearance follows the operating system
- **WHEN** the theme chosen in the application differs from the operating-system appearance
- **THEN** the icon still follows the operating-system appearance, and a browser with no support for a dark icon shows the traditional colors

### Requirement: Management sidebar
The management sidebar SHALL appear only for an authenticated user on a management route. On medium and larger viewports it SHALL be collapsible, and on small viewports it SHALL open as a full-screen overlay. This capability defines the region and its presentation; the navigation entries come from the capability that owns the management area in view.

#### Scenario: Shown on a management route
- **WHEN** an authenticated user is on a management route
- **THEN** the sidebar appears with the navigation entries of that management area

#### Scenario: Hidden outside the management area
- **WHEN** the user is on a route outside the management area, or the session is anonymous
- **THEN** the sidebar is not shown and the main area uses a single column

#### Scenario: Collapsible on a medium or larger viewport
- **WHEN** the user collapses the sidebar on a medium or larger viewport
- **THEN** the main area returns to a single column until the user expands the sidebar again

#### Scenario: Full-screen overlay on a small viewport
- **WHEN** the user opens the navigation on a small viewport
- **THEN** the sidebar covers the screen and returns to the content when it is dismissed

#### Scenario: No entries contributed
- **WHEN** the management area in view contributes no navigation entries
- **THEN** the sidebar shows its region with no entries rather than an empty placeholder

### Requirement: Localized interface texts
Every interface text SHALL render from the message catalog of the active locale, and changing the locale SHALL change every text of the screen. Interface text SHALL NOT be written literally in the code that renders it.

#### Scenario: Texts follow the locale
- **WHEN** the locale changes
- **THEN** every interface text of the screen renders from the new locale's catalog and none keeps the previous locale's wording

#### Scenario: Literal interface text detected
- **WHEN** verification finds an interface text written literally in the code that renders the interface
- **THEN** verification fails naming the file and the text, and accepts only the brand wordmark inside the brand logotype

#### Scenario: Brand wordmark is not interface text
- **WHEN** the brand logotype renders
- **THEN** its wordmark renders unchanged in every locale as part of the brand mark

### Requirement: Message catalog structure
Interface texts SHALL be grouped into one catalog per area of the interface and per locale, and every area SHALL define the same set of text keys in every supported locale.

#### Scenario: An area is complete in every locale
- **WHEN** verification compares one area's catalogs across the supported locales
- **THEN** each catalog defines the same set of text keys

#### Scenario: Missing text key detected
- **WHEN** a text key is missing from an area's catalog in one locale
- **THEN** verification fails naming the area, the locale and the key

### Requirement: No injected raw HTML
The application SHALL NOT render markup injected as raw HTML.

#### Scenario: No raw HTML injection
- **WHEN** verification inspects the code that renders the interface
- **THEN** no rendering injects markup as raw HTML

#### Scenario: Raw HTML injection detected
- **WHEN** verification finds a rendering that injects markup as raw HTML
- **THEN** verification fails naming the file and the rendering

### Requirement: Content-Security-Policy
Every response of the application SHALL carry a Content-Security-Policy that allows scripts only from the application itself and allows connections to the API origin.

#### Scenario: Own scripts run
- **WHEN** the application's own scripts load on a page
- **THEN** the policy allows them and the page works

#### Scenario: Scripts from other origins are blocked
- **WHEN** a response attempts to load a script from an origin other than the application's
- **THEN** the policy blocks it

#### Scenario: Connections to the API are allowed
- **WHEN** the application connects to the API origin
- **THEN** the policy allows the connection

#### Scenario: Policy present on every response
- **WHEN** verification inspects the responses of the application
- **THEN** each carries a Content-Security-Policy
