## ADDED Requirements

### Requirement: Editing lists remember their filters and order for the tab

My evaluations and Coffee inventory SHALL keep, for the browser tab, the filters and order the user last applied. The kept values SHALL change only when the user applies new filters or another order, removes a chip or uses "Clear all"; clearing SHALL keep the empty state, except that on My evaluations the order that "Clear all" keeps SHALL stay kept. Opening one of those lists in the same tab, from the menu, the sidebar or a link, with no filter or order key in its address SHALL apply the kept values: the address SHALL then show them as when the user applies them by hand, the list SHALL start at page 1, its facets and toolbar SHALL show them, the list SHALL send exactly the request it sends for that address, and no history entry SHALL be added beyond the opening itself. An address that carries a filter or an order SHALL be shown as it is and SHALL not change the kept values. The page number SHALL never be kept. A list with nothing kept SHALL behave as before; My offerings has no filters or order and SHALL keep nothing. Only filter and order values SHALL be kept, never a token or personal data. When the browser storage cannot be read or written, the lists SHALL behave as before, with no error shown. The public lists SHALL keep nothing.

#### Scenario: Restored on a new opening

- **WHEN** a specialist applied `process=washed` and the order by score from highest to lowest on My evaluations, moved to page 2, left the list and opens it again in the same tab from the menu
- **THEN** the address becomes `/{locale}/manage/evaluations?process=washed&orderBy=cupping_score&orderDirection=desc` without `page`, replacing the opened entry, and the list is requested once, with those filters and order and page 1

#### Scenario: Cleared filters are stored

- **WHEN** the specialist on `?process=washed&orderBy=cupping_score&orderDirection=desc` uses "Clear all", leaves the list and opens it again in the same tab
- **THEN** the list opens on `?orderBy=cupping_score&orderDirection=desc`, with no filter applied

#### Scenario: Nothing stored

- **WHEN** a coffee shop opens Coffee inventory in a tab where no inventory filter was applied
- **THEN** the address stays without a query and the inventory is read with no filter, as before

#### Scenario: Browser storage unavailable

- **WHEN** the browser refuses to read or write its storage and the user applies a filter or opens an editing list
- **THEN** the filter is applied and the list opens as before, with no error shown

### Requirement: Remembered filters forgotten with the session

The filters and order kept by the editing lists SHALL be forgotten when the session becomes anonymous, whether the user signs out (from the user menu or after deleting the account) or the session ends, and when a different user becomes signed in in the same tab. Closing the tab SHALL forget them as well.

#### Scenario: Forgotten on sign out

- **WHEN** a user with kept filters on My evaluations signs out, signs in again in the same tab and opens My evaluations
- **THEN** the list opens with no filters and the default order

#### Scenario: Forgotten when another user signs in

- **WHEN** the signed-in user of the tab changes to a different user
- **THEN** the filters and order kept for the previous user are forgotten
