## MODIFIED Requirements

### Requirement: Pagination
A paged list SHALL offer a pagination navigation, named by its own label, with Previous, the page numbers and Next, in that order, driven by the list's current and last page. Activating Previous or Next SHALL open the preceding or following page at the list's own address, keeping every other query parameter unchanged. Previous SHALL be unavailable on the first page, and Next on the last. The navigation SHALL sit centred below the list and wrap when its container is too narrow.

#### Scenario: Next and Previous
- **WHEN** the visitor activates Previous or Next on a page between the first and the last
- **THEN** the preceding or following page opens at the list's own address

#### Scenario: Other query parameters kept
- **WHEN** the list's address carries query parameters other than the page and the visitor activates Previous, Next or a page number
- **THEN** only the page changes and every other query parameter keeps its value

#### Scenario: Boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable and activating it opens nothing; and when the list shows the last page, Next is unavailable and activating it opens nothing

#### Scenario: Paging only with a successful list
- **WHEN** the list is loading, empty or failed
- **THEN** no paging action renders and the host's own loading, empty or error state renders instead; the paging actions render only below a successfully loaded, non-empty list

#### Scenario: Navigation landmark
- **WHEN** the pagination renders
- **THEN** assistive technology announces it as a navigation landmark named by the pagination label, and the focus order is Previous, the page numbers in ascending order, then Next

#### Scenario: Spacing
- **WHEN** the pagination renders
- **THEN** its actions and page numbers sit 0.25rem apart below 768px and 0.5rem apart from 768px

## ADDED Requirements

### Requirement: Pagination page numbers
The pagination SHALL show page numbers between Previous and Next: the first and the last page always, and around the current page the current page alone below 768px, or the current page with one page on each side from 768px. A gap of exactly one page SHALL show that page; a gap of two or more SHALL show one non-interactive ellipsis. Activating a number SHALL open that page at the list's own address. Each number SHALL be named by the page label with its number.

#### Scenario: Window from 768px
- **WHEN** the viewport is 768px or wider and the last page is 20
- **THEN** the numbers read `1 2 … 20` on page 1, `1 2 3 4 5 … 20` on page 4, `1 … 9 10 11 … 20` on page 10 and `1 … 19 20` on page 20

#### Scenario: Window below 768px
- **WHEN** the viewport is narrower than 768px and the last page is 20
- **THEN** the numbers read `1 … 20` on page 1, `1 2 3 … 20` on page 3, `1 … 10 … 20` on page 10 and `1 … 20` on page 20

#### Scenario: Few pages
- **WHEN** the last page is 3 or fewer
- **THEN** every page number shows and no ellipsis renders; with a single page, the one number is the current page and Previous and Next are both unavailable

#### Scenario: Number opens its page
- **WHEN** the visitor activates a page number other than the current page
- **THEN** that page opens at the list's own address

#### Scenario: Current page
- **WHEN** the pagination renders
- **THEN** the current page's number is marked as the current page for assistive technology, shows a filled treatment distinct from the other numbers at rest, is never shown as unavailable, and activating it opens nothing

#### Scenario: Number naming
- **WHEN** assistive technology reads a page number
- **THEN** its name is the page label with the number (for example "Página 3"), containing the visible digits

#### Scenario: Ellipsis is not announced
- **WHEN** an ellipsis renders
- **THEN** it is not focusable, opens nothing and is hidden from assistive technology

#### Scenario: Fits a narrow viewport
- **WHEN** the viewport is 375px wide and a host shows the pagination with any current page of a list with up to 99 pages
- **THEN** the pagination fits its container without horizontal scrolling

### Requirement: Compact Previous and Next
Below 768px Previous and Next SHALL show only a left or right chevron in a 2.5rem square, keeping their labels as their accessible names; from 768px they SHALL show only their labels. Their treatment and their availability at the boundaries SHALL be the same at every width.

#### Scenario: Chevrons below 768px
- **WHEN** the viewport is narrower than 768px
- **THEN** Previous shows a left chevron and Next a right chevron, each in a 2.5rem square, with no visible label, and assistive technology names them by their labels

#### Scenario: Labels from 768px
- **WHEN** the viewport is 768px or wider
- **THEN** Previous and Next show their labels and no chevron
