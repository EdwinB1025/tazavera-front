## MODIFIED Requirements

### Requirement: Sidebar facets sub-section
On every list whose facets live in the sidebar (the offerings list, the coffee shop directory, a coffee shop's Offerings tab, the public evaluations list and the specialist's evaluations list), the facet panel SHALL sit in the sidebar sub-section (app-shell "Sidebar entry sub-section") of the list's entry: "Explore offerings" on the offerings list, "Explore coffee shops" on the coffee shop directory and "My evaluations" on the specialist's evaluations list; on a list with no entry in the sidebar, the sub-section SHALL stand alone. The sub-section's toggle SHALL carry the facet panel's title ("Filters") as its accessible name and SHALL be closed on arrival. Inside the sub-section the toggle SHALL be the panel's only visible title: the panel SHALL show no heading of its own, its search region SHALL take its name from the toggle, and the focus that "Applied-filter chips" sends to the panel title SHALL land on the toggle. The list toolbar's "Filters" trigger SHALL open it, together with the sidebar. Collapsing it SHALL neither change nor clear the applied filters: the URL, the results, the chips and the trigger's count stay as they are.

#### Scenario: Facets closed by default
- **WHEN** a visitor arrives on a list whose facets live in the sidebar
- **THEN** the sidebar shows the list's entry with a "Filters" toggle below it reporting collapsed, and the facet panel is not shown

#### Scenario: Facets open on their toggle
- **WHEN** the visitor activates the "Filters" toggle in the sidebar
- **THEN** the toggle reports expanded and the facet panel is shown below it

#### Scenario: Facets open from the toolbar
- **WHEN** the visitor activates the toolbar's "Filters" trigger while the sub-section is closed, on any viewport
- **THEN** the sidebar is open, the sub-section's toggle reports expanded and the facet panel is shown

#### Scenario: Filters keep applying while collapsed
- **WHEN** filter values are applied and the sub-section is collapsed
- **THEN** the URL keeps the values, the facets keep showing them on the next opening and the trigger keeps their count

#### Scenario: Title shown once in the sidebar
- **WHEN** a visitor opens the facets in the sidebar
- **THEN** "Filters" shows only as the sub-section's toggle, the panel shows no heading of its own, and the search region is still named "Filters"
