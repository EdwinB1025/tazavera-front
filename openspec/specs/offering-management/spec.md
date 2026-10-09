# offering-management Specification

## Purpose
The coffeeshop's management area: its own offerings as a list with selection and the deletion of one or several, and the creation of offerings from one coffee-inventory item across the coffeeshop's locations. It is what a signed-in coffeeshop meets on the management routes behind the user menu's "Manage offerings" entry.

## Requirements

### Requirement: Access to the management area
Both management routes — `/{locale}/manage/offerings` and `/{locale}/manage/offerings/new` — SHALL present their content only to a signed-in coffeeshop. While the session is being resolved the route shows its loading presentation and no gate message. An anonymous visitor SHALL see a signed-out message and a "Sign in" action in place of the form on the create route and in place of the list on the list route, and SHALL see no "New offering" link. A signed-in user whose role is not `coffeeshop` SHALL get the 404 page.

#### Scenario: Session loading
- **WHEN** a visitor opens either management route while the session is being resolved
- **THEN** the route shows its loading presentation — skeleton cards on the list route, the form panel with its controls unavailable on the create route — and neither the signed-out message nor the 404 page renders

#### Scenario: Anonymous visitor on the list route
- **WHEN** an anonymous visitor opens the list route
- **THEN** the page heading renders, the signed-out message and its "Sign in" action render in place of the list, and no "New offering" link renders

#### Scenario: Anonymous visitor on the create route
- **WHEN** an anonymous visitor opens the create route
- **THEN** the signed-out message and its "Sign in" action render in place of the form

#### Scenario: Signing in from the route
- **WHEN** the anonymous visitor activates the "Sign in" action
- **THEN** the sign-in flow opens within that activation, the visitor stays on the route, and after signing in the route shows the content of a signed-in coffeeshop

#### Scenario: Another role
- **WHEN** a signed-in user whose role is not `coffeeshop` opens either management route
- **THEN** the 404 page renders

### Requirement: My offerings list
The list route SHALL show the offerings of the signed-in coffeeshop — the API's offering list filtered by the coffeeshop's user identifier — one offering card per offering of the current page, in a grid of one column below the large breakpoint (1024px), two columns from 1024px and three from the extra-large breakpoint (1536px), with the cards of one row sharing their height. The requested page SHALL live in the route's query (`?page=n`) and Previous and Next pagination SHALL follow the API's current and last page. The list SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the coffeeshop's offerings load and the API returns offerings
- **THEN** one offering card renders per offering of the current page, the selection toolbar renders above the grid, and the pagination reflects the API's current and last page

#### Scenario: Grid beside the sidebar
- **WHEN** the list renders offering cards
- **THEN** the cards fill one column below 1024px, two from 1024px and three from 1536px, separated by a gap, and the cards of one row share the same height

#### Scenario: Loading
- **WHEN** the list is loading its data
- **THEN** three skeleton cards render in the grid's place, the page heading renders, and no toolbar, empty message or error message renders

#### Scenario: Empty
- **WHEN** the coffeeshop has no offerings
- **THEN** a message and a "create an offering" link to the create route render and no offering card renders

#### Scenario: Error and retry
- **WHEN** the offerings cannot be loaded, whether the request fails or returns a non-success status
- **THEN** a message and a retry action render and no offering card renders

#### Scenario: Retry reloads
- **WHEN** the coffeeshop activates the retry action
- **THEN** the list loads again through its loading state into success, empty or error

#### Scenario: Paging
- **WHEN** the coffeeshop activates Previous or Next
- **THEN** the route's `page` query changes to the preceding or following page and the list shows that page

#### Scenario: Paging at the boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable, and when it shows the last page Next is unavailable

### Requirement: Offering selection
In the success state of the list, each offering card SHALL offer a Select control whose accessible name identifies that offering by its coffee name and its location name, and the selection toolbar SHALL offer a select-all checkbox labelled for the page and show the number of selected offerings. The select-all checkbox SHALL be unchecked when nothing is selected and checked when every card on the page is selected, and activating it on a partial selection SHALL select all offerings of the page. The bulk delete action SHALL be unavailable at zero selected. The selection SHALL cover the current page only and SHALL clear on a page change and after a successful delete.

#### Scenario: Select one offering
- **WHEN** the coffeeshop activates a card's Select control
- **THEN** that offering joins the selection and the count updates

#### Scenario: Select all on the page
- **WHEN** the coffeeshop activates the select-all checkbox with no or a partial selection
- **THEN** every offering of the current page becomes selected and the checkbox reads checked

#### Scenario: Select all with a full selection
- **WHEN** the coffeeshop activates the select-all checkbox with every offering of the page selected
- **THEN** the selection of the page clears

#### Scenario: Selected count
- **WHEN** the selection changes
- **THEN** the toolbar shows the number of selected offerings

#### Scenario: Bulk delete at zero selected
- **WHEN** no offering is selected
- **THEN** the bulk delete action is unavailable

#### Scenario: Selection cleared on a page change
- **WHEN** the list moves to another page
- **THEN** the selection empties and the count returns to zero

#### Scenario: Selection cleared after a delete
- **WHEN** a delete succeeds
- **THEN** the selection empties

### Requirement: Deleting offerings
Deleting one offering or the selected offerings SHALL ask for confirmation first and send nothing to the API before it: the single delete confirms one named offering and the bulk delete confirms the selected offerings, each with a text stating the deletion cannot be undone. While the request is pending the confirm action shows its busy state and the cancel action is unavailable. On success the confirmation closes, a status line announces the number of deleted offerings, the current page loads again, a bulk delete empties the selection, and keyboard focus moves to the page heading. When the reloaded page comes back empty and is not the first page, the list SHALL move to the previous page. On failure the confirmation stays open with an error text and the confirm action can be tried again. On a 403 the confirmation's error area SHALL show the step-up text and its "Confirm your identity" action inside the dialog's single alert region, carrying no alert role of their own, and after confirming identity the coffeeshop repeats the delete with the same confirmation still open.

#### Scenario: Confirmation required
- **WHEN** the coffeeshop activates a single delete or the bulk delete
- **THEN** the confirmation opens and no delete request is sent until the confirm action is activated; the cancel action closes it and sends nothing

#### Scenario: Single delete success
- **WHEN** the coffeeshop confirms a single delete and the API deletes the offering
- **THEN** the confirmation closes, the status line announces that one offering was deleted, the current page loads again, and keyboard focus moves to the page heading

#### Scenario: Bulk delete success
- **WHEN** the coffeeshop confirms a bulk delete and the API deletes the offerings
- **THEN** the confirmation closes, the status line announces the number of deleted offerings, the selection empties, and the current page loads again

#### Scenario: Delete failure keeps the confirmation open
- **WHEN** the delete request fails or returns a non-success status other than 403
- **THEN** the confirmation stays open with its error text, the entered state is kept and the confirm action can be tried again

#### Scenario: Step-up after 403
- **WHEN** the delete request returns 403
- **THEN** the confirmation's error area shows the step-up text and its "Confirm your identity" action inside the single alert region of the dialog, the confirmation stays open, and activating the action starts the identity check

#### Scenario: Last page emptied
- **WHEN** a successful delete empties a page that is not the first one
- **THEN** the list moves to the previous page

### Requirement: Creating offerings
The create route's form SHALL create one offering per chosen location for one chosen coffee-inventory item. The form SHALL render inside a section card (content-structure "Section card") with no header band, that fills the page container's width, its content at most 40rem wide and start-aligned from 768px. The inventory item is chosen in a search-as-you-type list over the API's coffee inventory filtered by the typed coffee name: while searching the list shows a searching row, the results replace the previous ones, an empty result shows a no-matches row and a failed search shows a failure row. Each result row SHALL show the coffee name and, on a second line, the roastery name, the coffee's country and its process joined in that order with empty parts skipped. Choosing a row sets the item, shows the coffee name in the input, and the field's help then shows that item's `roastLot` and `productionDate` joined in that order; clearing the input clears the choice and the typing hint returns. The locations group SHALL offer one checkbox per location of the coffeeshop by its name, covering loading, empty and error states, preselect the location when the coffeeshop has exactly one, and disable the submit action when the coffeeshop has none. On submit, an unchosen inventory item SHALL show an error under the field, mark the field invalid, move focus to it and send nothing; an empty location set is not checked in the browser and the request is sent. On success the status line announces the number of created offerings with a link to the list route, and the form resets. On failure or a 422 the form error shows and every chosen value is kept. On a 403 the form's error area shows the step-up text and its "Confirm your identity" action inside the form's single alert region, carrying no alert role of their own, and every chosen value is kept. A "Cancel" link after the submit action SHALL open the list route without sending any request.

#### Scenario: The form panel is a section card
- **WHEN** the create form renders, including while the session resolves
- **THEN** it sits in a section card with no header band — the card surface, a uniform 1px subtle border, no accent edge — that spans the page container's width at every breakpoint, and from 768px the form inside it is at most 40rem wide, aligned to the card's start

#### Scenario: One label names the inventory field
- **WHEN** the create form renders the inventory item field
- **THEN** the field shows one visible label with its required marker and one help line, and that label is the accessible name of the search input

#### Scenario: Searching the inventory
- **WHEN** the user types into the inventory item field
- **THEN** the list shows a searching row while the search runs and then the matching items, replacing the previous rows, and a search started later supersedes an older one

#### Scenario: Result rows
- **WHEN** the API returns matching inventory items
- **THEN** each row shows the coffee name and a second line joining the roastery name, the coffee's country and its process in that order, skipping any empty part

#### Scenario: No matches
- **WHEN** the search returns no inventory item
- **THEN** the list shows a no-matches row and no selectable row

#### Scenario: Search failure
- **WHEN** the search request fails or returns a non-success status
- **THEN** the list shows a failure row and no selectable row

#### Scenario: Choosing an item
- **WHEN** the user chooses a result row
- **THEN** the input shows the chosen item's coffee name and the field's help shows that item's `roastLot` and `productionDate` joined in that order

#### Scenario: Clearing the input
- **WHEN** the user clears the input after choosing an item
- **THEN** the choice is cleared and the typing hint returns as the field's help

#### Scenario: Locations loading, empty and error
- **WHEN** the locations load, come back empty, or cannot be loaded
- **THEN** a loading line, an empty message with the submit action unavailable, or an error line with a retry action renders in the group's place

#### Scenario: One location preselected
- **WHEN** the coffeeshop has exactly one location
- **THEN** its checkbox is preselected

#### Scenario: No locations disables submit
- **WHEN** the coffeeshop has no locations
- **THEN** the submit action is unavailable

#### Scenario: Submit without an inventory item
- **WHEN** the user submits with no inventory item chosen
- **THEN** an error shows under the field, the field is marked invalid, focus moves to it, and no create request is sent

#### Scenario: Empty location set reaches the API
- **WHEN** the user submits with an inventory item chosen and no location selected
- **THEN** the request is sent and, if the API rejects it, the generic form error shows

#### Scenario: Create success
- **WHEN** the API creates the offerings
- **THEN** the status line announces the number of created offerings with a link to the list route, and the inventory choice and the location checkboxes reset

#### Scenario: Create failure keeps values
- **WHEN** the create request fails, returns a non-success status other than 403, or returns a 422
- **THEN** the generic form error shows and every chosen value is kept

#### Scenario: Step-up after 403
- **WHEN** the create request returns 403
- **THEN** the form's error area shows the step-up text and its "Confirm your identity" action inside the form's single alert region, every chosen value is kept, and activating the action starts the identity check

#### Scenario: Cancel leaves for the list
- **WHEN** the create form renders and the user activates "Cancel"
- **THEN** the link after the submit action addresses the list route `/{locale}/manage/offerings` and no create request is sent

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

### Requirement: Localized management texts
Every text of both screens — headings, list and form states, actions, the confirmation texts, the status lines and the sidebar entry — SHALL render in the active locale (Spanish, English or Catalan) from the message catalog, and the offering card texts and the pagination labels SHALL come from the landing catalog. API values shown in the interface — coffee, roastery and location names, country, process, `roastLot`, `productionDate` and the counts — SHALL render exactly as returned, untranslated, and the API's own message strings SHALL never render. Numbers and names appended to a catalog word SHALL join it by concatenation.

#### Scenario: Texts follow the locale
- **WHEN** either management route opens in Spanish, English or Catalan
- **THEN** every text renders in that locale and none keeps another locale's wording

#### Scenario: API values untranslated
- **WHEN** a result row, the field's lot help or a card renders API values
- **THEN** the values render exactly as the API returned them

#### Scenario: API messages not shown
- **WHEN** any request succeeds or fails
- **THEN** no `message` string of an API response renders as interface text

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
Activating "Add location" SHALL reveal the location form: in the empty state in place of the empty card's content, otherwise in place of the action above the list. The form SHALL hold two labelled groups — Location (name, description) and Address and contact (address, postal code, city, country, phone, email, web, social) — the "Save" and "Cancel" actions, the geocoding help text and the OpenStreetMap attribution with its link to the OpenStreetMap copyright page. The form's card and the empty card SHALL fill the page container's width at every breakpoint; from 768px their content SHALL be at most 40rem wide, aligned to the card's start.

#### Scenario: Revealing the form
- **WHEN** the user activates "Add location"
- **THEN** the form renders with its "New location" heading in the action's place, and focus moves to the Name field

#### Scenario: Help and attribution
- **WHEN** the form renders
- **THEN** the geocoding help text and the attribution line render below the fields, and the attribution's "OpenStreetMap contributors" link opens the OpenStreetMap copyright page in the same tab

#### Scenario: Cancelling
- **WHEN** the user activates "Cancel"
- **THEN** the form closes, the typed values are discarded, nothing is sent, and focus returns to "Add location"

#### Scenario: Location cards fill the container
- **WHEN** the locations page shows the empty card or the location form on a viewport of 768px or wider
- **THEN** the card spans the page container's width and its content (texts, fields and actions) is at most 40rem wide, aligned to the card's start

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
A `422`, a `403`, a server error, a network failure or any other status answer to the create request SHALL show the generic form error above the actions, and the form SHALL stay open with every value kept. No step-up notice SHALL render on the locations page.

#### Scenario: The creation is rejected or fails
- **WHEN** the create request answers any status except `201`, or the request fails
- **THEN** the generic form error renders above the actions, every value is kept, no step-up notice renders, and the API's message is never rendered

#### Scenario: Step-up after 403
- **WHEN** the create request answers `403`
- **THEN** the generic form error renders above the actions, every value is kept, and no step-up notice or "Confirm identity" action renders

#### Scenario: Confirming identity
- **WHEN** the user activates "Save" again after a rejected creation
- **THEN** the create request is sent again with the current token and no write-scope sign in starts

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

### Requirement: Management panels kept as one view
The My offerings panel and the locations panel SHALL render their states — for My offerings: the header, the deleted status, the skeleton cards, the signed-out prompt, the list error with retry, the empty message, and the selection toolbar, cards and pagination with the delete confirmation; for locations: loading, the read error with "Try again", the empty card, the toolbar with "Add location", the form, the creation status and the location cards — with the same markup, texts, accessible names and focus moves, and the locations panel SHALL map the locations read status in the location management feature's request layer, never in the screen that shows it, however the panels are organised internally. This requirement adds no behaviour: every state keeps what the other requirements of this capability state.

#### Scenario: My offerings states render as before
- **WHEN** the My offerings panel renders for a given session, list response and delete outcome
- **THEN** it shows the same state, texts, accessible names and focused element as before the refactor, and sends the same requests

#### Scenario: Locations states render as before
- **WHEN** the locations panel renders for a given read response, form input and creation outcome
- **THEN** it shows the same state, texts, accessible names and focused element as before the refactor, and the API receives the same method, path, headers and body
