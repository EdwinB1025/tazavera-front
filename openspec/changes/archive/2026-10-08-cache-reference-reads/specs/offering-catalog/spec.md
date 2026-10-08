## ADDED Requirements

### Requirement: Reference data cached with a one-hour refresh
The taxonomy read and the coffee catalog read SHALL be served from a server-side cache that is refreshed at most one hour after it was filled, so repeated renders within the hour send no new request for them. Their method, path, query string and results SHALL stay the same, and every other public read SHALL stay uncached.

#### Scenario: Repeated renders within the hour
- **WHEN** pages that read the taxonomies or the coffee catalog are rendered several times within one hour of the cached read
- **THEN** the API receives no new request for that reference read and the pages show the same data

#### Scenario: Refresh after the hour
- **WHEN** a page reads the taxonomies or the coffee catalog more than one hour after the cached read
- **THEN** the reference read is sent to the API again with the same method and URL, and the refreshed data replaces the cached one

## MODIFIED Requirements

### Requirement: Public reads through the shared public request client
Every public read of the front (the coffees, roasteries, evaluations, taxonomies and offerings reads) SHALL be sent through the shared public request client, the one place that builds the API URL from the configured base. The requests sent to the API SHALL stay the same: method, path, query string, headers and request options, except the server cache option of the taxonomy and coffee catalog reads.

#### Scenario: Public read sent through the shared client
- **WHEN** a public read of the front is sent
- **THEN** it goes through the shared public request client and no other module builds its URL from the configured API base

#### Scenario: Requests unchanged
- **WHEN** a public read is sent with the API base configured
- **THEN** the API receives the same method, URL, query string, headers and request options as before the refactor, apart from the reference reads' server cache option, and the read returns the same result

### Requirement: Provisional evaluation tab on the offering detail
The offering detail SHALL show a third tab labelled "Provisional evaluation" after "Inventory data" and "Consensus", reachable at `?tab=provisional`, whose panel shows the coffee shop's `baseline` evaluation of that offering read-only in the same read-only evaluation presentation as the evaluation view of the `evaluations` capability. When several baselines exist the newest SHALL be shown. The tab SHALL follow the same activation contract as the other tabs (manual activation, active tab in the URL, an absent or unknown `tab` value opening the Inventory data tab), and its loading, empty and error states SHALL stay inside the panel, leaving the header and the other tabs unaffected. The panel's data SHALL be requested only when the Provisional evaluation tab is the one shown.

#### Scenario: Selecting the tab
- **WHEN** the visitor selects "Provisional evaluation"
- **THEN** the URL gains `tab=provisional`, the tab becomes selected with the same treatment as the other two, and the panel loads the offering's baseline evaluation

#### Scenario: Another tab shown
- **WHEN** the detail is shown on the Inventory data or Consensus tab
- **THEN** no request for the baseline evaluation is sent

#### Scenario: Showing the baseline evaluation
- **WHEN** the panel's request returns 200 with at least one baseline evaluation
- **THEN** the presentation shows the newest one's results read-only, its summary, scales, descriptors, notes and extrinsic attributes following the read-only evaluation presentation of the `evaluations` capability

#### Scenario: An offering without a baseline evaluation
- **WHEN** the panel's request returns 200 with an empty `data`
- **THEN** the panel shows the provisional-empty message centred with no box

#### Scenario: The baseline cannot be loaded
- **WHEN** the panel's request fails with any non-2xx status or a transport failure
- **THEN** the panel shows the provisional-error message with a Retry control, and the header and the other tabs keep working unaffected

#### Scenario: Loading the panel
- **WHEN** the panel is being loaded
- **THEN** two placeholder cards render inside the panel only

#### Scenario: An unknown tab value in the URL
- **WHEN** the detail is opened with a `tab` value that is not one of the three tabs
- **THEN** the Inventory data tab is selected as when the value is absent
