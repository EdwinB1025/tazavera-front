# Spec Delta

## ADDED Requirements

### Requirement: Access to the locations page
The locations page at `/{locale}/manage/locations` SHALL present its content only to a signed-in coffeeshop. While the session is being resolved the page SHALL show its heading block and the loading status. An anonymous visitor SHALL see the heading block, the signed-out message and a "Sign in" action in place of the content, with no automatic redirect. A signed-in user whose role is not `coffeeshop` SHALL get the 404 page.

#### Scenario: Session loading
- **WHEN** a visitor opens the locations page while the session is being resolved
- **THEN** the heading block and the loading status render, and neither the signed-out message, the list nor the 404 page renders

#### Scenario: Anonymous visitor
- **WHEN** an anonymous visitor opens the locations page, or the session becomes anonymous while it is open
- **THEN** the heading block, the signed-out message and its "Sign in" action render in place of the content, and the page does not redirect

#### Scenario: Signing in from the page
- **WHEN** the anonymous visitor activates "Sign in"
- **THEN** the sign-in flow starts within that activation for the locations route and the visitor stays on the page

#### Scenario: Another role
- **WHEN** a signed-in user whose role is not `coffeeshop` opens the locations page
- **THEN** the 404 page renders and no location request is sent

### Requirement: Own locations list
For a signed-in coffeeshop the page SHALL read `GET /users/{ulid}/locations` with the session user's `ulid` and show the locations in one column, in the order returned. Each location SHALL show its `name`, its `description` when not null, the non-null values of its primary contact (the item of `contacts` with `isPrimary: true`), and, when `latitud` or `longitud` is null, a "Not on the map" line. While the read is pending the loading status SHALL render in the list's place.

#### Scenario: Locations listed
- **WHEN** the read answers `200` with locations
- **THEN** an "Add location" action renders above one column with one card per location, in the order returned, the list named by the page heading

#### Scenario: Card contents
- **WHEN** a location card renders
- **THEN** it shows the `name`, the `description` only when it is not null, and the primary contact's address, postal code, city, country, phone, email, web and social, each only when not null, exactly as returned

#### Scenario: Location without coordinates
- **WHEN** a location has a null `latitud` or a null `longitud`
- **THEN** its card shows the "Not on the map" line

#### Scenario: Read pending
- **WHEN** the read is pending
- **THEN** the loading status renders in the list's place

#### Scenario: Read fails
- **WHEN** the read answers any non-2xx status or fails
- **THEN** the list error text and a "Try again" action render in the list's place

#### Scenario: Try again
- **WHEN** the user activates "Try again"
- **THEN** the read is sent again and the loading status renders while it is pending

### Requirement: Empty locations state
When the read answers `200` with no location, the page SHALL show one card with the empty text and an "Add location" action, and no list.

#### Scenario: No locations
- **WHEN** the read answers `200` with an empty `data`
- **THEN** one card shows the empty text and the "Add location" action, and no list renders

### Requirement: Location form
Activating "Add location" SHALL reveal the location form: in the empty state in place of the empty card's content, otherwise in place of the action above the list. The form SHALL hold two labelled groups — Location (name, description) and Address and contact (address, postal code, city, country, phone, email, web, social) — the "Save" and "Cancel" actions, the geocoding help text and the OpenStreetMap attribution with its link to the OpenStreetMap copyright page.

#### Scenario: Revealing the form
- **WHEN** the user activates "Add location"
- **THEN** the form renders with its "New location" heading in the action's place, and focus moves to the Name field

#### Scenario: Help and attribution
- **WHEN** the form renders
- **THEN** the geocoding help text and the attribution line render below the fields, and the attribution's "OpenStreetMap contributors" link opens the OpenStreetMap copyright page in the same tab

#### Scenario: Cancelling
- **WHEN** the user activates "Cancel"
- **THEN** the form closes, the typed values are discarded, nothing is sent, and focus returns to "Add location"

### Requirement: Location form checks
Before sending anything, the form SHALL check only what the create request documents: name, address and city are required, and a non-empty email must be a valid address; each field accepts no more characters than the request's documented maximum. A failing check SHALL show its message under the field, mark the field as invalid, move focus to the first failing field and send no request, neither to the geocoding service nor to the API.

#### Scenario: A required field is empty
- **WHEN** the user submits the form with an empty name, address or city
- **THEN** each empty required field shows the required-field message and is marked invalid, focus moves to the first failing field, and no request is sent

#### Scenario: An invalid email
- **WHEN** the user submits the form with a non-empty email that is not a valid address
- **THEN** the email field shows the email-format message and is marked invalid, focus moves to it, and no request is sent

#### Scenario: Optional fields left empty
- **WHEN** every required field is filled, any email is valid, and the other fields are empty
- **THEN** no check fails and the submission proceeds

### Requirement: Address geocoding
After the checks pass, the form SHALL look up the address once with the geocoding service, sending address, postal code, city and country as separate fields, and SHALL use the first result's latitude and longitude as the location's coordinates. No result, a non-2xx status, a failure or a wait over 5 seconds SHALL leave the location without coordinates. The lookup SHALL run only on submit and SHALL not repeat for an address already looked up on the page.

#### Scenario: One structured lookup per submit
- **WHEN** the checks pass on submit
- **THEN** exactly one lookup is sent, carrying the address, postal code, city and country as separate fields, the empty ones left out, and asking for one result

#### Scenario: The address is found
- **WHEN** the lookup answers with at least one result
- **THEN** the create request carries the first result's latitude and longitude as `latitud` and `longitud`

#### Scenario: The address is not found or the lookup fails
- **WHEN** the lookup answers with no result, answers a non-2xx status, fails or takes more than 5 seconds
- **THEN** the create request is sent without `latitud` and `longitud`

#### Scenario: Busy while looking up
- **WHEN** the lookup or the create request is pending
- **THEN** "Save" shows its busy state, "Cancel" is unavailable, and no second submission can start

#### Scenario: No lookup while typing
- **WHEN** the user types in any field of the form
- **THEN** no request is sent to the geocoding service

#### Scenario: Same address submitted again
- **WHEN** the user submits again, on the same page, an address whose lookup already answered
- **THEN** no new lookup is sent and the earlier result, or its absence, is used

### Requirement: Location creation
The form SHALL send `POST /locations` with `name`, the non-empty optional `description`, both `latitud` and `longitud` or neither, and a `contact` holding `address`, `city` and the non-empty optional contact fields. A `201` SHALL close the form, show the creation status above the list — with a second sentence when the location was saved without coordinates — re-read the list and move focus to the page heading.

#### Scenario: Created with coordinates
- **WHEN** the create request carried coordinates and answers `201`
- **THEN** the form closes, the "Location created." status renders above the list, the list is read again, and focus moves to the page heading

#### Scenario: Created without coordinates
- **WHEN** the create request carried no coordinates and answers `201`
- **THEN** the same outcome occurs and the status adds the sentence saying the address was not found on the map

#### Scenario: Status cleared on a new form
- **WHEN** the creation status is shown and the user activates "Add location"
- **THEN** the status no longer renders

### Requirement: Location creation failures
A `403` answer to the create request SHALL show the step-up notice above the form's actions. A `422`, a server error, a network failure or any other status SHALL show the generic form error above the actions. In both cases the form SHALL stay open with every value kept.

#### Scenario: The creation is rejected or fails
- **WHEN** the create request answers `422`, a server error or any other status except `201` and `403`, or the request fails
- **THEN** the generic form error renders above the actions, every value is kept, and the API's message is never rendered

#### Scenario: Step-up after 403
- **WHEN** the create request answers `403`
- **THEN** the step-up notice and its "Confirm identity" action render above the actions and every value is kept

#### Scenario: Confirming identity
- **WHEN** the user activates "Confirm identity"
- **THEN** the write-scope sign in starts synchronously inside that click for the locations route, keeping the page and the typed values, and activating "Save" again sends the request with the new token

### Requirement: Localized location texts
Every text of the locations page — heading, intro, list and form states, group legends, field labels, actions, help, attribution, statuses and the sidebar entry — SHALL render in the active locale (Spanish, English or Catalan) from the message catalog. Location and contact values SHALL render exactly as the API returns them, and no `message` string of an API or geocoding response SHALL render.

#### Scenario: Texts follow the locale
- **WHEN** the locations page opens in Spanish, English or Catalan
- **THEN** every text renders in that locale and none keeps another locale's wording

#### Scenario: API values untranslated
- **WHEN** a location card renders
- **THEN** its values render exactly as the API returned them

#### Scenario: Response messages not shown
- **WHEN** any request succeeds or fails
- **THEN** no `message` string of a response renders as interface text

## MODIFIED Requirements

### Requirement: Management sidebar entry
The offerings list, offering creation and locations routes SHALL show two sidebar entries in this order, each with an icon and a visible label: "Manage offerings", addressing the list route, and "Manage locations", addressing `/{locale}/manage/locations`. "Manage offerings" SHALL be the current entry on the list and create routes, "Manage locations" on the locations route. The create route has no entry; it stays reachable from the list's "New offering" link and its empty-state link.

#### Scenario: One entry
- **WHEN** a signed-in coffeeshop opens any coffee shop management route
- **THEN** the sidebar shows the "Manage offerings" entry and then the "Manage locations" entry, each with its icon and label, and no "My offerings" or "New offering" entry

#### Scenario: Current entry marked
- **WHEN** the list route or the create route is open
- **THEN** the "Manage offerings" entry is marked as the current page and the "Manage locations" entry is not

#### Scenario: Locations entry marked
- **WHEN** the locations route is open
- **THEN** the "Manage locations" entry is marked as the current page and the "Manage offerings" entry is not

#### Scenario: Entry navigates
- **WHEN** the coffeeshop activates the "Manage offerings" entry
- **THEN** the list route opens

#### Scenario: Locations entry navigates
- **WHEN** the coffeeshop activates the "Manage locations" entry
- **THEN** the locations route opens
