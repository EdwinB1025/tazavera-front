## MODIFIED Requirements

### Requirement: Account page modes and their session gate
The account page at `/{locale}/account` SHALL show one heading block and, for an authenticated session, the sections of its mode, each named by its heading. In read mode, the default, the sections SHALL be Profile, Contact details and Security, in that order; the Profile section is read-only and filled from the session user's `data.name`, `data.surname`, `data.email` and `data.role`. In edit mode, `/{locale}/account?edit=1`, the profile form SHALL take the place of the read-only profile and the Danger zone SHALL follow Security. "Edit profile" and "Change password" SHALL start the identity check synchronously inside the click and SHALL open edit mode or `/{locale}/account/password` only after the identity check is granted; when it is cancelled or fails, the page SHALL stay in its mode with no message, and when it is completed by another account, the page SHALL stay in its mode and show one status message asking the user to confirm their identity with the account they signed in with. Each of the sections SHALL be a section card whose header band holds its heading and, where it has one, its description, and the section cards SHALL be 1rem apart with the page background showing between them. The heading block and the section cards SHALL fill the page container's width; from the medium breakpoint the content of each section card SHALL be at most 40rem wide, aligned to the card's start. While the session is resolving, the page SHALL show the heading block and one section card with no header band, holding the loading status, in place of the sections. While the session is anonymous — including after a declined step-up or a write whose `401` no recovery resolves — the page SHALL show the heading block and one section card with no header band, holding the signed-out text and a "Sign in" action, with no automatic redirect.

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

#### Scenario: The read-mode sections
- **WHEN** the session is authenticated and the page is in read mode
- **THEN** the page shows Profile, Contact details and Security in that order, each named by its heading, with no profile form, no Password section and no Danger zone

#### Scenario: The edit-mode sections
- **WHEN** the session is authenticated and the page is in edit mode
- **THEN** the page shows Edit profile, Contact details, Security and Danger zone in that order, each named by its heading

#### Scenario: Sections hang from the page background
- **WHEN** the session is authenticated
- **THEN** the sections render as section cards 1rem apart with the page background showing between them, each card's header band holds its heading and, where it has one, its description, and the heading block sits 2rem above the sections

#### Scenario: The gate card has no header band
- **WHEN** the account page shows its loading card or its signed-out card
- **THEN** the card is a section card with no header band and its content sits in the card body

#### Scenario: Sections fill the container
- **WHEN** the session is authenticated on a medium or larger viewport
- **THEN** the section cards span the page container's width and each card's content is at most 40rem wide, start-aligned

#### Scenario: Edit mode waits for the identity check
- **WHEN** the user activates "Edit profile" in read mode
- **THEN** the page stays in read mode while the identity check is pending and opens `/{locale}/account?edit=1` once it is granted

#### Scenario: The password route waits for the identity check
- **WHEN** the user activates "Change password"
- **THEN** `/{locale}/account/password` opens only once the identity check is granted

#### Scenario: The identity check popup is closed
- **WHEN** the user closes the identity check popup after activating "Edit profile"
- **THEN** the page stays in read mode with no message

#### Scenario: The identity check is completed by another account
- **WHEN** the identity check started from the account page is completed by another account
- **THEN** the page stays in its mode and shows one status message (role `status`) asking the user to confirm their identity with the account they signed in with
