# Spec Delta

## ADDED Requirements

### Requirement: View evaluations link on the offering detail
The offering detail SHALL show a "View evaluations" link in the header's actions row, beside the specialist's Evaluate link and always, whatever the offering's evaluation count and whatever the visitor's session. Activating it SHALL open the public evaluations list of the `evaluations` capability at `/{locale}/evaluations?offeringId={ulid}`, so the list loads with the Offering facet selected and its chip applied. The link's accessible name SHALL be unique on the page.

#### Scenario: Opening the evaluations of an offering
- **WHEN** a visitor activates "View evaluations"
- **THEN** the public evaluations list opens with `offeringId` in the URL, the Offering facet showing the offering selected and the chip "Offering: {coffee name}" applied

#### Scenario: An offering without evaluations
- **WHEN** the visitor activates "View evaluations" on an offering with no evaluations and the list returns an empty page
- **THEN** the list shows its no-matches message with the "Clear all" control, and the Offering facet keeps the offering selected

#### Scenario: The link is always shown
- **WHEN** the offering detail renders for any visitor, signed in or not, with zero or more evaluations
- **THEN** the "View evaluations" link renders in the header's actions row before the Evaluate link

### Requirement: Provisional evaluation tab on the offering detail
The offering detail SHALL show a third tab labelled "Provisional evaluation" after "Inventory data" and "Consensus", reachable at `?tab=provisional`, whose panel shows the coffee shop's `baseline` evaluation of that offering read-only in the same read-only evaluation presentation as the evaluation view of the `evaluations` capability. When several baselines exist the newest SHALL be shown. The tab SHALL follow the same activation contract as the other tabs (manual activation, active tab in the URL, an absent or unknown `tab` value opening the Inventory data tab), and its loading, empty and error states SHALL stay inside the panel, leaving the header and the other tabs unaffected.

#### Scenario: Selecting the tab
- **WHEN** the visitor selects "Provisional evaluation"
- **THEN** the URL gains `tab=provisional`, the tab becomes selected with the same treatment as the other two, and the panel loads the offering's baseline evaluation

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
