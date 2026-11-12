## ADDED Requirements

### Requirement: First location step
The application SHALL offer the first location step at `/{locale}/manage/locations/first`, the page a coffee shop opens right after its registration signs it in. The step SHALL show a heading block — the heading "Add your first location" and an introduction saying the account is created and asking where the coffee shop is so it appears in the directory — and focus SHALL move to the heading when the step opens. Every text of the step SHALL render in the active locale from the message catalog.

#### Scenario: The step opens for a coffee shop
- **WHEN** a signed-in coffeeshop opens the first location step
- **THEN** the "Add your first location" heading and its introduction render above the location form with its "New location" heading, its "Save" and "Later" actions, focus is on the page heading, and no locations read is sent

### Requirement: First location step session gate
The first location step SHALL present its form only to a signed-in coffeeshop. While the session is being resolved the step SHALL show its heading block and the loading status. An anonymous visitor SHALL see the heading block, the signed-out message and a "Sign in" action in place of the form, with no automatic redirect. A signed-in user whose role is not `coffeeshop` SHALL get the 404 page.

#### Scenario: Step session loading
- **WHEN** a visitor opens the first location step while the session is being resolved
- **THEN** the heading block and the loading status render, and neither the signed-out message, the form nor the 404 page renders

#### Scenario: Anonymous visitor on the step
- **WHEN** an anonymous visitor opens the first location step
- **THEN** the heading block, the signed-out message and its "Sign in" action render in place of the form, and the page does not redirect

#### Scenario: Signing in from the step
- **WHEN** the anonymous visitor activates "Sign in" on the first location step
- **THEN** the sign-in flow starts within that activation for the first location step's route and the visitor stays on the page

#### Scenario: Another role on the step
- **WHEN** a signed-in user whose role is not `coffeeshop` opens the first location step
- **THEN** the 404 page renders and no location request is sent

### Requirement: First location step form
For a signed-in coffeeshop the step SHALL show the location form as "Location form" states it, with "Later" in place of "Cancel", whatever locations the coffee shop already has and without reading them. Its checks, lookup, create request and failures SHALL be those of "Location form checks", "Address geocoding", "Location creation" and "Location creation failures". A `201` SHALL open `/{locale}/manage/locations` through client-side navigation. "Later" SHALL open `/{locale}` and send nothing.

#### Scenario: First location created
- **WHEN** the step's create request answers `201`
- **THEN** `/{locale}/manage/locations` opens through client-side navigation, and no creation status renders on the step

#### Scenario: Leaving the step for later
- **WHEN** the user activates "Later" on the first location step
- **THEN** `/{locale}` opens through client-side navigation and nothing is sent
