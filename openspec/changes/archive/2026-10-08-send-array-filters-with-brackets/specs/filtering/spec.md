# Spec Delta

## MODIFIED Requirements

### Requirement: Offering filter state in the URL

The URL query SHALL be the only state of the offering facets and sort, using the contract's key names. On load, each facet SHALL show the value of its key; an absent key SHALL show "Any", an empty field or the full 60–100 range. Each committed change SHALL navigate to the same path with the new query and without `page`, add one history entry, keep the focus on the control that changed and keep the scroll position. A value outside the facet limits (text longer than its limit, `verified` other than `0` or `1`, a score outside 60–100 or a minimum above the maximum, a sort pair that is not one of the sort options) SHALL be dropped before the list request, and its facet SHALL show its empty state. A `cataRef` value that is not a listed taste note SHALL be shown neither as checked nor as a chip; it is still sent, and a rejection by the API shows the catalog's error state. The list request SHALL send each chosen taste note as a `cataRef[]` pair, one per note in the URL's order, while the URL keeps the plain `cataRef` key. Pagination SHALL keep every other key.

#### Scenario: Facets reflect the URL
- **WHEN** a visitor opens `/{locale}/offerings?verified=1&process=washed&cuppingAvgMin=80`
- **THEN** Verification shows Verified, Process shows `washed`, Average score shows 80–100 and every other facet shows its empty state

#### Scenario: A change returns to page 1
- **WHEN** the visitor on `?process=washed&page=3` selects `natural` in Process
- **THEN** the URL becomes `?process=natural` without `page`, the focus stays on the Process option and the scroll position is kept

#### Scenario: Back restores the previous filters
- **WHEN** the visitor selects a process and then presses the browser's Back
- **THEN** the URL and the facets return to the state before that selection

#### Scenario: Out-of-range values dropped
- **WHEN** a visitor opens `?cuppingAvgMin=50&verified=yes`
- **THEN** the list is requested without `cuppingAvgMin` and `verified`, Average score shows 60–100 and Verification shows "Any"

#### Scenario: Full range removes the bounds
- **WHEN** the visitor sets the score range back to 60–100
- **THEN** neither `cuppingAvgMin` nor `cuppingAvgMax` is in the URL

#### Scenario: Taste notes sent as an array
- **WHEN** the visitor has chosen taste notes A and B, so the URL carries `?cataRef=A&cataRef=B`
- **THEN** the offerings request carries `cataRef[]=A&cataRef[]=B` (brackets percent-encoded) and the URL keeps `cataRef=A&cataRef=B`
