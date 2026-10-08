# app-shell Specification

## Purpose
Gives the application its shell: the locale routing and message structure every screen sits in, the header with its brand logotype, language selector and user menu, the management sidebar and the main area, and the security rules that apply to the whole front end.

## Requirements

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
- **THEN** the shell renders the entry page in its main area instead of reporting the page as not found

#### Scenario: Unsupported locale
- **WHEN** the user opens a URL whose locale prefix is not supported
- **THEN** the application redirects it to the same path under the default locale, where it resolves to a not-found page, instead of rendering a screen in an unknown locale

### Requirement: Shell layout and main area
The shell SHALL present the header above a main area that holds the content of the current route. The main area SHALL be a single column when no sidebar is present, and SHALL give the sidebar its own column beside the content when the route in view has a sidebar. The shell SHALL occupy at least the viewport height, and the main area SHALL extend from the header to the bottom of the viewport whatever the height of its content. The main area SHALL show the page backdrop: in the traditional theme a light blue-green surface distinct from the cream card surface, and in the dark theme a surface darker than the card surface.

#### Scenario: Single column
- **WHEN** a route renders with no sidebar
- **THEN** the main area holds the content in one column below the header

#### Scenario: Sidebar column
- **WHEN** a route renders with its sidebar expanded on a medium or larger viewport
- **THEN** the sidebar occupies its own column beside the content and the content region keeps the remaining width

#### Scenario: Main area fills the viewport
- **WHEN** a route renders content shorter than the viewport, in either theme
- **THEN** the main area, with the page surface, reaches from the header to the bottom of the viewport and no other background shows below it

#### Scenario: Page backdrop
- **WHEN** a route renders in the traditional theme
- **THEN** the main area shows the light blue-green backdrop, and cards on it show the cream card surface; and in the dark theme the backdrop is darker than the cards on it

### Requirement: Header brand and primary navigation
The header SHALL show the brand logotype, linking to the root of the active locale. The brand logotype and the primary navigation SHALL sit in one group on the left, and the language selector and the session control SHALL sit in one group on the right, on every viewport. On medium and larger viewports it SHALL also show the "Top rated", "Explore coffee shops" and "About us" entries, in that order; on small viewports those entries SHALL NOT be shown. The primary navigation entries SHALL be presented as navigation items of the header, not as inline text links, and the entry of the current route SHALL be marked as the current page.

#### Scenario: Brand link
- **WHEN** the user activates the brand logotype in the header
- **THEN** the application opens the root of the active locale

#### Scenario: Primary navigation on a medium or larger viewport
- **WHEN** the header renders on a medium or larger viewport
- **THEN** it shows "Top rated", pointing at the verified offerings ordered by cupping average descending, "Explore coffee shops", pointing at the coffee shop directory, and "About us", pointing at the About us page, in that order

#### Scenario: Primary navigation on a small viewport
- **WHEN** the header renders on a small viewport
- **THEN** the "Top rated", "Explore coffee shops" and "About us" entries are not shown while the brand logotype, the language selector and the session control stay visible

#### Scenario: Header grouping on every viewport
- **WHEN** the header renders on any viewport
- **THEN** the brand logotype and the primary navigation form one group on the left, the language selector and the session control form one group on the right after it, and no viewport changes that grouping

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
While the session is anonymous, the header SHALL show the language selector and a "Sign in" action, and SHALL NOT show a user menu.

#### Scenario: Signed-out header renders
- **WHEN** the session is anonymous
- **THEN** the header shows the brand logotype, the language selector and the "Sign in" action, and shows no user menu

#### Scenario: Sign in starts from the current route
- **WHEN** the user activates "Sign in"
- **THEN** signing in starts for the route the user is on

### Requirement: Signed-in header and user menu
While the session is authenticated, the header SHALL show the brand logotype, the language selector and a user menu opened from a control carrying the initials of the user's name and surname and an accessible name. The control SHALL show an initials circle and, on a medium or larger viewport, the user's name and a chevron after the circle; below that viewport it SHALL show the circle alone. The menu SHALL offer one account entry pointing at the account page, the security entry as an external link to the API's security page, a theme selector, the management entry for the user's role, and sign out.

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
- **THEN** it offers the account entry, the external security entry, the management entry for the user's role and the sign out action

#### Scenario: The account entry points at the account page
- **WHEN** the user opens the user menu
- **THEN** its account entry points at `/{locale}/account`

#### Scenario: Management entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Manage offerings", pointing at the management area for offerings

#### Scenario: Management entry for a specialist
- **WHEN** the authenticated user's `data.role` from `GET /user` is `specialist`
- **THEN** the menu offers "Manage evaluations", pointing at the management area for evaluations

#### Scenario: No management entry for the role
- **WHEN** the authenticated user's `data.role` is neither `coffeeshop` nor `specialist`
- **THEN** the menu offers the account entry and sign out with no management entry

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
The header SHALL offer a language selector that opens a menu listing exactly the supported locales, and choosing one SHALL open the current route in that locale. Its control SHALL show a globe icon, the code of the current locale and a chevron on every viewport, and its accessible name SHALL identify what it selects and carry the current language in its own name. Each entry SHALL show its language in that language's own name and carry that language's own `lang` attribute, and the entry of the current language SHALL be marked as the list's single choice.

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
- **THEN** the language selector's control shows a globe icon, the code of the current locale and a chevron

#### Scenario: Each language in its own name
- **WHEN** the language selector's menu renders
- **THEN** each entry shows its language in that language's own name and carries that language's own `lang` attribute

#### Scenario: Current language is marked
- **WHEN** the menu renders with the current language among the choices
- **THEN** the current language's entry is marked as the list's single choice and no other entry is marked

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
The sidebar SHALL appear for an authenticated user on a management route and, for every session state, on the offerings list route, on the coffee shop directory route and on a coffee shop detail route while its Offerings tab is shown; on every other route there SHALL be no sidebar. The content of the sidebar SHALL come from the route in view: the navigation entries of a management area, or the controls of a list, supplied by the capability that owns that route; this capability defines the region, its presentation and its controls. On medium and larger viewports the sidebar SHALL be expanded on arrival and collapsible; on small viewports it SHALL be closed on arrival and SHALL open as a full-screen overlay. When the user navigates within the application, the sidebar SHALL follow the route reached, never keeping the content of the previous route.

#### Scenario: Shown on a management route
- **WHEN** an authenticated user is on a management route
- **THEN** the sidebar appears with the navigation entries of that management area

#### Scenario: Shown on the offerings list
- **WHEN** a visitor, signed in or not, is on the offerings list route, with or without a query
- **THEN** the sidebar appears with the content the offerings list supplies and no navigation entries

#### Scenario: Shown on the coffee shop directory
- **WHEN** a visitor, signed in or not, is on the coffee shop directory route, with or without a query
- **THEN** the sidebar appears with the coffee shop facets and no navigation entries

#### Scenario: Shown on the coffee shop Offerings tab
- **WHEN** a visitor, signed in or not, is on a coffee shop detail route with the Offerings tab shown, and then selects the Locations tab
- **THEN** the sidebar appears with the offering facets on the Offerings tab and is not shown on the Locations tab

#### Scenario: Hidden outside the management area
- **WHEN** the user is on a route that is neither a management route, the offerings list, the coffee shop directory nor a coffee shop's Offerings tab, or the session is not authenticated on a management route
- **THEN** the sidebar is not shown and the main area uses a single column

#### Scenario: Sidebar follows in-app navigation
- **WHEN** the user moves within the application from a route with a sidebar to a route without one, and back again
- **THEN** the sidebar disappears on the second route and appears again, with the first route's content, on returning to it

#### Scenario: Unknown route stays not found
- **WHEN** the user opens a path under a supported locale that no route defines
- **THEN** the application reports the page as not found, without a sidebar

#### Scenario: Collapsible on a medium or larger viewport
- **WHEN** the user collapses the sidebar on a medium or larger viewport
- **THEN** the main area returns to a single column until the user expands the sidebar again

#### Scenario: Expanded on arrival on a medium or larger viewport
- **WHEN** the user arrives on a route with a sidebar on a medium or larger viewport
- **THEN** the sidebar is expanded beside the content

#### Scenario: Closed on arrival on a small viewport
- **WHEN** the user arrives on a route with a sidebar on a small viewport
- **THEN** the sidebar is closed and the content of the route is visible, not covered by the overlay

#### Scenario: Full-screen overlay on a small viewport
- **WHEN** the user opens the sidebar on a small viewport
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
Every document response of the application SHALL carry a Content-Security-Policy that allows scripts only from the application itself, allows connections to the API origin and to `https://nominatim.openstreetmap.org`, and allows images from the map tile server `https://tile.openstreetmap.org`. Static assets — framework paths under `/_next/` and file paths — are intentionally excluded from the policy, and `/callback` gets its policy from `add-auth`, which owns that route.

#### Scenario: Own scripts run
- **WHEN** the application's own scripts load on a page
- **THEN** the policy allows them and the page works

#### Scenario: Scripts from other origins are blocked
- **WHEN** a response attempts to load a script from an origin other than the application's
- **THEN** the policy blocks it

#### Scenario: Connections to the API are allowed
- **WHEN** the application connects to the API origin
- **THEN** the policy allows the connection

#### Scenario: Connections to the geocoding service are allowed
- **WHEN** the application looks up an address at `https://nominatim.openstreetmap.org`
- **THEN** the policy allows the connection, and connections to any other origin outside the application, the API and that service stay blocked

#### Scenario: Map images are allowed
- **WHEN** the map loads its images from the map tile server `https://tile.openstreetmap.org`
- **THEN** the policy allows them, and images from any other external origin stay blocked

#### Scenario: Policy present on every document response
- **WHEN** verification inspects the responses of the application
- **THEN** each document response carries a Content-Security-Policy, while the excluded static assets and the `/callback` route carry none from this policy

### Requirement: Header menu triggers
The controls that open the header menus — the user control and the language selector — are menu triggers and SHALL NOT render as action controls: they take no action-button treatment, and at rest they carry no fill and no border. Their content — text and icons alike — SHALL take the header's navigation text colour and switch to its hover value while the pointer is on the control. On keyboard focus a trigger SHALL keep the visible focus ring defined by `base-controls`: one ring with its offset, rendered from the focus tokens of the active theme.

#### Scenario: Triggers are not action controls
- **WHEN** the header renders its user control or its language selector
- **THEN** neither control renders with an action-button treatment, and at rest neither shows a fill or a border

#### Scenario: Trigger content follows the navigation text colours
- **WHEN** the pointer moves onto or off a header menu trigger
- **THEN** its text and its icons switch between `nav-text` and `nav-text-hover`

#### Scenario: Trigger keeps the focus ring on keyboard focus
- **WHEN** a header menu trigger receives keyboard focus
- **THEN** a focus ring with its offset renders around it from the focus tokens of the active theme

### Requirement: Header menu presentation
The menus opened from the header SHALL extend the header surface: their panel SHALL take `nav-surface` with `nav-text` text, the hover of an entry SHALL take `nav-hover` with `nav-text-hover`, and the panel corner radius SHALL come from `radius-field`. The entry carrying the current choice SHALL be marked with an indicator that follows the entry's text colour. The theme selector inside the user menu SHALL render in the same treatment as the menu around it.

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

#### Scenario: Theme selector inside the menu
- **WHEN** the user menu renders its theme selector
- **THEN** the selector renders in the menu's own treatment and shows no panel-coloured block inside the menu

### Requirement: Cross-Origin-Opener-Policy
Every document response of the application except the callback route SHALL carry `Cross-Origin-Opener-Policy: same-origin-allow-popups`, so the application's pages stay isolated while a popup window keeps its opener.

#### Scenario: Opener kept outside the callback
- **WHEN** a page other than the callback route answers a request
- **THEN** its response carries `Cross-Origin-Opener-Policy: same-origin-allow-popups`

### Requirement: Sidebar re-open control
On a route that has a sidebar, the header SHALL offer a control that opens the sidebar whenever the sidebar is collapsed on a medium or larger viewport, and on a small viewport, where the sidebar is closed until the user opens it. The control SHALL be presented as the header's navigation buttons are, SHALL carry an accessible name from the message catalog of the active locale and SHALL report that the sidebar is not expanded. On a route without a sidebar the header SHALL NOT show it.

#### Scenario: Control shown while collapsed
- **WHEN** the user collapses the sidebar on a medium or larger viewport
- **THEN** the header shows the re-open control, named and reporting the sidebar as not expanded, and keyboard focus moves to it

#### Scenario: Re-opening the sidebar
- **WHEN** the user activates the re-open control on a medium or larger viewport
- **THEN** the sidebar is expanded again, the re-open control is no longer shown and keyboard focus moves to the sidebar's collapse control

#### Scenario: Control hidden while expanded
- **WHEN** the sidebar is expanded on a medium or larger viewport
- **THEN** the header shows no re-open control, the sidebar's own collapse control being available

#### Scenario: Opening on a small viewport
- **WHEN** the user activates the re-open control on a small viewport
- **THEN** the sidebar opens as the full-screen overlay, and dismissing it returns keyboard focus to the re-open control

#### Scenario: No control without a sidebar
- **WHEN** the route in view has no sidebar, on any viewport
- **THEN** the header shows no re-open control

#### Scenario: Control named in every locale
- **WHEN** the shell renders the re-open control in `es`, `en` or `ca`
- **THEN** its accessible name is the sidebar toggle text of that locale's catalog

### Requirement: Sidebar entry presentation
A navigation entry in the sidebar SHALL be a link to its route, and the entry of the current route SHALL be marked as the current page. On hover, an entry that is not the current one SHALL show the navigation hover fill with its label in the navigation hover text colour, meeting the 4.5:1 text contrast in both themes. Every control inside the sidebar SHALL show the inverse focus indicator, meeting 3:1 against the sidebar surface in both themes.

#### Scenario: Entry is a link
- **WHEN** a management area contributes an entry to the sidebar
- **THEN** the entry is a link to its route, keeps the sidebar entry look and can carry an icon before its label

#### Scenario: Current entry marked
- **WHEN** the user is on the route of a sidebar entry
- **THEN** that entry is marked as the current page

#### Scenario: Entry hover label
- **WHEN** the user hovers an entry that is not the current one
- **THEN** the entry shows the navigation hover fill and its label turns to the navigation hover text colour

#### Scenario: Focus inside the sidebar
- **WHEN** a control inside the sidebar receives keyboard focus, in either theme
- **THEN** it shows the inverse focus indicator, which meets 3:1 against the sidebar surface

### Requirement: Protected content gate
A protected view SHALL show its loading presentation while the session resolves; while the session is anonymous it SHALL show the view's signed-out message and a "Sign in" action in place of the content, with no redirect and sign in starting synchronously inside the click; for a signed-in user the route does not allow it SHALL show the application's not-found page; and for an allowed signed-in user it SHALL show the view's content. The gate SHALL add no text of its own.

#### Scenario: Session resolving
- **WHEN** a protected view opens while the session is still resolving
- **THEN** the view's loading presentation renders in place of the content and no signed-out message shows

#### Scenario: Anonymous visitor
- **WHEN** a protected view is open and the session is anonymous
- **THEN** the view's signed-out message and its "Sign in" action render in place of the content, no content renders, and the view does not redirect

#### Scenario: Signing in from the gate
- **WHEN** the visitor activates "Sign in" on a protected view
- **THEN** sign in starts synchronously inside that click for the route the user is on, and the user stays on the route

#### Scenario: Role the route does not allow
- **WHEN** the session is authenticated and the route does not allow the signed-in user
- **THEN** the application's not-found page renders instead of the content

#### Scenario: Allowed signed-in user
- **WHEN** the session is authenticated and the route allows the signed-in user
- **THEN** the view's content renders for that user and no loading presentation or signed-out message renders

#### Scenario: The gate adds no text of its own
- **WHEN** any state of a protected view renders
- **THEN** every visible text comes from the consuming capability's message catalog and no text, frame or layout comes from the gate itself

### Requirement: Not-found page
When a route under a supported locale is not found — the path matches no route, or the route reports its content as not found or not allowed for the signed-in user — the application SHALL show its not-found page inside the shell, in the active locale and theme. The page SHALL show a heading that names the outcome, a short text saying the page does not exist or is not available to them, and a link back to the root of the active locale. Every text SHALL come from the active locale's catalog.

#### Scenario: Not-found page content
- **WHEN** the not-found page renders for a supported locale
- **THEN** it shows a level-one heading with that locale's not-found title and the not-found text, inside the shell's main area

#### Scenario: Back to the home page
- **WHEN** the not-found page renders for a supported locale
- **THEN** it offers a link, named with that locale's "back to the home page" text, that opens the root of that locale
