## MODIFIED Requirements

### Requirement: Management sidebar entry

On the evaluation routes the management sidebar SHALL show the specialist area's entries: "My evaluations" pointing at `/{locale}/manage/evaluations` (marked as the current page when the list is in view) followed by "Explore offerings" pointing at `/{locale}/offerings` with no query, never marked as the current page.

#### Scenario: The entry on the list route

- **WHEN** the specialist opens the list route with the sidebar visible
- **THEN** the sidebar shows the "My evaluations" entry marked as the current page

#### Scenario: The entry on a form route

- **WHEN** the specialist opens a form route with the sidebar visible
- **THEN** the sidebar shows the "My evaluations" entry without the current-page marking

#### Scenario: The explore entry

- **WHEN** the specialist opens an evaluation route with the sidebar visible
- **THEN** the sidebar shows "Explore offerings" right after "My evaluations", in the same list, pointing at `/{locale}/offerings` with no query and without the current-page marking
