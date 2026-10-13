## MODIFIED Requirements

### Requirement: Inventory facets in the sidebar
On the inventory list `/{locale}/manage/inventory` the sidebar SHALL hold the facet panel titled "Filters" in the sub-section of the "Explore coffee inventory" entry, with the behaviour of "Sidebar facets sub-section", holding in this order: Coffee name, a combobox that searches coffees while typing (at most 150 characters), with the options of the Coffee combobox of "Offering facet options", the searching, no-match, error and placeholder texts of the offering Coffee combobox, and the loading behaviour of "Facet comboboxes loaded on first opening"; choosing an option SHALL write its name to `coffeeName` and clearing the combobox SHALL remove the key; then Country, Region and Process, single-choice facets with "Any" first and "see more", listing the distinct non-empty `country`, `region` and `process` values of the coffee catalog, sorted, as in "Offering facet options"; choosing a value SHALL write its key (`originCountry`, `originRegion`, `process`) and choosing "Any" SHALL remove it; with a country chosen Region SHALL list only that country's regions, and with no country every region; choosing a different country SHALL remove a chosen region that is not one of the new country's regions and keep one that is, and choosing "Any" in Country SHALL keep the region; then Producer, a text facet (150), and Roastery city, a text facet (90) writing `city`. Each facet SHALL show the value the address carries. When the coffee catalog cannot be loaded, Country, Region and Process SHALL render disabled with the help text "Options unavailable" and every other facet SHALL keep working. The panel SHALL hold no other facet.

#### Scenario: Facets in order
- **WHEN** the inventory list renders its sidebar with the address `?coffeeName=geisha&city=Barcelona`
- **THEN** the panel shows Coffee name, Country, Region, Process, Producer and Roastery city in that order, Coffee name showing "geisha" and Roastery city showing "Barcelona"

#### Scenario: Choosing a coffee name
- **WHEN** the coffeeshop types "hui" in Coffee name and chooses "Huila El Mirador" while `originCountry=Colombia` is applied
- **THEN** the address carries `coffeeName=Huila El Mirador` and keeps `originCountry=Colombia`

#### Scenario: Choosing a country
- **WHEN** the coffeeshop chooses "Colombia" in Country while `process=washed` is applied
- **THEN** the address carries `originCountry=Colombia` and keeps `process=washed`

#### Scenario: Regions narrowed by the country
- **WHEN** the address carries `originCountry=Colombia&originRegion=Huila` and the coffeeshop chooses "Ethiopia" in Country
- **THEN** before the choice Region lists only Colombia's regions
- **AND** after it the address carries `originCountry=Ethiopia` and no `originRegion`

#### Scenario: Choosing a process
- **WHEN** the coffeeshop chooses "washed" in Process while other filters are applied
- **THEN** the address carries `process=washed` and keeps the other filters

#### Scenario: Roastery city label
- **WHEN** the inventory list renders its sidebar
- **THEN** the City facet is named "Roastery city" (es "Ciudad del tostador", ca "Ciutat del torrador")
- **AND** typing "Barcelona" in it and pressing Enter puts `city=Barcelona` in the address

#### Scenario: Coffee catalog fails
- **WHEN** the coffee catalog cannot be loaded
- **THEN** Country, Region and Process are disabled with "Options unavailable"
- **AND** Coffee name, Producer and Roastery city keep working

### Requirement: Inventory filter state in the URL
Committing an inventory facet SHALL navigate to the inventory list with that facet's key replaced — `coffeeName`, `originCountry`, `originRegion`, `process`, `producer` or `city`, trimmed, an empty value removing the key — keeping every other key. The inventory read SHALL carry exactly the facet keys the address carries, by those names; a value longer than its key's limit (`coffeeName` 150, `originCountry` 60, `originRegion` 90, `process` 60, `producer` 150, `city` 90) SHALL be dropped before the request and its facet SHALL show no value, and no other key of the address SHALL reach the request.

#### Scenario: Commit a text facet
- **WHEN** the coffeeshop chooses "Huila" in Region while `originCountry=Colombia` is applied
- **THEN** the address carries `originRegion=Huila`, keeps the other filters, and the read is sent again with `originRegion=Huila`

#### Scenario: Out-of-range value in the address
- **WHEN** the address carries a `city` longer than 90 characters and an unknown key
- **THEN** neither the `city` key nor the unknown key is sent to the API, and the Roastery city facet shows no value
