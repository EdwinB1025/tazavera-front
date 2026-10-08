## MODIFIED Requirements

### Requirement: Offering facets in the sidebar

The public offerings list (`/{locale}/offerings`, any query) SHALL show, in its sidebar, for every session state, a facet panel titled "Filters" that holds these facets in this order, each writing the listed query key:

| # | Facet | Control | Query key |
|---|---|---|---|
| 1 | Coffee | combobox that searches while typing, at most 150 characters | `coffeeName` |
| 2 | Verification | single choice: Any, Verified, Provisional | `verified` (`1` Verified, `0` Provisional) |
| 3 | Average score | score range 0–100 | `cuppingAvgMin`, `cuppingAvgMax` |
| 4 | Taste notes | taxonomy cascade, levels 0 and 1 | `cataRef` (repeated, one value per selected note) |
| 5 | Origin country | single choice with "see more" | `originCountry` |
| 6 | Origin region | single choice with "see more" | `originRegion` |
| 7 | Process | single choice with "see more" | `process` |
| 8 | Variety | single choice with "see more" | `variety` |
| 9 | Producer | combobox over the loaded options | `producer` |
| 10 | Roastery | combobox that searches while typing | `roasteryName` |
| 11 | City | text field, at most 90 characters, help "Exact city name" | `city` |

The Coffee and Roastery comboboxes SHALL behave alike: choosing an option SHALL write the option's name to the facet's key, and clearing the combobox SHALL remove the key.

The offering detail route and every other public route SHALL show no offering facets.

#### Scenario: Anonymous visitor sees the facets
- **WHEN** an anonymous visitor opens `/{locale}/offerings`
- **THEN** the sidebar shows the "Filters" panel with the eleven facets in the order of the table

#### Scenario: Choosing a coffee
- **WHEN** the visitor chooses "Huila El Mirador" in the Coffee combobox
- **THEN** the list navigates to the same path with `coffeeName=Huila El Mirador` and without `page`

#### Scenario: Detail route has no facets
- **WHEN** a visitor opens `/{locale}/offerings/{ulid}`
- **THEN** no offering facet is shown

### Requirement: Offering facet options

Single-choice facets and the Producer combobox SHALL list the distinct non-empty values of the matching coffee field returned by the coffee catalog (`country`, `region`, `process`, `variety`, `producer`), sorted alphabetically, without duplicates or empty values; each single-choice facet SHALL list "Any" first. Origin region SHALL list every region, independent of the selected country. Taste notes SHALL list the level-0 taxonomy nodes with their level-1 children, named in the active locale. Roastery SHALL show the roasteries whose name matches the typed text, as returned by the API. Coffee SHALL show the coffees whose name matches the typed text, as returned by the API, one option per distinct name, each with a second line joining its `country`, `region`, `process` and `variety` with " · ", empty fields skipped and the line omitted when every one is empty. Values SHALL be shown as the API returns them.

#### Scenario: Distinct sorted options
- **WHEN** the coffee catalog returns the processes `washed`, `natural`, `washed` and an empty value
- **THEN** the Process facet lists "Any", `natural`, `washed`, in that order

#### Scenario: Roastery search
- **WHEN** the visitor types "nóm" in the Roastery combobox
- **THEN** the combobox lists the roasteries the API returns for that name, each with its description

#### Scenario: Coffee search
- **WHEN** the visitor types "hui" in the Coffee combobox
- **THEN** the combobox lists the coffees the API returns for that name, each with its non-empty country, region, process and variety joined by " · "
