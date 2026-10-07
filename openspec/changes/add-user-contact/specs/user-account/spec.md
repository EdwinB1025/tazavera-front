## MODIFIED Requirements

### Requirement: Account page and its session gate
The account page at `/{locale}/account` SHALL show one heading block and, for an authenticated session, five sections in order — Profile, Contact details, Password, Security and Danger zone — each named by its heading; the Profile section is filled from the session user's `data.name`, `data.surname`, `data.email` and `data.role`. While the session is resolving, the page SHALL show the heading block and one card with the loading status in place of the sections. While the session is anonymous — including after a declined step-up or a write whose `401` no recovery resolves — the page SHALL show the heading block and one card with the signed-out text and a "Sign in" action, with no automatic redirect.

#### Scenario: The session is resolving
- **WHEN** the account page opens while the session is still resolving
- **THEN** the heading block and one card with the loading status render in place of the sections

#### Scenario: Signed out
- **WHEN** the account page is open and the session is anonymous
- **THEN** one card shows the signed-out text and a "Sign in" action, no section renders, and the page does not redirect

#### Scenario: Signing in from the account page
- **WHEN** the user activates "Sign in" on the account page
- **THEN** sign in starts synchronously inside that click for the route the user is on, and the user stays on the page

#### Scenario: The session ends while the page is open
- **WHEN** the session becomes `anonymous` while the account page is open
- **THEN** the page shows the signed-out state, whatever ended the session

#### Scenario: The four sections
- **WHEN** the session is authenticated
- **THEN** the page shows Profile, Password, Security and Danger zone in that order, each named by its heading

#### Scenario: Contact details is the second section
- **WHEN** the session is authenticated
- **THEN** the page shows Profile, Contact details, Password, Security and Danger zone in that order, each named by its heading

## ADDED Requirements

### Requirement: Contact details
The Contact details section SHALL read `GET /users/{data.ulid}/contacts` with the current token when it renders for an authenticated session and SHALL show the item of `data` whose `isPrimary` is `true`. While the read is pending the section SHALL show the loading status. A read answered with a primary contact SHALL show its non-null values read-only, one labelled row each, in the order Address (`address`), Postal code (`postalCode`), City (`city`), Country (`country`), Phone (`phone`), Email (`email`), Web (`web`) and Social media (`social`), each as the API returns it; the web value SHALL be a same-tab link only when it starts with `http://` or `https://`, and text otherwise. A read with no primary contact, or with one whose eight values are all null, SHALL show the empty text and an "Add contact details" action. A read that fails — a network failure, a server error, a `403` or any other status — SHALL show the section's error text and a "Try again" action that repeats the read, while the rest of the page keeps working. A `401` SHALL never be shown: the client's recovery chain runs and an `anonymous` end shows the page's signed-out state. The section SHALL render no message from the API.

#### Scenario: The contact is loading
- **WHEN** the Contact details section renders and the read is pending
- **THEN** the section shows the loading status and no contact, empty text or form

#### Scenario: A saved contact is shown read-only
- **WHEN** the read answers `200` with a `data` item whose `isPrimary` is `true`
- **THEN** the section shows that item's non-null values, one labelled row each, in the order Address, Postal code, City, Country, Phone, Email, Web and Social media, with no form and no action to edit

#### Scenario: A null value has no row
- **WHEN** the primary contact has `web` null and every other value set
- **THEN** the section shows seven rows and none for Web

#### Scenario: A web address becomes a link only for http and https
- **WHEN** the primary contact's `web` starts with `http://` or `https://`
- **THEN** the Web row shows it as a link that opens in the same tab, and any other value is shown as text and is never a link

#### Scenario: No contact yet
- **WHEN** the read answers `200` with `{ data: [] }`, or with no item whose `isPrimary` is `true`
- **THEN** the section shows the empty text and the "Add contact details" action

#### Scenario: The read fails
- **WHEN** the read answers a server error, a `403` or any other non-success status, or the request fails
- **THEN** the section shows its error text and a "Try again" action, and the other sections keep working

#### Scenario: Trying again
- **WHEN** the user activates "Try again"
- **THEN** the section shows the loading status and repeats the read

### Requirement: Contact details form
Activating "Add contact details" SHALL replace the empty text and the action with a form in the same section and move focus to its first field. The form SHALL collect Address, Postal code, City, Country, Phone, Email, Web and Social media, and SHALL send `POST /users/{data.ulid}/contacts` with `address`, `postal_code`, `city`, `country`, `phone`, `email`, `web` and `social`, an empty optional field being sent as `null`. Before sending, the form SHALL check only what the operation's request documents: Address and City are required, a non-empty email is a valid address, a non-empty web value is an absolute URL, and no field accepts more characters than its documented maximum (address 255, postal code 12, city 90, country 60, phone 25, email 255, web 255, social 255). A failing check SHALL show its message under the field, mark the field as invalid, move focus to the first failing field and send nothing. While the request is pending, the submit action SHALL show its busy state and "Cancel" SHALL be disabled. "Cancel" SHALL close the form, discard the typed values, show the empty state again and move focus to "Add contact details". A `201` SHALL close the form, show the success status above the created contact shown read-only and move focus to the section heading. A `409` SHALL close the form, show the text that a contact already exists, read the contact again and move focus to the section heading. A `403` follows "Writes and the step-up". A `422`, a server error, a network failure or any other status SHALL show the generic form-level error above the actions and keep the values.

#### Scenario: Opening the form
- **WHEN** the user activates "Add contact details"
- **THEN** the form replaces the empty text and the action, and focus moves to the Address field

#### Scenario: A required field is empty
- **WHEN** the user submits the form with Address or City empty or only spaces
- **THEN** the field shows the required-field message and is marked invalid, focus moves to the first failing field, and nothing is sent

#### Scenario: An invalid email or web address
- **WHEN** the user submits the form with an email that is not a valid address or a web value that is not an absolute URL
- **THEN** the field shows its format message and is marked invalid, focus moves to the first failing field, and nothing is sent

#### Scenario: Maximum lengths
- **WHEN** the user types or pastes into a field more characters than its documented maximum
- **THEN** the field keeps at most that many characters

#### Scenario: The request carries the form
- **WHEN** every check passes and the user submits the form
- **THEN** `POST /users/{data.ulid}/contacts` is sent with the current token and the eight values under `address`, `postal_code`, `city`, `country`, `phone`, `email`, `web` and `social`, each empty optional value as `null`, the submit action shows its busy state and "Cancel" is disabled

#### Scenario: Cancelling
- **WHEN** the user activates "Cancel" on the open form
- **THEN** the form closes, the typed values are discarded, the empty text and "Add contact details" render again and focus moves to "Add contact details"

#### Scenario: The contact is created
- **WHEN** the request answers `201`
- **THEN** the form closes, the success status renders above the created contact shown read-only, and focus moves to the section heading

#### Scenario: A contact already exists
- **WHEN** the request answers `409`
- **THEN** the form closes, the text that a contact already exists renders as a status, the contact is read again and shown read-only below it, and focus moves to the section heading

#### Scenario: The creation is rejected for its scope
- **WHEN** the request answers `403`
- **THEN** the step-up notice renders above the form's actions and every typed value is kept

#### Scenario: The creation is rejected or fails
- **WHEN** the request answers `422`, a server error or any other status except `201`, `403` and `409`, or the request fails
- **THEN** the generic form-level error renders above the actions, every typed value is kept, and the API's message is never rendered
