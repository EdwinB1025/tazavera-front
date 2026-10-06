# Spec Delta

## ADDED Requirements

### Requirement: Pagination
A paged list SHALL offer Previous and Next actions driven by its current and last page. Activating one SHALL open the preceding or following page at the list's own address, keeping every other query parameter of that address unchanged. Previous SHALL be unavailable on the first page, and Next on the last. The two actions SHALL sit centred below the list, 1rem apart, and wrap when the container is too narrow for both.

#### Scenario: Next and Previous
- **WHEN** the visitor activates Previous or Next on a page between the first and the last
- **THEN** the preceding or following page opens at the list's own address

#### Scenario: Other query parameters kept
- **WHEN** the list's address carries query parameters other than the page and the visitor activates Previous or Next
- **THEN** only the page changes and every other query parameter keeps its value

#### Scenario: Boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable and activating it opens nothing; and when the list shows the last page, Next is unavailable and activating it opens nothing

#### Scenario: Paging only with a successful list
- **WHEN** the list is loading, empty or failed
- **THEN** no paging action renders and the host's own loading, empty or error state renders instead; the paging actions render only below a successfully loaded, non-empty list
