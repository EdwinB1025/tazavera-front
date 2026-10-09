## MODIFIED Requirements

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
