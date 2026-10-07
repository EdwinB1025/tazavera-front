## MODIFIED Requirements

### Requirement: Verified offerings list
The entry page SHALL list the verified offerings of the API, 6 per page at every width, one offering card per offering, in a grid of one column below the medium breakpoint (768px), two from 768px and three from the extra-large breakpoint (1280px), with the numbered pagination driven by the API's current and last page, and SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the verified offerings load and the API returns offerings
- **THEN** one offering card renders per offering of the current page and the pagination reflects the API's current and last page

#### Scenario: Page size
- **WHEN** the list requests a page of verified offerings
- **THEN** it asks the API for 6 offerings per page, at every viewport width, so a full page fills 6, 3 or 2 complete rows at one, two or three columns

#### Scenario: Grid by viewport
- **WHEN** the list renders offering cards
- **THEN** the cards fill one column below 768px, two from 768px and three from 1280px, separated by a gap, and the cards of one row share the same height

#### Scenario: Loading
- **WHEN** the list is loading its data
- **THEN** skeleton cards render in the list's place and no empty or error message renders

#### Scenario: Empty
- **WHEN** the API holds no verified offerings
- **THEN** a centered message renders and no offering card renders

#### Scenario: Error and retry
- **WHEN** the offerings data cannot be loaded, whether the request fails or returns a non-success status
- **THEN** a message with a retry action renders and no offering card renders

#### Scenario: Retry reloads
- **WHEN** the visitor activates the retry action
- **THEN** the list loads again through its loading state into success, empty or error

#### Scenario: Paging
- **WHEN** the visitor activates Next, Previous or a page number
- **THEN** the list requests that page, 6 offerings per page, and updates its cards and pagination state

#### Scenario: Paging at the boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable, and when it shows the last page Next is unavailable
