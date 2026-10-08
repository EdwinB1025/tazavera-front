## MODIFIED Requirements

### Requirement: Registration routes
The application SHALL offer registration as a specialist at `/{locale}/register` and as a coffeeshop at `/{locale}/register/coffeeshop`, reachable from the entry page and the About us page, and each route SHALL send its own role with the registration. While the session is resolving a registration route SHALL wait with no form shown, and when the session is authenticated the application SHALL open the root of the active locale through client-side navigation. Each registration route SHALL present the loading status, the form and the success panel in one section card with no header band. The registration card SHALL fill the page container's width, its content at most 40rem wide from the medium breakpoint.

#### Scenario: The specialist route registers a specialist
- **WHEN** a visitor submits the registration form on `/{locale}/register`
- **THEN** the registration is sent with `role: "specialist"`

#### Scenario: The coffeeshop route registers a coffeeshop
- **WHEN** a visitor submits the registration form on `/{locale}/register/coffeeshop`
- **THEN** the registration is sent with `role: "coffeeshop"`

#### Scenario: The session is resolving
- **WHEN** a registration route opens while the session is still resolving
- **THEN** the heading and the loading status render and no form is shown until the session settles

#### Scenario: A signed-in visitor is taken to the entry page
- **WHEN** a registration route opens with an authenticated session, including right after signing in from the success panel
- **THEN** the application opens the root of the active locale through client-side navigation, with no reload and no message

#### Scenario: The registration card
- **WHEN** a registration route renders while the session resolves, while it shows the form, or after a `201` has replaced the form with the success panel
- **THEN** that content sits in one section card with no header band that spans the page container's width, and from the medium breakpoint that content is at most 40rem wide

### Requirement: Account page and its session gate
The account page at `/{locale}/account` SHALL show one heading block and, for an authenticated session, five sections in order — Profile, Contact details, Password, Security and Danger zone — each named by its heading; the Profile section is filled from the session user's `data.name`, `data.surname`, `data.email` and `data.role`. Each of the five sections SHALL be a section card whose header band holds its heading and, where it has one, its description, and the five section cards SHALL be 1rem apart with the page background showing between them. The heading block and the section cards SHALL fill the page container's width; from the medium breakpoint the content of each section card SHALL be at most 40rem wide, aligned to the card's start. While the session is resolving, the page SHALL show the heading block and one section card with no header band, holding the loading status, in place of the sections. While the session is anonymous — including after a declined step-up or a write whose `401` no recovery resolves — the page SHALL show the heading block and one section card with no header band, holding the signed-out text and a "Sign in" action, with no automatic redirect.

#### Scenario: The session is resolving
- **WHEN** the account page opens while the session is still resolving
- **THEN** the heading block and one section card with no header band, holding the loading status, render in place of the sections

#### Scenario: Signed out
- **WHEN** the account page is open and the session is anonymous
- **THEN** one section card with no header band shows the signed-out text and a "Sign in" action, no section renders, and the page does not redirect

#### Scenario: Signing in from the account page
- **WHEN** the user activates "Sign in" on the account page
- **THEN** sign in starts synchronously inside that click for the route the user is on, and the user stays on the page

#### Scenario: The session ends while the page is open
- **WHEN** the session becomes `anonymous` while the account page is open
- **THEN** the page shows the signed-out state, whatever ended the session

#### Scenario: The four sections
- **WHEN** the session is authenticated
- **THEN** the page shows Profile, Password, Security and Danger zone in that order, each named by its heading

#### Scenario: Sections hang from the page background
- **WHEN** the session is authenticated
- **THEN** the five sections render as section cards 1rem apart with the page background showing between them, each card's header band holds its heading and, where it has one, its description, and the heading block sits 2rem above the sections

#### Scenario: The gate card has no header band
- **WHEN** the account page shows its loading card or its signed-out card
- **THEN** the card is a section card with no header band and its content sits in the card body

#### Scenario: Contact details is the second section
- **WHEN** the session is authenticated
- **THEN** the page shows Profile, Contact details, Password, Security and Danger zone in that order, each named by its heading

#### Scenario: Sections fill the container
- **WHEN** the session is authenticated on a medium or larger viewport
- **THEN** the section cards span the page container's width and each card's content is at most 40rem wide, start-aligned
