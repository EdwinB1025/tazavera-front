## MODIFIED Requirements

### Requirement: Header brand and primary navigation
The header SHALL show the brand logotype, linking to the root of the active locale. The brand logotype and the primary navigation SHALL sit in one group on the left, and the language selector and the session control SHALL sit in one group on the right, on every viewport. On medium and larger viewports it SHALL also show the "Top rated", "Explore coffee shops" and "About us" entries, in that order; on small viewports those entries SHALL NOT be shown in the header and a navigation menu control, showing a three-lines menu icon and named from the active locale's catalog, SHALL take their place, opening a menu that lists the same entries, in the same order and with the same destinations, presented like the entries of the user menu, the entry of the current route marked as the current page. The primary navigation entries SHALL be presented as navigation items of the header, not as inline text links, and the entry of the current route SHALL be marked as the current page.

#### Scenario: Brand link
- **WHEN** the user activates the brand logotype in the header
- **THEN** the application opens the root of the active locale

#### Scenario: Primary navigation on a medium or larger viewport
- **WHEN** the header renders on a medium or larger viewport
- **THEN** it shows "Top rated", pointing at the verified offerings ordered by cupping average descending, "Explore coffee shops", pointing at the coffee shop directory, and "About us", pointing at the About us page, in that order

#### Scenario: Primary navigation on a small viewport
- **WHEN** the header renders on a small viewport
- **THEN** the "Top rated", "Explore coffee shops" and "About us" entries are not shown in the header while the brand logotype, the navigation menu control, the language selector and the session control stay visible

#### Scenario: Navigation menu on a small viewport
- **WHEN** the user activates the navigation menu control on a small viewport
- **THEN** a menu opens listing "Top rated", "Explore coffee shops" and "About us", in that order and with the destinations of the primary navigation, each entry presented like an entry of the user menu, and activating one opens its destination

#### Scenario: Navigation menu control
- **WHEN** the header renders
- **THEN** the navigation menu control shows a three-lines icon with no visible text, carries the catalog's accessible name in the active locale and the shared visible focus ring, and is not shown on medium and larger viewports

#### Scenario: Header grouping on every viewport
- **WHEN** the header renders on any viewport
- **THEN** the brand logotype and the primary navigation form one group on the left, the language selector and the session control form one group on the right after it, and no viewport changes that grouping

#### Scenario: Navigation entries are navigation items
- **WHEN** the primary navigation renders on a medium or larger viewport
- **THEN** each entry fills the header's height with its label centred in the navigation item typography, shows no underline in any state, and the navigation sits visibly apart from the brand logotype

#### Scenario: Navigation entry hover
- **WHEN** the pointer rests on an entry that is not the current page
- **THEN** the entry takes the navigation hover fill and the navigation hover text colour

#### Scenario: Navigation entry keyboard focus
- **WHEN** an entry receives keyboard focus
- **THEN** it shows the shared visible focus ring

#### Scenario: Current page entry
- **WHEN** the current route's path equals an entry's path, ignoring the query
- **THEN** that entry carries `aria-current="page"` and a bottom bar in the navigation indicator colour, takes no hover fill, and no other entry is marked
