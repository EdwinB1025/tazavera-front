# Spec Delta

## Purpose

The coffeeshop's management area: its own offerings as a list with selection and the deletion of one or several, and the creation of offerings from one coffee-inventory item across the coffeeshop's locations. It is what a signed-in coffeeshop meets on the management routes behind the user menu's "Manage offerings" entry.

## ADDED Requirements

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
The create route's form SHALL create one offering per chosen location for one chosen coffee-inventory item. The inventory item is chosen in a search-as-you-type list over the API's coffee inventory filtered by the typed coffee name: while searching the list shows a searching row, the results replace the previous ones, an empty result shows a no-matches row and a failed search shows a failure row. Each result row SHALL show the coffee name and, on a second line, the roastery name, the coffee's country and its process joined in that order with empty parts skipped. Choosing a row sets the item, shows the coffee name in the input, and the field's help then shows that item's `roastLot` and `productionDate` joined in that order; clearing the input clears the choice and the typing hint returns. The locations group SHALL offer one checkbox per location of the coffeeshop by its name, covering loading, empty and error states, preselect the location when the coffeeshop has exactly one, and disable the submit action when the coffeeshop has none. On submit, an unchosen inventory item SHALL show an error under the field, mark the field invalid, move focus to it and send nothing; an empty location set is not checked in the browser and the request is sent. On success the status line announces the number of created offerings with a link to the list route, and the form resets. On failure or a 422 the form error shows and every chosen value is kept. On a 403 the form's error area shows the step-up text and its "Confirm your identity" action inside the form's single alert region, carrying no alert role of their own, and every chosen value is kept.

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

### Requirement: Management sidebar entry
Both management routes SHALL show one entry in the shell's sidebar, "Manage offerings", with an icon and a visible label, addressing the list route, and it SHALL be marked as the current entry on both the list route and the create route. Activating it opens the list route. The create route has no sidebar entry; it stays reachable from the list's "New offering" link and its empty-state link.

#### Scenario: One entry
- **WHEN** a signed-in coffeeshop opens either management route
- **THEN** the sidebar shows the "Manage offerings" entry with its icon and label, and no "My offerings" or "New offering" entry

#### Scenario: Current entry marked
- **WHEN** the list route or the create route is open
- **THEN** the "Manage offerings" entry is marked as the current page

#### Scenario: Entry navigates
- **WHEN** the coffeeshop activates the entry
- **THEN** the list route opens

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
