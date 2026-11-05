# Spec Delta

## ADDED Requirements

### Requirement: Registration landing
The application SHALL offer a registration landing at `/{locale}/join` with a heading, an introduction and two options, the specialist option first and the coffeeshop option second. Each option SHALL show its title, a short text and one action button that opens its registration route of the active locale. The options SHALL stack in one column below the medium breakpoint (768px) and sit in two equal columns from it. Every text SHALL come from the active locale's catalog.

#### Scenario: The landing offers both ways to join
- **WHEN** an anonymous visitor opens `/{locale}/join`
- **THEN** the page shows its heading, its introduction and two options, the specialist option before the coffeeshop option, each with its title as a heading, its text and one action button, in one column below 768px and in two equal columns from it

#### Scenario: Each option opens its form
- **WHEN** the visitor activates the action button of the specialist option or of the coffeeshop option on `/es/join`
- **THEN** the application opens `/es/register` or `/es/register/coffeeshop` respectively

### Requirement: Registration landing session gate
The registration landing SHALL be available only to a visitor who is not signed in. While the session is resolving it SHALL show its heading, its introduction and the loading status, and no option. When the session is authenticated it SHALL show no option and open the root of the active locale through client-side navigation, with no reload and no message.

#### Scenario: The landing waits while the session resolves
- **WHEN** `/{locale}/join` opens while the session is still resolving
- **THEN** the heading, the introduction and the loading status render and no option renders until the session settles

#### Scenario: A signed-in visitor is taken from the landing to the entry page
- **WHEN** `/{locale}/join` opens with an authenticated session
- **THEN** no option renders and the application opens the root of the active locale through client-side navigation, with no reload and no message

## MODIFIED Requirements

### Requirement: Registration routes
The application SHALL offer registration as a specialist at `/{locale}/register` and as a coffeeshop at `/{locale}/register/coffeeshop`, reachable from the registration landing, and each route SHALL send its own role with the registration. While the session is resolving a registration route SHALL wait with no form shown, and when the session is authenticated the application SHALL open the root of the active locale through client-side navigation. Each registration route SHALL present the loading status, the form and the success panel in one section card with no header band. The registration card SHALL fill the page container's width, its content at most 40rem wide and centred horizontally in the card from the medium breakpoint.

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
- **THEN** that content sits in one section card with no header band that spans the page container's width, and from the medium breakpoint that content is at most 40rem wide and centred horizontally in the card
