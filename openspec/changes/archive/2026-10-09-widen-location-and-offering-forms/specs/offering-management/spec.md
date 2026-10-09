## MODIFIED Requirements

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
