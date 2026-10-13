## MODIFIED Requirements

### Requirement: Inventory facets in the sidebar
On the inventory list `/{locale}/manage/inventory` the sidebar SHALL hold the facet panel titled "Filters" in the sub-section of the "Explore coffee inventory" entry, with the behaviour of "Sidebar facets sub-section", holding in this order: Coffee name, a combobox that searches coffees while typing (at most 150 characters), with the options of the Coffee combobox of "Offering facet options", the searching, no-match, error and placeholder texts of the offering Coffee combobox, and the loading behaviour of "Facet comboboxes loaded on first opening"; choosing an option SHALL write its name to `coffeeName` and clearing the combobox SHALL remove the key; then five text facets, each limited to the contract's maximum length: Country (60), Region (90), Process (60), Producer (150) and City (90). Each facet SHALL show the value the address carries. The panel SHALL hold no other facet.

#### Scenario: Facets in order
- **WHEN** the inventory list renders its sidebar with the address `?coffeeName=geisha&city=Barcelona`
- **THEN** the panel shows Coffee name, Country, Region, Process, Producer and City in that order, Coffee name showing "geisha" and City showing "Barcelona"

#### Scenario: Choosing a coffee name
- **WHEN** the coffeeshop types "hui" in Coffee name and chooses "Huila El Mirador" while `originCountry=Colombia` is applied
- **THEN** the address carries `coffeeName=Huila El Mirador` and keeps `originCountry=Colombia`
