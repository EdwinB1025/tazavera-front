# offering-management Specification

## Purpose
The coffeeshop's management area: its own offerings as a list with selection and the deletion of one or several, and the creation of offerings from one coffee-inventory item across the coffeeshop's locations. It is what a signed-in coffeeshop meets on the management routes behind the user menu's "Manage offerings" entry.

## Requirements

### Requirement: Access to the management area
Both management routes — `/{locale}/manage/offerings` and `/{locale}/manage/offerings/new` — SHALL present their content only to a signed-in coffeeshop. While the session is being resolved the route shows its loading presentation and no gate message. An anonymous visitor SHALL see a signed-out message and a "Sign in" action in place of the form on the create route and in place of the list on the list route, and SHALL see no "New offering" button. A signed-in user whose role is not `coffeeshop` SHALL get the 404 page.

#### Scenario: Session loading
- **WHEN** a visitor opens either management route while the session is being resolved
- **THEN** the route shows its loading presentation — skeleton cards on the list route, the form panel with its controls unavailable on the create route — and neither the signed-out message nor the 404 page renders

#### Scenario: Anonymous visitor on the list route
- **WHEN** an anonymous visitor opens the list route
- **THEN** the page heading renders, the signed-out message and its "Sign in" action render in place of the list, and no "New offering" button renders

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
The list route SHALL show the offerings of the signed-in coffeeshop — the API's offering list filtered by the coffeeshop's user identifier — one offering card per offering of the current page, in a grid of one column below the large breakpoint (1024px), two columns from 1024px and three from the extra-large breakpoint (1536px), with the cards of one row sharing their height. Each card's footer SHALL hold the View action followed by the Delete action, each a button of the footer's group of actions with no other control between them, at the same height, so at 375px and at 1280px every button of the card lies inside the card, moving to a new line when the row has no room, and the page does not scroll sideways. The View action's accessible name SHALL start with its visible label and then name the offering by its coffee name and its location name, as the Select and Delete controls do, while its visible text stays the label alone. The requested page SHALL live in the route's query (`?page=n`) and Previous and Next pagination SHALL follow the API's current and last page. The list SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the coffeeshop's offerings load and the API returns offerings
- **THEN** one offering card renders per offering of the current page, the selection toolbar renders above the grid, and the pagination reflects the API's current and last page

#### Scenario: Grid beside the sidebar
- **WHEN** the list renders offering cards
- **THEN** the cards fill one column below 1024px, two from 1024px and three from 1536px, separated by a gap, and the cards of one row share the same height

#### Scenario: Card actions fit the card
- **WHEN** the list renders offering cards
- **THEN** each card's footer group of actions holds exactly the View button followed by the Delete button, both directly in the group, with no Select control in the footer, and both buttons at the same height

#### Scenario: Loading
- **WHEN** the list is loading its data
- **THEN** three skeleton cards render in the grid's place, the page heading renders, and no toolbar, empty message or error message renders

#### Scenario: Empty
- **WHEN** the coffeeshop has no offerings
- **THEN** a message and the "New offering" button render and no offering card renders

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

#### Scenario: New offering action
- **WHEN** the list route renders for a signed-in coffeeshop, in its header or in the empty state
- **THEN** "New offering" is a button in positional treatment 1, not a link, and activating it opens the create route

#### Scenario: View names the offering
- **WHEN** the list renders offering cards
- **THEN** each card's View button is named by its visible label followed by the offering's coffee name and location name, as its Delete button is, and its visible text is the label alone

### Requirement: Offering selection
In the success state of the list, each offering card SHALL offer a Select control whose accessible name identifies that offering by its coffee name and its location name, and the selection toolbar SHALL offer a select-all checkbox labelled for the page and show the number of selected offerings. The Select control SHALL sit in the card's top row, at the end of the row that holds the verification state badge, aligned to the row's right edge, and not in the card's footer. The select-all checkbox SHALL be unchecked when nothing is selected and checked when every card on the page is selected, and activating it on a partial selection SHALL select all offerings of the page. The bulk delete action SHALL be unavailable at zero selected. The selection SHALL cover the current page only and SHALL clear on a page change and after a successful delete.

#### Scenario: Select in the badge row
- **WHEN** the list renders offering cards
- **THEN** each card's Select control, named by its visible label followed by the coffee name and the location name, is the last item of the row that holds the card's verification state badge, that row spreads its items to both ends, and the Select control is not inside the card's footer

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
Deleting one offering or the selected offerings SHALL ask for confirmation first and send nothing to the API before it: the single delete confirms one named offering and the bulk delete confirms the selected offerings, each with a text stating the deletion cannot be undone. While the request is pending the confirm action shows its busy state and the cancel action is unavailable. On success the confirmation closes, a status line announces the number of deleted offerings, the current page loads again, a bulk delete empties the selection, and keyboard focus moves to the page heading. When the reloaded page comes back empty and is not the first page, the list SHALL move to the previous page. On failure, a 403 included, the confirmation stays open with an error text and the confirm action can be tried again. A delete SHALL be a plain write: no identity check runs before or after it.

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
- **WHEN** the delete request fails or returns a non-success status
- **THEN** the confirmation stays open with its error text, the entered state is kept and the confirm action can be tried again

#### Scenario: Step-up after 403
- **WHEN** the coffeeshop confirms a single or a bulk delete and the request returns 403
- **THEN** the delete request was sent directly with no identity check before it, the confirmation stays open with the same error text as any other failure, and no step-up text or "Confirm your identity" action renders

#### Scenario: Last page emptied
- **WHEN** a successful delete empties a page that is not the first one
- **THEN** the list moves to the previous page

### Requirement: Creating offerings
The create route's form SHALL create one offering per chosen location for one chosen coffee-inventory item. The form SHALL render inside a section card (content-structure "Section card") with no header band, that fills the page container's width, its content at most 40rem wide and start-aligned from 768px. The inventory item is chosen in a search-as-you-type list over the API's coffee inventory filtered by the typed coffee name: while searching the list shows a searching row, the results replace the previous ones, an empty result shows a no-matches row and a failed search shows a failure row. Each result row SHALL show the coffee name and, on a second line, the roastery name, the coffee's country and its process joined in that order with empty parts skipped. Choosing a row sets the item, shows the coffee name in the input, and the field's help then shows that item's `roastLot` and `productionDate` joined in that order; clearing the input clears the choice and the typing hint returns. The locations group SHALL offer one checkbox per location of the coffeeshop by its name, covering loading, empty and error states, preselect the location when the coffeeshop has exactly one, and disable the submit action when the coffeeshop has none. On submit, an unchosen inventory item SHALL show an error under the field, mark the field invalid, move focus to it and send nothing; an empty location set is not checked in the browser and the request is sent. On success the status line announces the number of created offerings with a link to the list route, and the form resets. On failure or a 403 the form error shows and every chosen value is kept. A 422 SHALL show the message for `coffeeInventoryId` under the inventory field as form-fields "Server validation errors" states, and the form error only when one of its keys names no field (the locations group carries no field error, so a message for `locations` shows the form error); every chosen value is kept. A create SHALL be a plain write: no identity check runs before or after it. A "Cancel" button after the submit action SHALL open the list route without sending any request.

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
- **WHEN** the create request fails, or returns a non-success status other than 422
- **THEN** the generic form error shows and every chosen value is kept

#### Scenario: The create names the inventory field
- **WHEN** the create request returns a 422 with a message for `coffeeInventoryId`
- **THEN** that message renders under the inventory field, which is marked invalid, no form error shows, every chosen value is kept, and the message clears when the user changes the inventory choice

#### Scenario: Step-up after 403
- **WHEN** the coffeeshop submits the create form and the request returns 403
- **THEN** the create request was sent directly with no identity check before it, the generic form error shows in the form's single alert region, every chosen value is kept, and no step-up text or "Confirm your identity" action renders

#### Scenario: Cancel leaves for the list
- **WHEN** the create form renders and the user activates "Cancel"
- **THEN** the button after the submit action navigates to the list route `/{locale}/manage/offerings` and no create request is sent

#### Scenario: Cancel is a button
- **WHEN** the create form renders
- **THEN** "Cancel" is a button, not a link, after the submit action, and activating it navigates to the list route

### Requirement: Management sidebar entry
The offerings list, offering creation, locations, inventory list and inventory detail routes SHALL show three sidebar entries in this order, each with an icon and a visible label: "Manage offerings", addressing the list route, "Manage locations", addressing `/{locale}/manage/locations`, and "Explore coffee inventory", addressing `/{locale}/manage/inventory`. "Manage offerings" SHALL be the current entry on the list and create routes, "Manage locations" on the locations route and "Explore coffee inventory" on the inventory list and detail routes. The create route has no entry; it stays reachable from the list's "New offering" link and its empty-state link.

#### Scenario: One entry
- **WHEN** a signed-in coffeeshop opens any coffee shop management route
- **THEN** the sidebar shows the "Manage offerings" entry, then the "Manage locations" entry, then the "Explore coffee inventory" entry, each with its icon and label, and no "My offerings" or "New offering" entry

#### Scenario: Current entry marked
- **WHEN** the list route or the create route is open
- **THEN** the "Manage offerings" entry is marked as the current page and the "Manage locations" and "Explore coffee inventory" entries are not

#### Scenario: Locations entry marked
- **WHEN** the locations route is open
- **THEN** the "Manage locations" entry is marked as the current page and the "Manage offerings" and "Explore coffee inventory" entries are not

#### Scenario: Entry navigates
- **WHEN** the coffeeshop activates the "Manage offerings" entry
- **THEN** the list route opens

#### Scenario: Locations entry navigates
- **WHEN** the coffeeshop activates the "Manage locations" entry
- **THEN** the locations route opens

#### Scenario: Inventory entry navigates
- **WHEN** the coffeeshop activates the "Explore coffee inventory" entry
- **THEN** the inventory list `/{locale}/manage/inventory` opens

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
A `422` answer to the create request SHALL show each field's first message under that field as form-fields "Server validation errors" states — `name` and `description` name the location fields, `contact.<key>` the contact fields, `contact.postal_code` the Postal code field — and the generic form error above the actions only when one of its keys names no field (`latitud` and `longitud` name none); the form SHALL stay open with every value kept. A `403`, a server error, a network failure or any other status answer SHALL show the generic form error above the actions, and the form SHALL stay open with every value kept. No step-up notice SHALL render on the locations page.

#### Scenario: The creation is rejected or fails
- **WHEN** the create request answers any status except `201` and `422`, or the request fails
- **THEN** the generic form error renders above the actions, every value is kept, no step-up notice renders, and the API's message is never rendered

#### Scenario: The creation names invalid fields
- **WHEN** the create request answers `422` with a message for `contact.city`
- **THEN** that message renders under the City field, which is marked invalid, every value is kept, no generic form error renders, and the message clears when the user edits the City field

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

### Requirement: Location form kept within the size limits
The forms of the `offering-management` capability in the pages, widgets, features and entities layers SHALL each keep every function at no more than 80 lines and a cyclomatic complexity of no more than 15, and every file at no more than 300 lines, while their props, public exports, requests, rendered markup, class names, texts and accessible names stay as the other requirements of this capability state. This requirement adds no behaviour.

#### Scenario: No size or complexity warning
- **WHEN** `npm run lint` runs
- **THEN** it reports no `max-lines-per-function`, `complexity` or `max-lines` warning for a file of this capability in the pages, widgets, features or entities layers

#### Scenario: Behaviour unchanged
- **WHEN** the validation suite and the QA suite run with no test added and no assertion changed
- **THEN** every test of this capability's units passes as before the split

### Requirement: Access to the coffee inventory pages
The inventory list `/{locale}/manage/inventory` and the inventory detail `/{locale}/manage/inventory/{ulid}` SHALL present their content only to a signed-in coffeeshop, through the protected content gate (app-shell "Protected content gate"). While the session is being resolved the page SHALL show its heading block and its loading presentation. An anonymous visitor SHALL see the heading block, the signed-out message and a "Sign in" action in place of the content, with no redirect. A signed-in user whose role is not `coffeeshop` SHALL get the 404 page, and no inventory request SHALL be sent before the session is a signed-in coffeeshop.

#### Scenario: Session loading
- **WHEN** a visitor opens the inventory list while the session is being resolved
- **THEN** the heading block and the loading presentation render, and neither the signed-out message, a card nor the 404 page renders

#### Scenario: Anonymous visitor
- **WHEN** an anonymous visitor opens the inventory list
- **THEN** the heading block, the signed-out message and its "Sign in" action render in place of the list, no inventory request is sent, and activating "Sign in" starts the sign-in flow for the inventory route

#### Scenario: Another role
- **WHEN** a signed-in user whose role is not `coffeeshop` opens the inventory list or an inventory detail
- **THEN** the 404 page renders and no inventory request is sent

### Requirement: Coffee inventory list
For a signed-in coffeeshop the inventory list SHALL read `GET /coffeeInventory` with the filters the address carries (see filtering "Inventory filter state in the URL") and show every returned item, in the order returned, as one inventory card per item in a grid of one column below 1024px, two columns from 1024px and three from 1536px, the cards of one row sharing their height. The contract has no pagination: the list SHALL show no pagination. The page SHALL show, above the results, the heading block (the "Management" eyebrow, the heading "Coffee inventory" and an intro line) and the list toolbar (filtering "Inventory filter toolbar"). The eyebrow SHALL use the management eyebrow style (`type-eyebrow-strong`: semibold, uppercase, in the label color), the same as My offerings and New offering. The list SHALL cover loading, empty, success and error states.

#### Scenario: Inventory list eyebrow
- **WHEN** the inventory list renders its heading block
- **THEN** the "Management" eyebrow renders in the management eyebrow style (`type-eyebrow-strong`), the same as the My offerings eyebrow

#### Scenario: Success
- **WHEN** the read answers `200` with inventory items
- **THEN** one inventory card renders per returned item, in the order returned, and no pagination renders

#### Scenario: Loading
- **WHEN** the read is pending
- **THEN** three skeleton cards render in the grid's place and no card, empty message or error message renders

#### Scenario: Empty
- **WHEN** no filter is applied and the read answers `200` with an empty `data`
- **THEN** the empty message "There is no coffee in the inventory." renders and no card renders

#### Scenario: Error and retry
- **WHEN** the read answers any non-2xx status or fails, and the coffeeshop then activates the retry action
- **THEN** the error message and a retry action render in the list's place, no card renders, and the retry sends the read again through the loading state

### Requirement: Coffee inventory card
Each inventory card SHALL show, from the item's fields only: the coffee name (`coffee.name`) as the card heading; the origin line joining `coffee.country` and `coffee.region` with " · ", skipping an empty part; and labelled values for process (`coffee.process`), variety (`coffee.variety`), roast level (`coffee.roastLevel`), altitude (`coffee.altitude`, followed by " m"), producer (`coffee.producer`, only when not null), certifications (the `code` of each item of `coffee.certifications` joined with ", ", only when there is at least one), roastery (`roastery.name`), roast lot (`roastLot`) and production date (`productionDate`). API values SHALL render exactly as returned, untranslated. The card's actions SHALL be, in this order, "View", an action button in positional treatment 3 that opens the item's detail `/{locale}/manage/inventory/{ulid}`, and "Create offering", an action button in positional treatment 1 that opens New offering with that item preselected (see "Creating an offering from an inventory item"). The accessible name of each of these two actions SHALL start with its visible label and then name the item's coffee (`coffee.name`), followed by its roastery (`roastery.name`) when the item has one, while its visible text stays the label alone.

#### Scenario: Card contents
- **WHEN** an inventory card renders for an item with a producer and one certification
- **THEN** it shows the coffee name, the country and region line, and the process, variety, roast level, altitude, producer, certification code, roastery name, roast lot and production date, each exactly as returned, with the altitude followed by " m"

#### Scenario: No producer and no certification
- **WHEN** an inventory card renders for an item whose `coffee.producer` is null and whose `coffee.certifications` is empty
- **THEN** no producer row and no certifications row render

#### Scenario: Card actions
- **WHEN** an inventory card renders
- **THEN** "View" is a button in positional treatment 3 that opens `/{locale}/manage/inventory/{ulid}`, and "Create offering" is a button in positional treatment 1 that opens `/{locale}/manage/offerings/new?inventory={ulid}`

#### Scenario: Card actions name the coffee
- **WHEN** the list renders an inventory card for an item with a roastery and one for an item without a roastery
- **THEN** each card's "View" and "Create offering" are named by their visible label followed by the item's coffee name and, for the item with a roastery, the roastery name, and the visible text of each is the label alone

### Requirement: Coffee inventory detail
The detail page `/{locale}/manage/inventory/{ulid}` SHALL read the same `GET /coffeeInventory`, with no filter, and show the returned item whose `ulid` is the route's: its header shows, in this order, a back link to the previous page whose fallback destination is `/{locale}/manage/inventory` (base-controls "Back link to the previous page"), the "Coffee inventory" eyebrow in the management eyebrow style (`type-eyebrow-strong`: semibold, uppercase, in the label color, the same as My offerings and New offering), the coffee name as the page heading and "Create offering" as an action button in positional treatment 1 with the card's destination; below the header, a section card lists every field of the item as labelled values — the card's fields plus the coffee's lot (`coffee.lot`), each certification's `code` with its `description`, and the roastery's `description` when present. While the read is pending the page SHALL show the loading status below the back link; when it fails, the error message and a retry action. When no returned item has the route's `ulid`, the page SHALL show, in place of the header and the fields, the title "Inventory item not found" as the page heading, the line "It may have been removed, or the link may be wrong." below it and a back button in positional treatment 3 with the back text, addressing `/{locale}/manage/inventory`, with no retry action.

#### Scenario: Detail of an item
- **WHEN** the read answers `200` and an item has the route's `ulid`
- **THEN** the back link renders first, then the eyebrow, the coffee name as the page heading and the "Create offering" button, and the section card shows every field of the item, including the coffee's lot, each certification's code and description and the roastery's description, exactly as returned

#### Scenario: Inventory detail eyebrow
- **WHEN** the read answers `200` and an item has the route's `ulid`
- **THEN** the "Coffee inventory" eyebrow renders in the management eyebrow style (`type-eyebrow-strong`), the same as the My offerings eyebrow

#### Scenario: Detail loading
- **WHEN** the read is pending
- **THEN** the back link and the loading status render, and no heading of the item renders

#### Scenario: Detail error and retry
- **WHEN** the read answers any non-2xx status or fails, and the coffeeshop then activates the retry action
- **THEN** the error message and a retry action render, and the retry sends the read again

#### Scenario: Unknown item
- **WHEN** the read answers `200` and no item has the route's `ulid`
- **THEN** the heading "Inventory item not found", the line "It may have been removed, or the link may be wrong." and a back button to `/{locale}/manage/inventory` render, with no retry action and no back link

### Requirement: Creating an offering from an inventory item
New offering opened with the query `inventory={ulid}` SHALL read `GET /coffeeInventory` with no filter and, when an item has that `ulid`, choose it in the inventory field as if the user had chosen its result row: the input shows its coffee name and the field's help shows its `roastLot` and `productionDate`, so the coffee shop only picks the locations. A choice the user makes before the read answers SHALL be kept. When the query is absent, no item has that `ulid`, or the read fails, New offering SHALL behave as it does without the query: the field stays empty and its typing hint shows, with no error. Every other behaviour of "Creating offerings" stays as stated, the reset after a successful create included.

#### Scenario: Preselected item
- **WHEN** New offering opens with `inventory={ulid}` and the read returns an item with that `ulid`
- **THEN** the inventory input shows the item's coffee name, the field's help shows its `roastLot` and `productionDate`, and submitting sends that item's `ulid` as `coffeeInventoryId`

#### Scenario: Unknown preselected item
- **WHEN** New offering opens with `inventory={ulid}` and no returned item has that `ulid`
- **THEN** the inventory input is empty, the typing hint shows as the field's help, and no error renders

### Requirement: Coffee inventory sidebar
On the inventory list and the inventory detail, the sidebar SHALL show the coffee shop's management entries "Manage offerings" and "Manage locations", neither marked as the current page, followed by the entry "Explore coffee inventory", addressing `/{locale}/manage/inventory` and marked as the current page, each with its icon and visible label. On the list, that entry SHALL hold the inventory facets in its sub-section (filtering "Inventory facets in the sidebar"); on the detail it SHALL hold none.

#### Scenario: Entries on the inventory list
- **WHEN** a signed-in coffeeshop opens the inventory list
- **THEN** the sidebar shows "Manage offerings", "Manage locations" and "Explore coffee inventory" in this order, each with its icon, only the last marked as the current page, with the "Filters" toggle below it

#### Scenario: Entries on the inventory detail
- **WHEN** a signed-in coffeeshop opens an inventory item's detail
- **THEN** the sidebar shows the same three entries in this order, each with its icon, only "Explore coffee inventory" marked as the current page, and no "Filters" toggle
