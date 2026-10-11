## MODIFIED Requirements

### Requirement: My offerings list
The list route SHALL show the offerings of the signed-in coffeeshop — the API's offering list filtered by the coffeeshop's user identifier — one offering card per offering of the current page, in a grid of one column below the large breakpoint (1024px), two columns from 1024px and three from the extra-large breakpoint (1536px), with the cards of one row sharing their height. Each card's footer SHALL hold the View action followed by the Delete action, each a button of the footer's group of actions with no other control between them, at the same height, so at 375px and at 1280px every button of the card lies inside the card, moving to a new line when the row has no room, and the page does not scroll sideways. The requested page SHALL live in the route's query (`?page=n`) and Previous and Next pagination SHALL follow the API's current and last page. The list SHALL cover loading, empty, success and error states.

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
