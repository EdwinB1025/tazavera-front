## ADDED Requirements

### Requirement: Facet comboboxes loaded on first opening
On a list whose facets live in the sidebar sub-section ("Sidebar facets sub-section"), the client code of the facet comboboxes, and of the libraries only they use (the command-menu library and the popover behind it), SHALL load the first time the sub-section opens on that route, by its toggle or by the toolbar's "Filters" trigger, and not with the route. While that first load is pending, the place of each combobox in the panel SHALL show the loading status (feedback "Request status messages") with the text "Loading…" (es "Cargando…", ca "Carregant…"), and every other facet SHALL be shown in its place. Once loaded, the facets, their order and their behaviour SHALL be those of the list's facet requirements, on every viewport.

#### Scenario: First opening while the comboboxes load
- **WHEN** a visitor opens the facets sub-section of the offerings list for the first time and the combobox code has not finished loading
- **THEN** the combobox code starts loading only at that opening, and the places of Coffee, Producer and Roastery each show the loading status "Loading…" while the other facets are shown

#### Scenario: Facets after loading
- **WHEN** the combobox code has loaded after the first opening
- **THEN** the loading statuses are gone and the Coffee, Producer and Roastery comboboxes are shown in their places of the facet order
