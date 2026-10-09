## MODIFIED Requirements

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
The create route's form SHALL create one offering per chosen location for one chosen coffee-inventory item. The form SHALL render inside a section card (content-structure "Section card") with no header band, that fills the page container's width, its content at most 40rem wide and start-aligned from 768px. The inventory item is chosen in a search-as-you-type list over the API's coffee inventory filtered by the typed coffee name: while searching the list shows a searching row, the results replace the previous ones, an empty result shows a no-matches row and a failed search shows a failure row. Each result row SHALL show the coffee name and, on a second line, the roastery name, the coffee's country and its process joined in that order with empty parts skipped. Choosing a row sets the item, shows the coffee name in the input, and the field's help then shows that item's `roastLot` and `productionDate` joined in that order; clearing the input clears the choice and the typing hint returns. The locations group SHALL offer one checkbox per location of the coffeeshop by its name, covering loading, empty and error states, preselect the location when the coffeeshop has exactly one, and disable the submit action when the coffeeshop has none. On submit, an unchosen inventory item SHALL show an error under the field, mark the field invalid, move focus to it and send nothing; an empty location set is not checked in the browser and the request is sent. On success the status line announces the number of created offerings with a link to the list route, and the form resets. On failure, a 422 or a 403 the form error shows and every chosen value is kept. A create SHALL be a plain write: no identity check runs before or after it. A "Cancel" button after the submit action SHALL open the list route without sending any request.

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
- **WHEN** the create request fails, returns a non-success status, or returns a 422
- **THEN** the generic form error shows and every chosen value is kept

#### Scenario: Step-up after 403
- **WHEN** the coffeeshop submits the create form and the request returns 403
- **THEN** the create request was sent directly with no identity check before it, the generic form error shows in the form's single alert region, every chosen value is kept, and no step-up text or "Confirm your identity" action renders

#### Scenario: Cancel leaves for the list
- **WHEN** the create form renders and the user activates "Cancel"
- **THEN** the button after the submit action navigates to the list route `/{locale}/manage/offerings` and no create request is sent

#### Scenario: Cancel is a button
- **WHEN** the create form renders
- **THEN** "Cancel" is a button, not a link, after the submit action, and activating it navigates to the list route
